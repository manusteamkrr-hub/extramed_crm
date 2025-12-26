import localDB from '../lib/localDatabase';

// Enhanced error handling wrapper
const withErrorHandling = async (operation, fallback = null) => {
  try {
    return await operation();
  } catch (error) {
    console.error('Service operation failed:', error);
    
    // Handle specific error types
    if (error?.message?.includes('QuotaExceededError')) {
      alert('Storage quota exceeded. Please export and clean old data from the Storage Monitor.');
      // Attempt automatic cleanup
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

const patientService = {
  async getAllPatients() {
    return withErrorHandling(
      () => localDB?.select('patients'),
      []
    );
  },

  /**
   * Get all patients with success/error response format
   * Used by patient directory and other components expecting { success, data } format
   */
  async getPatients() {
    try {
      let patients = await this.getAllPatients();
      return {
        success: true,
        data: patients || [],
        isDemo: false
      };
    } catch (error) {
      console.error('Error fetching patients:', error);
      return {
        success: false,
        data: [],
        error: error?.message || 'Failed to load patients',
        isDemo: false
      };
    }
  },

  async getPatientById(id) {
    return withErrorHandling(
      async () => {
        let patients = await localDB?.select('patients', { id });
        const patient = patients?.[0] || null;
        return {
          success: !!patient,
          data: patient,
          error: patient ? null : 'Patient not found'
        };
      },
      { success: false, data: null, error: 'Failed to fetch patient' }
    );
  },

  async updatePatient(patientId, updates) {
    try {
      let patients = localDB?.getAll('patients') || [];
      const index = patients?.findIndex(p => p?.id === patientId);
      
      if (index !== -1) {
        patients[index] = {
          ...patients?.[index],
          ...updates,
          updated_at: new Date()?.toISOString()
        };
        
        localDB?.update('patients', patients);
        
        // Trigger refresh event
        window.dispatchEvent(new Event('patientUpdated'));
        
        return {
          success: true,
          data: patients?.[index]
        };
      }
      
      return {
        success: false,
        error: 'Patient not found'
      };
    } catch (error) {
      console.error('Error updating patient:', error);
      return {
        success: false,
        error: error?.message
      };
    }
  },

  async deletePatient(id) {
    return withErrorHandling(
      () => localDB?.delete('patients', id),
      false
    );
  },

  /**
   * Get patient statistics
   */
  async getStatistics() {
    try {
      const { data: allPatients } = localDB?.select('patients', {});
      
      const total = allPatients?.length || 0;
      const active = allPatients?.filter(p => p?.status === 'active')?.length || 0;
      const outpatient = allPatients?.filter(p => p?.status === 'outpatient')?.length || 0;

      // Get discharged this month
      const startOfMonth = new Date();
      startOfMonth?.setDate(1);
      startOfMonth?.setHours(0, 0, 0, 0);

      const { data: dischargedData } = localDB?.select('patients', {
        status: 'discharged',
        updated_at: { operator: 'gte', value: startOfMonth?.toISOString() }
      });

      const discharged = dischargedData?.length || 0;

      return {
        success: true,
        data: {
          total,
          totalChange: 0,
          active,
          activeChange: 0,
          outpatient,
          outpatientChange: 0,
          discharged
        }
      };
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      return { 
        success: false,
        data: {
          total: 0, 
          totalChange: 0, 
          active: 0, 
          activeChange: 0, 
          outpatient: 0, 
          outpatientChange: 0, 
          discharged: 0
        }
      };
    }
  },

  /**
   * Get dashboard statistics
   * Returns overall statistics for the dashboard
   */
  async getDashboardStatistics() {
    return withErrorHandling(
      async () => {
        let patients = await this.getAllPatients();
        const inpatients = JSON.parse(localStorage.getItem('inpatients') || '[]');
        const today = new Date()?.toISOString()?.split('T')?.[0];

        const todayAdmissions = inpatients?.filter(inp => 
          inp?.admissionDate?.startsWith(today)
        )?.length || 0;

        const todayDischarges = inpatients?.filter(inp => 
          inp?.status === 'discharged' && inp?.dischargeDate?.startsWith(today)
        )?.length || 0;

        const activeInpatients = inpatients?.filter(inp => 
          inp?.status === 'active'
        )?.length || 0;

        // ✅ FIX: Use registrationDate instead of createdAt to count new patients
        const newTodayCount = patients?.filter(p => {
          const regDate = p?.registrationDate || p?.createdAt || '';
          return regDate?.startsWith(today);
        })?.length || 0;

        return {
          success: true,
          data: {
            totalPatients: patients?.length || 0,
            activePatients: patients?.filter(p => p?.status === 'active')?.length || 0,
            newAdmissions: newTodayCount, // ✅ FIX: Show newly registered patients
            pendingDischarges: todayDischarges,
            alertPatients: 0, // This would need additional logic based on medical conditions
            lastUpdated: new Date()?.toISOString()
          }
        };
      },
      {
        success: true,
        data: {
          totalPatients: 0,
          activePatients: 0,
          newAdmissions: 0,
          pendingDischarges: 0,
          alertPatients: 0,
          lastUpdated: new Date()?.toISOString()
        }
      }
    );
  },

  async searchPatients(searchTerm) {
    return withErrorHandling(
      () => {
        let patients = localDB?.select('patients');
        if (!searchTerm) return patients;

        const term = searchTerm?.toLowerCase();
        return patients?.filter(patient => 
          patient?.firstName?.toLowerCase()?.includes(term) ||
          patient?.lastName?.toLowerCase()?.includes(term) ||
          patient?.passport?.toLowerCase()?.includes(term) ||
          patient?.pinfl?.includes(term)
        );
      },
      []
    );
  },

  /**
   * Get paginated patients with optimized loading
   * @param {Object} options - Pagination options
   * @param {number} options.page - Page number (1-indexed)
   * @param {number} options.pageSize - Number of items per page
   * @param {Object} options.filters - Filter criteria
   * @param {Object} options.sort - Sort configuration { key, direction }
   * @returns {Promise<Object>} - { success, data, pagination }
   */
  async getPaginatedPatients(options = {}) {
    const {
      page = 1,
      pageSize = 25,
      filters = {},
      sort = { key: 'createdAt', direction: 'desc' }
    } = options;

    return withErrorHandling(
      async () => {
        // Get all patients first
        let patients = await this.getAllPatients();

        // Apply filters
        if (filters?.searchQuery) {
          const query = filters?.searchQuery?.toLowerCase();
          patients = patients?.filter(patient => {
            const fullName = `${patient?.firstName || ''} ${patient?.middleName || ''} ${patient?.lastName || ''}`?.toLowerCase();
            const mrn = (patient?.medicalRecordNumber || patient?.mrn || '')?.toLowerCase();
            const diagnosis = (patient?.diagnosis || '')?.toLowerCase();
            
            return fullName?.includes(query) || 
                   mrn?.includes(query) || 
                   diagnosis?.includes(query);
          });
        }

        // Apply additional filters
        Object.keys(filters)?.forEach(key => {
          if (key === 'searchQuery') return; // Already handled

          const filterValue = filters?.[key];
          if (!filterValue) return;

          switch (key) {
            case 'status':
              patients = patients?.filter(p => p?.status === filterValue);
              break;
            case 'gender':
              patients = patients?.filter(p => p?.gender === filterValue);
              break;
            case 'insurance':
              patients = patients?.filter(p => p?.insurance === filterValue);
              break;
            case 'ageFrom':
              patients = patients?.filter(p => {
                let age = calculateAge(p?.dateOfBirth);
                return age >= parseInt(filterValue);
              });
              break;
            case 'ageTo':
              patients = patients?.filter(p => {
                let age = calculateAge(p?.dateOfBirth);
                return age <= parseInt(filterValue);
              });
              break;
            default:
              break;
          }
        });

        // Apply sorting
        if (sort?.key) {
          patients?.sort((a, b) => {
            const aValue = a?.[sort?.key];
            const bValue = b?.[sort?.key];
            
            if (sort?.direction === 'asc') {
              return aValue > bValue ? 1 : -1;
            } else {
              return aValue < bValue ? 1 : -1;
            }
          });
        }

        // Calculate pagination
        const totalItems = patients?.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        // Get paginated subset
        const paginatedPatients = patients?.slice(startIndex, endIndex);

        return {
          success: true,
          data: paginatedPatients,
          pagination: {
            page,
            pageSize,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
          },
          isDemo: false
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
        error: 'Failed to load paginated patients',
        isDemo: false
      }
    );
  }
};

// Helper function to calculate age
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today?.getFullYear() - birthDate?.getFullYear();
  const monthDiff = today?.getMonth() - birthDate?.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today?.getDate() < birthDate?.getDate())) {
    age--;
  }
  
  return age;
}

// Export the service object directly as default
export default patientService;