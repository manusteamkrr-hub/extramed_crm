import { supabase } from '../lib/supabase';

const toSnakeCase = (obj) => {
  const newObj = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    newObj[snakeKey] = obj[key];
  }
  return newObj;
};

const patientService = {
  async getPatients() {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching patients:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  async getPatientById(id) {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching patient:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  async createPatient(patientData) {
    try {
      // Generate MRN if not provided
      const mrn = patientData.medicalRecordNumber || patientData.medical_record_number || this.generateMRN();
      
      // Convert camelCase to snake_case for Supabase
      const formattedData = toSnakeCase({
        ...patientData,
        medical_record_number: mrn,
        updated_at: new Date().toISOString()
      });
      
      const { data, error } = await supabase
        .from('patients')
        .insert([formattedData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating patient:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  async updatePatient(id, updates) {
    try {
      const formattedUpdates = toSnakeCase({
        ...updates,
        updated_at: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from('patients')
        .update(formattedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating patient:', error);
      return { success: false, error: error.message };
    }
  },

  async deletePatient(id) {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting patient:', error);
      return false;
    }
  },

  generateMRN() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `MRN-${year}${month}${day}-${random}`;
  },

  async getDashboardStatistics() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [
        { count: totalPatients },
        { count: activePatients },
        { count: newTodayCount }
      ] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('patients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('patients').select('*', { count: 'exact', head: true }).gte('created_at', today)
      ]);

      return {
        success: true,
        data: {
          totalPatients: totalPatients || 0,
          activePatients: activePatients || 0,
          newAdmissions: newTodayCount || 0,
          pendingDischarges: 0,
          alertPatients: 0
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, data: null };
    }
  }
};

export default patientService;
