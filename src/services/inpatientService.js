import localDB from '../lib/localDatabase';

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
        let inpatients = localDB?.select('inpatients') || [];
        const patients = localDB?.select('patients') || [];
        const estimates = localDB?.select('estimates') || [];
        
        // Track patients already in inpatient records
        const inpatientPatientIds = new Set(inpatients?.map(inp => inp?.patientId || inp?.patient_id));
        
        // Enrich inpatient records with patient data
        const enrichedInpatients = inpatients?.map(inpatient => {
          const patient = patients?.find(p => p?.id === (inpatient?.patientId || inpatient?.patient_id));
          return {
            ...inpatient,
            patients: patient || {},
            source: 'inpatient_record'
          };
        });
        
        // Find patients with active placement services who are NOT in inpatient records
        const placementBasedPatients = [];
        
        patients?.forEach(patient => {
          // Skip if already in inpatient records
          if (inpatientPatientIds?.has(patient?.id)) {
            return;
          }
          
          // Find active estimates for this patient (handle both field name formats)
          const patientEstimates = estimates?.filter(est => {
            const estPatientId = est?.patientId || est?.patient_id;
            return estPatientId === patient?.id && 
              (est?.status === 'active' || est?.status === 'paid' || est?.status === 'partially_paid');
          });
          
          // Check each estimate for placement services
          patientEstimates?.forEach(estimate => {
            // Check both services and estimate_items fields
            const services = estimate?.services || estimate?.estimate_items || [];
            
            // Look for placement/accommodation services
            const placementService = services?.find(service => {
              const category = (service?.category || '')?.toLowerCase();
              const name = (service?.name || '')?.toLowerCase();
              return category?.includes('размещение') || 
                     category?.includes('placement') ||
                     name?.includes('палата') ||
                     name?.includes('размещение');
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
              
              // Extract days from service or estimate total_days
              const days = placementService?.days || estimate?.total_days || estimate?.totalDays || placementService?.quantity || 1;
              const admissionDate = estimate?.createdAt || estimate?.created_at || new Date()?.toISOString();
              
              // Create inpatient-like record from placement service
              placementBasedPatients?.push({
                id: `placement_${patient?.id}_${estimate?.id}`,
                patientId: patient?.id,
                patient_id: patient?.id,
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
              });
            }
          });
        });
        
        // Combine both sources
        const allPatients = [...enrichedInpatients, ...placementBasedPatients];
        
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
        const rooms = localDB?.select('rooms') || [];
        let inpatients = localDB?.select('inpatients', { status: 'active' }) || [];
        const patients = localDB?.select('patients') || [];
        const estimates = localDB?.select('estimates') || [];
        
        // Track occupied beds by room type from multiple sources
        const occupancyByType = {};
        
        // Initialize capacity by room type
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
        
        // Count occupied beds from active inpatient records
        inpatients?.forEach(inpatient => {
          const room = rooms?.find(r => r?.id === (inpatient?.roomId || inpatient?.room_id));
          if (room) {
            let roomType = room?.type || 'standard';
            const patId = inpatient?.patientId || inpatient?.patient_id;
            if (occupancyByType?.[roomType] && !occupancyByType?.[roomType]?.occupiedBeds?.includes(patId)) {
              occupancyByType[roomType].occupied += 1;
              occupancyByType?.[roomType]?.occupiedBeds?.push(patId);
            }
          }
        });
        
        // Count occupied beds from active placement services in estimates
        patients?.forEach(patient => {
          // Skip if patient already counted in inpatients
          if (inpatients?.some(inp => (inp?.patientId || inp?.patient_id) === patient?.id)) {
            return;
          }
          
          // Find patient's estimates
          const patientEstimates = estimates?.filter(est => {
            const estPatientId = est?.patientId || est?.patient_id;
            return estPatientId === patient?.id && 
              (est?.status === 'active' || est?.status === 'paid' || est?.status === 'partially_paid');
          });
          
          // Check for placement services in estimates
          patientEstimates?.forEach(estimate => {
            const services = estimate?.services || estimate?.estimate_items || [];
            
            // Look for placement/accommodation services
            const placementService = services?.find(service => {
              const category = (service?.category || '')?.toLowerCase();
              const name = (service?.name || '')?.toLowerCase();
              return category?.includes('размещение') || 
                     category?.includes('placement') ||
                     name?.includes('палата') ||
                     name?.includes('размещение');
            });
            
            if (placementService) {
              // Determine room type from service name or code
              let roomType = 'standard'; // default
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
              
              // Add to occupancy if not already counted
              if (occupancyByType?.[roomType] && !occupancyByType?.[roomType]?.occupiedBeds?.includes(patient?.id)) {
                occupancyByType[roomType].occupied += 1;
                occupancyByType?.[roomType]?.occupiedBeds?.push(patient?.id);
              }
            }
          });
        });
        
        // Convert to array format expected by dashboard
        const capacityData = Object.values(occupancyByType)?.map(item => ({
          type: item?.type,
          capacity: item?.capacity,
          occupied: item?.occupied,
          available: item?.capacity - item?.occupied
        }));
        
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