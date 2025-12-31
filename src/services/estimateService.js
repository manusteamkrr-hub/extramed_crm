import { supabase } from '../lib/supabase';

const estimateService = {
  async getEstimates() {
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select(`
          *,
          patients (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching estimates:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  async getRevenueStatistics() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { data: paymentsToday, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .gte('payment_date', todayISO);

      if (paymentsError) throw paymentsError;

      const todayRevenue = paymentsToday.reduce((sum, p) => sum + Number(p.amount), 0);

      const [
        { count: pendingPaymentsCount },
        { count: activeEstimatesCount }
      ] = await Promise.all([
        supabase.from('estimates').select('*', { count: 'exact', head: true }).in('status', ['unpaid', 'partially_paid']),
        supabase.from('estimates').select('*', { count: 'exact', head: true }).neq('status', 'cancelled')
      ]);

      return {
        success: true,
        data: {
          todayRevenue,
          pendingPaymentsCount: pendingPaymentsCount || 0,
          activeEstimatesCount: activeEstimatesCount || 0,
          monthCollections: 0, // Placeholder, requires more complex query
        },
      };
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      return { success: false, data: null, error: error.message };
    }
  },

    async createEstimate(estimateData) {
    try {
      // Map frontend fields to database columns
      const dbData = {
        patient_id: estimateData.patientId,
        services: estimateData.services,
        total_amount: estimateData.totalAmount,
        paid_amount: estimateData.paidAmount,
        payment_method: estimateData.paymentMethod,
        status: estimateData.paymentStatus,
        insurance_type: estimateData.insuranceType,
        number: estimateData.number,
        created_at: estimateData.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('estimates')
        .insert([dbData])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating estimate:', error);
      return { success: false, data: null, error: error.message };
    }
  },
  async updateEstimate(id, updates) {
    try {
      const { data, error } = await supabase
        .from('estimates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating estimate:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteEstimate(id) {
    try {
      const { error } = await supabase.from('estimates').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting estimate:', error);
      return { success: false, error: error.message };
    }
  },
  async getEstimatesByPatient(patientId) {
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching estimates by patient:', error);
      return { success: false, data: [], error: error.message };
    }
  },
};

export default estimateService;
