import localDB from '../lib/localDatabase';
import realtimeSyncService from './realtimeSync';

// Enhanced error handling wrapper
const withErrorHandling = async (operation, fallback = null) => {
  try {
    return await operation();
  } catch (error) {
    console.error('Service operation failed:', error);
    
    if (error?.message?.includes('QuotaExceededError')) {
      alert('Storage quota exceeded. Please export and clean old data from the Storage Monitor.');
      localDB?.handleQuotaExceeded();
    } else if (error?.message?.includes('DataCorruptedError')) {
      alert('Data corruption detected. Attempting recovery from backup...');
      try {
        localDB?.restoreFromBackup();
        window.location?.reload();
      } catch (e) {
        alert('Recovery failed. Please restore from exported backup.');
      }
    } else if (error?.message?.includes('StorageUnavailableError')) {
      alert('Local storage is unavailable. Please check browser settings.');
    }
    
    return fallback;
  }
};

const InpatientService = {
  async getAllInpatients() {
    return withErrorHandling(
      () => localDB?.select('inpatients'),
      []
    );
  },

  async getInpatients() {
    return withErrorHandling(
      async () => {
        console.log('🔍 [InpatientService] Starting getInpatients fetch...');
        
        let inpatients = localDB?.select('inpatients') || [];
        const patients = localDB?.select('patients') || [];
        const estimates = localDB?.select('estimates') || [];
        
        console.log('📊 [InpatientService] Data counts:', {
          inpatients: inpatients?.length,
          patients: patients?.length,
          estimates: estimates?.length
        });
        
        // Track patients already in inpatient records
        const inpatientPatientIds = new Set(inpatients?.map(inp => inp?.patientId || inp?.patient_id));
        
        // Enrich inpatient records with patient data
        const enrichedInpatients = inpatients?.map(inpatient => {
          const patient = patients?.find(p => p?.id === (inpatient?.patientId || inpatient?.patient_id));
          return {
            ...inpatient,
            patients: patient || {},
            source: 'inpatient_record',
            name: patient?.name || inpatient?.name || 'Unknown',
            medicalRecordNumber: patient?.medicalRecordNumber || patient?.medical_record_number || inpatient?.medicalRecordNumber || '',
            roomNumber: inpatient?.room_number || inpatient?.roomNumber,
            roomType: inpatient?.room_type || inpatient?.roomType,
            admissionDate: inpatient?.admission_date || inpatient?.admissionDate,
            attendingPhysician: inpatient?.attending_physician || inpatient?.attendingPhysician || patient?.attendingPhysician || 'НеUnnamed',
            treatmentStatus: inpatient?.treatment_status || inpatient?.treatmentStatus || 'active',
            estimatedDischarge: inpatient?.estimated_discharge || inpatient?.estimatedDischarge,
            billingStatus: inpatient?.billing_status || inpatient?.billingStatus
          };
        });
        
        console.log('✅ [InpatientService] Enriched inpatients:', enrichedInpatients?.length);
        
        // Find patients with placement services from ANY estimate (regardless of status)
        const placementBasedPatients = [];
        
        patients?.forEach(patient => {
          // Skip if already in inpatient records
          if (inpatientPatientIds?.has(patient?.id)) {
            console.log(`⏭️ [InpatientService] Skipping patient ${patient?.name || patient?.id} - already in inpatient records`);
            return;
          }
          
          // Find ALL estimates for this patient (not just active/paid ones)
          const patientEstimates = estimates?.filter(est => {
            const estPatientId = est?.patientId || est?.patient_id;
            // Accept all statuses except 'cancelled'
            const isValidStatus = est?.status !== 'cancelled';
            return estPatientId === patient?.id && isValidStatus;
          });
          
          console.log(`👤 [InpatientService] Patient ${patient?.name || patient?.id}: ${patientEstimates?.length} valid estimates`);
          
          // Check each estimate for placement services
          patientEstimates?.forEach(estimate => {
            const services = estimate?.services || estimate?.estimate_items || [];
            
            console.log(`🔍 [InpatientService] Checking ${services?.length} services in estimate ${estimate?.id} for patient ${patient?.name || patient?.id}`);
            
            // ENHANCED LOGGING: Show all services for debugging
            if (services?.length > 0) {
              console.log('📋 [InpatientService] All services in estimate:', services?.map(s => ({
                name: s?.name,
                category: s?.category,
                code: s?.code || s?.service_code
              })));
            }
            
            // Look for placement/accommodation services with BROADER search
            const placementService = services?.find(service => {
              const category = (service?.category || '')?.toLowerCase();
              const name = (service?.name || '')?.toLowerCase();
              const code = (service?.code || service?.service_code || '')?.toLowerCase();
              
              // Expanded search criteria to catch more variations
              const isPlacement = 
                category?.includes('размещение') || 
                category?.includes('placement') ||
                category?.includes('госпитализ') ||
                category?.includes('hospitalization') ||
                name?.includes('палата') ||
                name?.includes('размещение') ||
                name?.includes('койко') ||
                name?.includes('bed') ||
                name?.includes('room') ||
                code?.includes('room') ||
                code?.includes('bed') ||
                code?.includes('plac');
              
              if (isPlacement) {
                console.log('✅ [InpatientService] FOUND placement service:', {
                  patient: patient?.name || patient?.id,
                  service: service?.name,
                  category: service?.category,
                  code: service?.code || service?.service_code,
                  estimateStatus: estimate?.status
                });
              } else {
                console.log('❌ [InpatientService] NOT placement:', {
                  name: service?.name,
                  category: service?.category,
                  code: service?.code || service?.service_code
                });
              }
              
              return isPlacement;
            });
            
            if (placementService) {
              // Determine room type from service details
              let roomType = 'standard';
              let roomNumber = 'Не назначена';
              
              const serviceName = (placementService?.name || '')?.toLowerCase();
              const serviceCode = (placementService?.code || placementService?.service_code || '')?.toLowerCase();
              
              if (serviceName?.includes('эконом') || serviceCode?.includes('economy')) {
                roomType = 'economy';
                roomNumber = 'Эконом';
              } else if (serviceName?.includes('vip') || serviceCode?.includes('vip')) {
                roomType = 'vip';
                roomNumber = 'VIP';
              } else if (serviceName?.includes('комфорт') || serviceCode?.includes('comfort')) {
                roomType = 'comfort';
                roomNumber = 'Комфорт';
              } else if (serviceName?.includes('стандарт') || serviceCode?.includes('standard')) {
                roomType = 'standard';
                roomNumber = 'Стандарт';
              }
              
              const days = placementService?.days || estimate?.total_days || estimate?.totalDays || placementService?.quantity || 1;
              const admissionDate = estimate?.createdAt || estimate?.created_at || new Date()?.toISOString();
              
              // Create inpatient-like record from placement service
              const inpatientRecord = {
                id: `placement_${patient?.id}_${estimate?.id}`,
                patientId: patient?.id,
                patient_id: patient?.id,
                name: patient?.name || 'Unknown Patient',
                medicalRecordNumber: patient?.medicalRecordNumber || patient?.medical_record_number || '',
                room_number: roomNumber,
                roomNumber: roomNumber,
                room_type: roomType,
                roomType: roomType,
                admission_date: admissionDate,
                admissionDate: admissionDate,
                estimated_discharge: calculateDischargeDate(admissionDate, days),
                estimatedDischarge: calculateDischargeDate(admissionDate, days),
                discharge_date: calculateDischargeDate(admissionDate, days),
                dischargeDate: calculateDischargeDate(admissionDate, days),
                attending_physician: patient?.attendingPhysician || patient?.attending_physician || 'НеUnnamed',
                attendingPhysician: patient?.attendingPhysician || patient?.attending_physician || 'НеUnnamed',
                treatment_status: 'active',
                treatmentStatus: 'active',
                billing_status: estimate?.status,
                billingStatus: estimate?.status,
                status: 'active',
                patients: patient,
                source: 'placement_service',
                estimateId: estimate?.id,
                placementServiceId: placementService?.id || placementService?.service_id,
                totalDays: days
              };
              
              placementBasedPatients?.push(inpatientRecord);
              console.log('✨ [InpatientService] Created placement-based inpatient:', {
                patient: patient?.name || patient?.id,
                roomType,
                roomNumber,
                days,
                estimateStatus: estimate?.status,
                record: inpatientRecord
              });
            }
          });
        });
        
        console.log('🏥 [InpatientService] Placement-based inpatients:', placementBasedPatients?.length);
        
        // Combine both sources
        const allPatients = [...enrichedInpatients, ...placementBasedPatients];
        
        console.log('📋 [InpatientService] Total inpatients to return:', allPatients?.length);
        console.log('📊 [InpatientService] Final breakdown:', {
          fromInpatientTable: enrichedInpatients?.length,
          fromPlacementServices: placementBasedPatients?.length,
          total: allPatients?.length
        });
        
        if (allPatients?.length > 0) {
          console.log('📝 [InpatientService] Sample patient data:', allPatients?.[0]);
        }
        
        return { success: true, data: allPatients };
      },
      { success: false, data: [], error: 'Failed to fetch inpatients' }
    );
  },

  async getInpatientById(id) {
    return withErrorHandling(
      () => {
        let inpatients = localDB?.select('inpatients', { id });
        return inpatients?.[0] || null;
      },
      null
    );
  },

  async createInpatient(inpatientData) {
    return withErrorHandling(
      () => localDB?.insert('inpatients', inpatientData),
      null
    );
  },

  async updateInpatient(id, updates) {
    return withErrorHandling(
      () => localDB?.update('inpatients', id, updates),
      null
    );
  },

  async deleteInpatient(id) {
    return withErrorHandling(
      () => localDB?.delete('inpatients', id),
      false
    );
  },

  async getActiveInpatients() {
    return withErrorHandling(
      () => localDB?.select('inpatients', { status: 'active' }),
      []
    );
  },

  async getRoomOccupancy() {
    return withErrorHandling(
      () => {
        const rooms = localDB?.select('rooms');
        let inpatients = localDB?.select('inpatients', { status: 'active' });
        
        return rooms?.map(room => {
          const occupied = inpatients?.filter(inp => inp?.roomId === room?.id);
          return {
            ...room,
            occupiedBeds: occupied?.length,
            availableBeds: room?.totalBeds - occupied?.length,
            occupancyRate: Math.round((occupied?.length / room?.totalBeds) * 100)
          };
        });
      },
      []
    );
  },

  async getRoomCapacity() {
    return withErrorHandling(
      async () => {
        const defaultRoomTypes = {
          'economy': { type: 'economy', capacity: 10, occupied: 0, occupiedBeds: [] },
          'standard': { type: 'standard', capacity: 15, occupied: 0, occupiedBeds: [] },
          'comfort': { type: 'comfort', capacity: 8, occupied: 0, occupiedBeds: [] },
          'vip': { type: 'vip', capacity: 5, occupied: 0, occupiedBeds: [] }
        };
        
        const rooms = localDB?.select('rooms') || [];
        let inpatients = localDB?.select('inpatients', { status: 'active' }) || [];
        const patients = localDB?.select('patients') || [];
        const estimates = localDB?.select('estimates') || [];
        
        const occupancyByType = rooms?.length > 0 ? {} : { ...defaultRoomTypes };
        
        if (rooms?.length > 0) {
          rooms?.forEach(room => {
            let roomType = room?.type || 'standard';
            if (!occupancyByType?.[roomType]) {
              occupancyByType[roomType] = {
                type: roomType,
                capacity: 0,
                occupied: 0,
                occupiedBeds: []
              };
            }
            occupancyByType[roomType].capacity += room?.totalBeds || 0;
          });
        }
        
        inpatients?.forEach(inpatient => {
          let roomType = inpatient?.room_type || inpatient?.roomType || 'standard';
          const patId = inpatient?.patientId || inpatient?.patient_id;
          
          if (!occupancyByType?.[roomType]) {
            occupancyByType[roomType] = {
              type: roomType,
              capacity: 0,
              occupied: 0,
              occupiedBeds: []
            };
          }
          
          if (!occupancyByType?.[roomType]?.occupiedBeds?.includes(patId)) {
            occupancyByType[roomType].occupied += 1;
            occupancyByType?.[roomType]?.occupiedBeds?.push(patId);
          }
        });
        
        // Count patients with placement services (accept all non-cancelled estimates)
        patients?.forEach(patient => {
          if (inpatients?.some(inp => (inp?.patientId || inp?.patient_id) === patient?.id)) {
            return;
          }
          
          const patientEstimates = estimates?.filter(est => {
            const estPatientId = est?.patientId || est?.patient_id;
            // Accept all statuses except cancelled
            return estPatientId === patient?.id && est?.status !== 'cancelled';
          });
          
          patientEstimates?.forEach(estimate => {
            const services = estimate?.services || estimate?.estimate_items || [];
            
            const placementService = services?.find(service => {
              const category = (service?.category || '')?.toLowerCase();
              const name = (service?.name || '')?.toLowerCase();
              return category?.includes('размещение') || 
                     category?.includes('placement') ||
                     name?.includes('палата') ||
                     name?.includes('размещение');
            });
            
            if (placementService) {
              let roomType = 'standard';
              const serviceName = (placementService?.name || '')?.toLowerCase();
              const serviceCode = (placementService?.code || placementService?.service_code || '')?.toLowerCase();
              
              if (serviceName?.includes('эконом') || serviceCode?.includes('economy')) {
                roomType = 'economy';
              } else if (serviceName?.includes('vip') || serviceCode?.includes('vip')) {
                roomType = 'vip';
              } else if (serviceName?.includes('комфорт') || serviceCode?.includes('comfort')) {
                roomType = 'comfort';
              } else if (serviceName?.includes('стандарт') || serviceCode?.includes('standard')) {
                roomType = 'standard';
              }
              
              if (!occupancyByType?.[roomType]) {
                occupancyByType[roomType] = {
                  type: roomType,
                  capacity: defaultRoomTypes?.[roomType]?.capacity || 10,
                  occupied: 0,
                  occupiedBeds: []
                };
              }
              
              if (!occupancyByType?.[roomType]?.occupiedBeds?.includes(patient?.id)) {
                occupancyByType[roomType].occupied += 1;
                occupancyByType?.[roomType]?.occupiedBeds?.push(patient?.id);
              }
            }
          });
        });
        
        const capacityData = Object.keys(defaultRoomTypes)?.map(roomType => {
          if (occupancyByType?.[roomType]) {
            return {
              type: occupancyByType?.[roomType]?.type,
              capacity: occupancyByType?.[roomType]?.capacity || defaultRoomTypes?.[roomType]?.capacity,
              occupied: occupancyByType?.[roomType]?.occupied,
              available: (occupancyByType?.[roomType]?.capacity || defaultRoomTypes?.[roomType]?.capacity) - occupancyByType?.[roomType]?.occupied
            };
          }
          return {
            ...defaultRoomTypes?.[roomType],
            available: defaultRoomTypes?.[roomType]?.capacity
          };
        });
        
        return { success: true, data: capacityData };
      },
      { success: false, data: [] }
    );
  },

  /**
   * Get paginated inpatients with optimized loading
   * @param {Object} options - Pagination options
   * @param {number} options.page - Page number (1-indexed)
   * @param {number} options.pageSize - Number of items per page
   * @param {Object} options.filters - Filter criteria
   * @param {Object} options.sort - Sort configuration { key, direction }
   * @returns {Promise<Object>} - { success, data, pagination }
   */
  async getPaginatedInpatients(options = {}) {
    const {
      page = 1,
      pageSize = 25,
      filters = {},
      sort = { key: 'admissionDate', direction: 'desc' }
    } = options;

    return withErrorHandling(
      async () => {
        // Get all inpatients with patient data
        const result = await this.getInpatients();
        let inpatients = result?.data || [];

        // Apply filters
        if (filters?.searchQuery) {
          const query = filters?.searchQuery?.toLowerCase();
          inpatients = inpatients?.filter(inpatient => {
            const name = (inpatient?.patients?.name || inpatient?.name || '')?.toLowerCase();
            const mrn = (inpatient?.patients?.medical_record_number || inpatient?.medicalRecordNumber || '')?.toLowerCase();
            let roomNumber = (inpatient?.room_number || inpatient?.roomNumber || '')?.toLowerCase();
            
            return name?.includes(query) || 
                   mrn?.includes(query) || 
                   roomNumber?.includes(query);
          });
        }

        // Apply additional filters
        Object.keys(filters)?.forEach(key => {
          if (key === 'searchQuery') return; // Already handled

          const filterValue = filters?.[key];
          if (!filterValue || (Array.isArray(filterValue) && filterValue?.length === 0)) return;

          switch (key) {
            case 'roomTypes':
              if (Array.isArray(filterValue)) {
                inpatients = inpatients?.filter(i => filterValue?.includes(i?.room_type || i?.roomType));
              }
              break;
            case 'treatmentStatus':
              if (Array.isArray(filterValue)) {
                inpatients = inpatients?.filter(i => filterValue?.includes(i?.treatment_status || i?.treatmentStatus));
              }
              break;
            case 'physician':
              inpatients = inpatients?.filter(i => (i?.attending_physician || i?.attendingPhysician) === filterValue);
              break;
            case 'selectedRoom':
              inpatients = inpatients?.filter(i => (i?.room_number || i?.roomNumber) === filterValue);
              break;
            case 'admissionDateFrom':
              const fromDate = new Date(filterValue);
              inpatients = inpatients?.filter(i => {
                const admissionDate = new Date(i?.admission_date || i?.admissionDate);
                return admissionDate >= fromDate;
              });
              break;
            case 'admissionDateTo':
              const toDate = new Date(filterValue);
              toDate?.setHours(23, 59, 59, 999);
              inpatients = inpatients?.filter(i => {
                const admissionDate = new Date(i?.admission_date || i?.admissionDate);
                return admissionDate <= toDate;
              });
              break;
            default:
              break;
          }
        });

        // Apply sorting
        if (sort?.key) {
          inpatients?.sort((a, b) => {
            const aValue = a?.[sort?.key] || a?.[sort?.key?.replace(/_/g, '')];
            const bValue = b?.[sort?.key] || b?.[sort?.key?.replace(/_/g, '')];
            
            if (sort?.direction === 'asc') {
              return aValue > bValue ? 1 : -1;
            } else {
              return aValue < bValue ? 1 : -1;
            }
          });
        }

        // Calculate pagination
        const totalItems = inpatients?.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        // Get paginated subset
        const paginatedInpatients = inpatients?.slice(startIndex, endIndex);

        return {
          success: true,
          data: paginatedInpatients,
          pagination: {
            page,
            pageSize,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
          }
        };
      },
      {
        success: false,
        data: [],
        pagination: {
          page: 1,
          pageSize,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        },
        error: 'Failed to load paginated inpatients'
      }
    );
  }
};

export default InpatientService;

// Helper function to calculate discharge date
function calculateDischargeDate(admissionDate, days) {
  if (!admissionDate) return null;
  
  const admission = new Date(admissionDate);
  const discharge = new Date(admission);
  discharge?.setDate(discharge?.getDate() + days);
  
  return discharge?.toISOString();
}

async function createInpatientRecord(recordData) {
  try {
    const records = JSON.parse(localStorage.getItem('extramed_inpatient_records') || '[]');
    
    const newRecord = {
      id: crypto.randomUUID(),
      ...recordData,
      created_at: new Date()?.toISOString(),
      updated_at: new Date()?.toISOString()
    };

    records?.push(newRecord);
    localStorage.setItem('extramed_inpatient_records', JSON.stringify(records));
    
    // ✅ NEW: Real-time sync notification
    realtimeSyncService?.syncInpatientRecords('create', newRecord);

    // Legacy event support
    window.dispatchEvent(new CustomEvent('inpatientRecordCreated', {
      detail: newRecord
    }));

    return {
      success: true,
      data: newRecord
    };
  } catch (error) {
    console.error('Error creating inpatient record:', error);
    return {
      success: false,
      error: error?.message
    };
  }
}

async function updateInpatientRecord(recordId, updates) {
  try {
    const records = JSON.parse(localStorage.getItem('extramed_inpatient_records') || '[]');
    const index = records?.findIndex(r => r?.id === recordId);

    if (index === -1) {
      return {
        success: false,
        error: 'Inpatient record not found'
      };
    }

    records[index] = {
      ...records?.[index],
      ...updates,
      updated_at: new Date()?.toISOString()
    };

    localStorage.setItem('extramed_inpatient_records', JSON.stringify(records));
    
    // ✅ NEW: Real-time sync notification
    realtimeSyncService?.syncInpatientRecords('update', records?.[index]);

    // Legacy event support
    window.dispatchEvent(new CustomEvent('inpatientRecordUpdated', {
      detail: records[index]
    }));

    return {
      success: true,
      data: records?.[index]
    };
  } catch (error) {
    console.error('Error updating inpatient record:', error);
    return {
      success: false,
      error: error?.message
    };
  }
}

async function deleteInpatientRecord(recordId) {
  try {
    const records = JSON.parse(localStorage.getItem('extramed_inpatient_records') || '[]');
    const filteredRecords = records?.filter(r => r?.id !== recordId);

    localStorage.setItem('extramed_inpatient_records', JSON.stringify(filteredRecords));
    
    // ✅ NEW: Real-time sync notification
    realtimeSyncService?.syncInpatientRecords('delete', { id: recordId });

    // Legacy event support
    window.dispatchEvent(new CustomEvent('inpatientRecordDeleted', {
      detail: { id: recordId }
    }));

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting inpatient record:', error);
    return {
      success: false,
      error: error?.message
    };
  }
}