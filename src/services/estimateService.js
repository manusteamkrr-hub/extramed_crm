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

const EstimateService = {
  async getAllEstimates() {
    return withErrorHandling(
      () => localDB?.select('estimates'),
      []
    );
  },

  async getEstimatesByPatientId(patientId) {
    return withErrorHandling(
      () => localDB?.select('estimates', { patientId }),
      []
    );
  },

  async getEstimatesByPatient(patientId) {
    return withErrorHandling(
      async () => {
        const estimates = await localDB?.select('estimates', { patientId });
        return {
          success: true,
          data: estimates || []
        };
      },
      {
        success: false,
        data: [],
        error: 'Failed to fetch estimates'
      }
    );
  },

  async createEstimate(estimateData) {
    return withErrorHandling(
      async () => {
        // Calculate days from placement services (размещение)
        const placementService = estimateData?.services?.find(service => {
          const category = (service?.category || '')?.toLowerCase();
          const name = (service?.name || '')?.toLowerCase();
          return category?.includes('размещение') || 
                 category?.includes('placement') ||
                 name?.includes('палата') ||
                 name?.includes('размещение');
        });
        
        const totalDays = placementService?.days || 1;
        
        const estimate = {
          id: `EST-${Date.now()}`,
          patientId: estimateData?.patientId, // camelCase for consistency
          patient_id: estimateData?.patientId, // snake_case for database
          number: estimateData?.number,
          status: estimateData?.paymentStatus || 'unpaid',
          payment_method: estimateData?.paymentMethod,
          paymentMethod: estimateData?.paymentMethod,
          insurance_type: estimateData?.insuranceType,
          insuranceType: estimateData?.insuranceType,
          total_amount: estimateData?.totalAmount,
          totalAmount: estimateData?.totalAmount,
          paid_amount: estimateData?.paidAmount || 0,
          paidAmount: estimateData?.paidAmount || 0,
          outstanding_amount: estimateData?.totalAmount - (estimateData?.paidAmount || 0),
          outstandingAmount: estimateData?.totalAmount - (estimateData?.paidAmount || 0),
          total_days: totalDays, // Store total days for discharge calculation
          services: estimateData?.services?.map(service => ({
            id: service?.id,
            service_id: service?.id,
            service_code: service?.code,
            code: service?.code,
            name: service?.name,
            category: service?.category,
            price: service?.price,
            quantity: service?.quantity || 1,
            days: service?.days || 1,
            isDailyRate: service?.isDailyRate || false,
            is_daily_rate: service?.isDailyRate || false,
            unit: service?.unit || 'услуга',
            total: service?.price * (service?.isDailyRate ? (service?.days || 1) : 1) * (service?.quantity || 1)
          })),
          estimate_items: estimateData?.services?.map(service => ({
            service_id: service?.id,
            service_code: service?.code,
            name: service?.name,
            category: service?.category,
            price: service?.price,
            quantity: service?.quantity || 1,
            days: service?.days || 1,
            isDailyRate: service?.isDailyRate || false,
            is_daily_rate: service?.isDailyRate || false,
            unit: service?.unit || 'услуга',
            total: service?.price * (service?.isDailyRate ? (service?.days || 1) : 1) * (service?.quantity || 1)
          })),
          created_at: estimateData?.createdAt || new Date()?.toISOString(),
          createdAt: estimateData?.createdAt || new Date()?.toISOString(),
          updated_at: new Date()?.toISOString(),
          updatedAt: new Date()?.toISOString()
        };

        const result = await localDB?.insert('estimates', estimate);
        
        // Create financial operation record for tracking
        await this.createFinancialOperation({
          patient_id: estimateData?.patientId,
          estimate_id: estimate?.id,
          operation_type: 'estimate_created',
          amount: estimateData?.totalAmount,
          payment_method: estimateData?.paymentMethod,
          payment_status: estimateData?.paymentStatus,
          created_at: new Date()?.toISOString()
        });

        // Trigger dashboard update
        window.dispatchEvent(new CustomEvent('financialUpdate', { detail: estimate }));

        return {
          success: true,
          data: result
        };
      },
      {
        success: false,
        error: 'Failed to create estimate'
      }
    );
  },

  async createFinancialOperation(operationData) {
    return withErrorHandling(
      async () => {
        const operation = {
          id: `OP-${Date.now()}`,
          ...operationData
        };
        await localDB?.insert('financial_operations', operation);
        return operation;
      },
      null
    );
  },

  async getFinancialOperations(filters = {}) {
    return withErrorHandling(
      async () => {
        let operations = await localDB?.select('financial_operations', filters);
        return {
          success: true,
          data: operations || []
        };
      },
      {
        success: false,
        data: [],
        error: 'Failed to fetch financial operations'
      }
    );
  },

  async updateEstimate(id, updates) {
    return withErrorHandling(
      () => localDB?.update('estimates', id, updates),
      null
    );
  },

  async deleteEstimate(id) {
    return withErrorHandling(
      () => localDB?.delete('estimates', id),
      false
    );
  },

  async getRevenueStatistics() {
    return withErrorHandling(
      async () => {
        const estimates = await localDB?.select('estimates');
        const today = new Date();
        const todayStr = today?.toISOString()?.split('T')?.[0]; // YYYY-MM-DD format
        const thisMonth = `${today?.getFullYear()}-${String(today?.getMonth() + 1)?.padStart(2, '0')}`;

        // Filter estimates created today
        const todayEstimates = estimates?.filter(est => 
          est?.created_at?.startsWith(todayStr)
        );

        // Filter estimates for this month
        const monthlyEstimates = estimates?.filter(est => 
          est?.created_at?.startsWith(thisMonth)
        );

        // Calculate today's revenue from paid/partially paid estimates
        const todayRevenue = todayEstimates
          ?.filter(est => est?.status === 'paid' || est?.status === 'partially_paid')
          ?.reduce((sum, est) => sum + (parseFloat(est?.paid_amount) || 0), 0);

        // Count pending payments (unpaid and partially paid estimates)
        const pendingPaymentsCount = estimates
          ?.filter(est => est?.status === 'unpaid' || est?.status === 'partially_paid')
          ?.length || 0;

        // Count active estimates (not cancelled)
        const activeEstimatesCount = estimates
          ?.filter(est => est?.status !== 'cancelled')
          ?.length || 0;

        // Calculate monthly collections (all paid amounts this month)
        const monthCollections = monthlyEstimates
          ?.filter(est => est?.status === 'paid' || est?.status === 'partially_paid')
          ?.reduce((sum, est) => sum + (parseFloat(est?.paid_amount) || 0), 0);

        // Calculate total monthly revenue
        const totalRevenue = monthlyEstimates?.reduce((sum, est) => 
          sum + (parseFloat(est?.total_amount) || 0), 0
        );

        // Calculate paid revenue this month
        const paidRevenue = monthlyEstimates
          ?.filter(est => est?.status === 'paid' || est?.status === 'partially_paid')
          ?.reduce((sum, est) => sum + (parseFloat(est?.paid_amount) || 0), 0);

        // Calculate pending revenue (outstanding amounts)
        const pendingRevenue = monthlyEstimates
          ?.reduce((sum, est) => sum + (parseFloat(est?.outstanding_amount) || 0), 0);

        // Calculate debt (outstanding amounts from unpaid/partially paid)
        const debtAmount = monthlyEstimates
          ?.filter(est => est?.status === 'partially_paid' || est?.status === 'unpaid')
          ?.reduce((sum, est) => sum + (parseFloat(est?.outstanding_amount) || 0), 0);

        return {
          success: true,
          data: {
            // Dashboard-specific fields
            todayRevenue,
            pendingPaymentsCount,
            activeEstimatesCount,
            monthCollections,
            // Additional fields for reporting
            totalRevenue,
            paidRevenue,
            pendingRevenue,
            debtAmount,
            monthlyEstimates: monthlyEstimates?.length,
            todayEstimatesCount: todayEstimates?.length,
            lastUpdated: new Date()?.toISOString()
          }
        };
      },
      {
        success: true,
        data: {
          todayRevenue: 0,
          pendingPaymentsCount: 0,
          activeEstimatesCount: 0,
          monthCollections: 0,
          totalRevenue: 0,
          paidRevenue: 0,
          pendingRevenue: 0,
          debtAmount: 0,
          monthlyEstimates: 0,
          todayEstimatesCount: 0,
          lastUpdated: new Date()?.toISOString()
        }
      }
    );
  }
};

export default EstimateService;