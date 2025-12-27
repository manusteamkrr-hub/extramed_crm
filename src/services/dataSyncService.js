/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🔄 DATA SYNCHRONIZATION SERVICE
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * Purpose: Centralized data synchronization layer ensuring patient name,
 * physician assignment, and room type automatically flow from Patient Profile
 * through Estimates to Inpatient Journal without manual updates.
 * 
 * Architecture:
 * - Single Source of Truth: Patient profile data
 * - Automatic Cascading: Changes propagate to all dependent records
 * - Real-time Sync: Updates trigger immediate refresh across modules
 * - Data Integrity: Validates and maintains consistency across tables
 * 
 * Data Flow:
 * Patient Profile → Estimates → Inpatient Journal
 *     ↓                ↓              ↓
 *   name          room_type    attending_physician
 * ═══════════════════════════════════════════════════════════════════════
 */

import localDB from '../lib/localDatabase';
import patientService from './patientService';
import estimateService from './estimateService';
import inpatientService from './inpatientService';

class DataSyncService {
  constructor() {
    this.syncQueue = [];
    this.isSyncing = false;
    this.listeners = new Map();
    
    // Initialize event listeners for automatic sync
    this.initializeEventListeners();
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * 🎯 CORE SYNCHRONIZATION METHODS
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Synchronize patient data across all related records
   * @param {string} patientId - Patient identifier
   * @param {Object} updates - Updated patient data
   */
  async syncPatientData(patientId, updates = {}) {
    console.log('🔄 [DataSync] Starting patient data synchronization', { patientId, updates });

    try {
      // 1. Get updated patient data
      const patientResult = await patientService?.getPatientById(patientId);
      const patient = patientResult?.data;

      if (!patient) {
        console.warn('⚠️ [DataSync] Patient not found:', patientId);
        return { success: false, error: 'Patient not found' };
      }

      // 2. Extract synchronized fields from patient profile
      const syncData = {
        // Patient name (primary identifier)
        name: patient?.name || `${patient?.firstName || ''} ${patient?.lastName || ''}`?.trim(),
        
        // Physician assignment from patient profile
        attending_physician: updates?.attending_physician || 
                           updates?.attendingPhysician || 
                           patient?.attending_physician || 
                           patient?.attendingPhysician || 
                           'Не назначен',
        
        // Additional patient context
        medicalRecordNumber: patient?.medicalRecordNumber || patient?.medical_record_number,
        patientId: patient?.id
      };

      console.log('📊 [DataSync] Sync data prepared:', syncData);

      // 3. Sync to estimates
      await this.syncEstimatesForPatient(patientId, syncData);

      // 4. Sync to inpatient records
      await this.syncInpatientsForPatient(patientId, syncData);

      // 5. Trigger UI refresh events
      this.notifyListeners('patient:updated', { patientId, syncData });
      window.dispatchEvent(new CustomEvent('dataSyncComplete', { 
        detail: { type: 'patient', patientId, syncData } 
      }));

      console.log('✅ [DataSync] Patient data synchronization complete');

      return { success: true, syncData };

    } catch (error) {
      console.error('❌ [DataSync] Patient sync failed:', error);
      return { success: false, error: error?.message };
    }
  }

  /**
   * Synchronize estimate data and extract room type for inpatient records
   * @param {string} estimateId - Estimate identifier
   * @param {Object} estimateData - Estimate data with services
   */
  async syncEstimateData(estimateId, estimateData) {
    console.log('🔄 [DataSync] Starting estimate data synchronization', { estimateId });

    try {
      const patientId = estimateData?.patientId || estimateData?.patient_id;

      if (!patientId) {
        console.warn('⚠️ [DataSync] No patient ID in estimate:', estimateId);
        return { success: false, error: 'Patient ID required' };
      }

      // Extract room type from paid ward services
      let roomTypeData = this.extractRoomTypeFromEstimate(estimateData);

      if (roomTypeData?.roomType) {
        console.log('🏥 [DataSync] Room type extracted from estimate:', roomTypeData);

        // Update inpatient records with room type
        await this.syncInpatientRoomType(patientId, roomTypeData);

        // Trigger UI refresh
        this.notifyListeners('estimate:updated', { 
          estimateId, 
          patientId, 
          roomTypeData 
        });
        window.dispatchEvent(new CustomEvent('dataSyncComplete', { 
          detail: { type: 'estimate', estimateId, roomTypeData } 
        }));
      }

      console.log('✅ [DataSync] Estimate data synchronization complete');

      return { success: true, roomTypeData };

    } catch (error) {
      console.error('❌ [DataSync] Estimate sync failed:', error);
      return { success: false, error: error?.message };
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * 🔧 HELPER METHODS
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Extract room type from estimate services
   * @param {Object} estimateData - Estimate with services
   * @returns {Object} - Room type data
   */
  extractRoomTypeFromEstimate(estimateData) {
    const services = estimateData?.services || estimateData?.estimate_items || [];

    // Find ward/placement service
    const placementService = services?.find(service => {
      const category = (service?.category || service?.categoryName || service?.category_name || '')?.toLowerCase();
      const name = (service?.name || '')?.toLowerCase();
      const code = (service?.code || service?.service_code || '')?.toLowerCase();

      return (
        // Category detection
        (category?.includes('размещение') || 
        category?.includes('placement') ||
        category?.includes('госпитализ') ||
        category === 'ward_treatment'|| category?.includes('ward') ||
        category?.includes('палат') ||
        category?.includes('стационар') ||
        
        // Name detection
        name?.includes('палата') ||
        name?.includes('размещение') ||
        name?.includes('койко') ||
        name?.includes('bed') ||
        name?.includes('room') ||
        name?.includes('лечение в палате') ||
        
        // Code detection
        code?.includes('room') ||
        code?.includes('bed') || code?.includes('ward'))
      );
    });

    if (!placementService) {
      return { roomType: null, roomNumber: null };
    }

    // Determine room type from service details
    let roomType = 'standard';
    let roomNumber = 'Стандарт';
    
    const serviceName = (placementService?.name || '')?.toLowerCase();
    const serviceCode = (placementService?.code || placementService?.service_code || '')?.toLowerCase();
    const category = (placementService?.category || placementService?.categoryName || '')?.toLowerCase();

    if (serviceName?.includes('эконом') || serviceCode?.includes('economy') || category?.includes('эконом')) {
      roomType = 'economy';
      roomNumber = 'Эконом';
    } else if (serviceName?.includes('vip') || serviceCode?.includes('vip') || category?.includes('vip')) {
      roomType = 'vip';
      roomNumber = 'VIP';
    } else if (serviceName?.includes('комфорт') || serviceCode?.includes('comfort') || category?.includes('комфорт')) {
      roomType = 'comfort';
      roomNumber = 'Комфорт';
    }

    return {
      roomType,
      roomNumber,
      days: placementService?.days || placementService?.quantity || 1,
      serviceName: placementService?.name
    };
  }

  /**
   * Sync estimates for a specific patient
   * @param {string} patientId - Patient identifier
   * @param {Object} syncData - Data to sync
   */
  async syncEstimatesForPatient(patientId, syncData) {
    console.log('📝 [DataSync] Syncing estimates for patient:', patientId);

    try {
      const estimates = localDB?.select('estimates', { patientId }) || 
                       localDB?.select('estimates', { patient_id: patientId }) || [];

      if (estimates?.length === 0) {
        console.log('ℹ️ [DataSync] No estimates found for patient:', patientId);
        return;
      }

      // Update each estimate with synchronized patient data
      for (const estimate of estimates) {
        await estimateService?.updateEstimate(estimate?.id, {
          // Keep existing estimate data
          ...estimate,
          // Sync patient name and physician
          patient_name: syncData?.name,
          patientName: syncData?.name,
          updated_at: new Date()?.toISOString()
        });
      }

      console.log(`✅ [DataSync] Updated ${estimates?.length} estimates`);

    } catch (error) {
      console.error('❌ [DataSync] Failed to sync estimates:', error);
    }
  }

  /**
   * Sync inpatient records for a specific patient
   * @param {string} patientId - Patient identifier
   * @param {Object} syncData - Data to sync
   */
  async syncInpatientsForPatient(patientId, syncData) {
    console.log('🏥 [DataSync] Syncing inpatient records for patient:', patientId);

    try {
      const inpatients = localDB?.select('inpatients', { patientId }) || 
                        localDB?.select('inpatients', { patient_id: patientId }) || [];

      if (inpatients?.length === 0) {
        console.log('ℹ️ [DataSync] No inpatient records found for patient:', patientId);
        return;
      }

      // Update each inpatient record with synchronized data
      for (const inpatient of inpatients) {
        await inpatientService?.updateInpatient(inpatient?.id, {
          // Keep existing inpatient data
          ...inpatient,
          // Sync patient name and physician
          name: syncData?.name,
          attending_physician: syncData?.attending_physician,
          attendingPhysician: syncData?.attending_physician,
          updated_at: new Date()?.toISOString()
        });
      }

      console.log(`✅ [DataSync] Updated ${inpatients?.length} inpatient records`);

    } catch (error) {
      console.error('❌ [DataSync] Failed to sync inpatient records:', error);
    }
  }

  /**
   * Sync room type to inpatient records from estimate
   * @param {string} patientId - Patient identifier
   * @param {Object} roomTypeData - Room type information
   */
  async syncInpatientRoomType(patientId, roomTypeData) {
    console.log('🏥 [DataSync] Syncing room type for inpatient:', { patientId, roomTypeData });

    try {
      const inpatients = localDB?.select('inpatients', { patientId }) || 
                        localDB?.select('inpatients', { patient_id: patientId }) || [];

      if (inpatients?.length === 0) {
        console.log('ℹ️ [DataSync] No inpatient records found for room type sync');
        return;
      }

      // Update inpatient records with room type
      for (const inpatient of inpatients) {
        // Only update if room type is different
        if (inpatient?.room_type !== roomTypeData?.roomType || 
            inpatient?.roomType !== roomTypeData?.roomType) {
          
          await inpatientService?.updateInpatient(inpatient?.id, {
            ...inpatient,
            room_type: roomTypeData?.roomType,
            roomType: roomTypeData?.roomType,
            room_number: roomTypeData?.roomNumber,
            roomNumber: roomTypeData?.roomNumber,
            updated_at: new Date()?.toISOString()
          });

          console.log('✅ [DataSync] Room type updated:', {
            inpatientId: inpatient?.id,
            oldType: inpatient?.room_type || inpatient?.roomType,
            newType: roomTypeData?.roomType
          });
        }
      }

    } catch (error) {
      console.error('❌ [DataSync] Failed to sync room type:', error);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * 🔔 EVENT SYSTEM
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Initialize event listeners for automatic synchronization
   */
  initializeEventListeners() {
    // Listen for patient updates
    window.addEventListener('patientUpdated', (event) => {
      const patientData = event?.detail;
      if (patientData?.id) {
        this.queueSync('patient', patientData?.id, patientData);
      }
    });

    // Listen for estimate updates
    window.addEventListener('estimateCreated', (event) => {
      const estimateData = event?.detail;
      if (estimateData?.id && estimateData?.patientId) {
        this.queueSync('estimate', estimateData?.id, estimateData);
      }
    });

    window.addEventListener('estimateUpdated', (event) => {
      const estimateData = event?.detail;
      if (estimateData?.id && estimateData?.patientId) {
        this.queueSync('estimate', estimateData?.id, estimateData);
      }
    });

    console.log('✅ [DataSync] Event listeners initialized');
  }

  /**
   * Queue a sync operation for batch processing
   * @param {string} type - Type of sync (patient, estimate)
   * @param {string} id - Record identifier
   * @param {Object} data - Data to sync
   */
  queueSync(type, id, data) {
    this.syncQueue?.push({ type, id, data, timestamp: Date.now() });
    
    // Process queue after short delay (debounce)
    clearTimeout(this.syncTimeout);
    this.syncTimeout = setTimeout(() => {
      this.processSyncQueue();
    }, 500);
  }

  /**
   * Process queued sync operations
   */
  async processSyncQueue() {
    if (this.isSyncing || this.syncQueue?.length === 0) {
      return;
    }

    this.isSyncing = true;
    console.log(`🔄 [DataSync] Processing ${this.syncQueue?.length} queued sync operations`);

    try {
      // Process all queued operations
      while (this.syncQueue?.length > 0) {
        const operation = this.syncQueue?.shift();

        if (operation?.type === 'patient') {
          await this.syncPatientData(operation?.id, operation?.data);
        } else if (operation?.type === 'estimate') {
          await this.syncEstimateData(operation?.id, operation?.data);
        }
      }

      console.log('✅ [DataSync] Queue processing complete');

    } catch (error) {
      console.error('❌ [DataSync] Queue processing failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Register a listener for sync events
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners?.has(event)) {
      this.listeners?.set(event, []);
    }
    this.listeners?.get(event)?.push(callback);
  }

  /**
   * Notify registered listeners of sync events
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  notifyListeners(event, data) {
    const callbacks = this.listeners?.get(event) || [];
    callbacks?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`❌ [DataSync] Listener callback failed for ${event}:`, error);
      }
    });
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * 🔍 UTILITY METHODS
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Get synchronized patient data with all related information
   * @param {string} patientId - Patient identifier
   * @returns {Object} - Complete synchronized patient data
   */
  async getSyncedPatientData(patientId) {
    try {
      // Get patient profile
      const patientResult = await patientService?.getPatientById(patientId);
      const patient = patientResult?.data;

      if (!patient) {
        return null;
      }

      // Get related estimates
      const estimates = localDB?.select('estimates', { patientId }) || 
                       localDB?.select('estimates', { patient_id: patientId }) || [];

      // Get inpatient records
      const inpatients = localDB?.select('inpatients', { patientId }) || 
                        localDB?.select('inpatients', { patient_id: patientId }) || [];

      // Extract room type from most recent estimate
      let roomTypeData = null;
      const recentEstimate = estimates
        ?.sort((a, b) => new Date(b?.created_at) - new Date(a?.created_at))?.[0];
      
      if (recentEstimate) {
        roomTypeData = this.extractRoomTypeFromEstimate(recentEstimate);
      }

      return {
        patient,
        estimates,
        inpatients,
        roomTypeData,
        syncStatus: {
          hasEstimates: estimates?.length > 0,
          hasInpatientRecords: inpatients?.length > 0,
          roomTypeAssigned: !!roomTypeData?.roomType
        }
      };

    } catch (error) {
      console.error('❌ [DataSync] Failed to get synced patient data:', error);
      return null;
    }
  }

  /**
   * Force immediate synchronization for a patient
   * @param {string} patientId - Patient identifier
   */
  async forceSyncPatient(patientId) {
    console.log('⚡ [DataSync] Force sync triggered for patient:', patientId);
    return await this.syncPatientData(patientId);
  }

  /**
   * Check sync status for a patient
   * @param {string} patientId - Patient identifier
   * @returns {Object} - Sync status information
   */
  async checkSyncStatus(patientId) {
    const syncedData = await this.getSyncedPatientData(patientId);
    
    if (!syncedData) {
      return { synced: false, error: 'Patient not found' };
    }

    // Check if all data is synchronized
    const patient = syncedData?.patient;
    const inpatients = syncedData?.inpatients || [];
    const estimates = syncedData?.estimates || [];

    const issues = [];

    // Check patient name sync
    inpatients?.forEach(inpatient => {
      if (!inpatient?.name || inpatient?.name === 'Unknown Patient') {
        issues?.push(`Inpatient record ${inpatient?.id} missing patient name`);
      }
    });

    // Check physician sync
    inpatients?.forEach(inpatient => {
      const physician = inpatient?.attending_physician || inpatient?.attendingPhysician;
      if (!physician || physician === 'НеUnnamed') {
        issues?.push(`Inpatient record ${inpatient?.id} missing physician assignment`);
      }
    });

    // Check room type sync
    if (estimates?.length > 0 && inpatients?.length > 0) {
      let roomTypeData = syncedData?.roomTypeData;
      if (roomTypeData?.roomType) {
        inpatients?.forEach(inpatient => {
          let roomType = inpatient?.room_type || inpatient?.roomType;
          if (!roomType || roomType !== roomTypeData?.roomType) {
            issues?.push(`Inpatient record ${inpatient?.id} room type mismatch`);
          }
        });
      }
    }

    return {
      synced: issues?.length === 0,
      issues,
      data: syncedData
    };
  }
}

// Create singleton instance
const dataSyncService = new DataSyncService();

export default dataSyncService;