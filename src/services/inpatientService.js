import { supabase } from '../lib/supabase';

const InpatientService = {
  async getInpatients() {
    try {
      const { data, error } = await supabase
        .from('inpatients')
        .select(`
          *,
          patients (*)
        `)
        .order('admission_date', { ascending: false });

      if (error) throw error;
      
      // Map to match UI expectations if needed
      const enrichedData = data.map(item => ({
        ...item,
        name: item.patients?.name || 'Неизвестный пациент',
        medicalRecordNumber: item.patients?.medical_record_number || ''
      }));

      return { success: true, data: enrichedData };
    } catch (error) {
      console.error('Error fetching inpatients:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  async getRoomCapacity() {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*');

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching room capacity:', error);
      return { success: false, data: [] };
    }
  },

  async updateInpatient(id, updates) {
    try {
      const { data, error } = await supabase
        .from('inpatients')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating inpatient:', error);
      return { success: false, error: error.message };
    }
  }
};

export default InpatientService;
