import { supabase } from '../lib/supabase';

const MedicalHistoryService = {
  async getMedicalHistory(patientId) {
    try {
      const [
        { data: diagnoses },
        { data: medications },
        { data: allergies },
        { data: labResults },
        { data: procedures }
      ] = await Promise.all([
        supabase.from('diagnoses').select('*').eq('patient_id', patientId),
        supabase.from('medications').select('*').eq('patient_id', patientId),
        supabase.from('allergies').select('*').eq('patient_id', patientId),
        supabase.from('lab_results').select('*').eq('patient_id', patientId),
        supabase.from('procedures').select('*').eq('patient_id', patientId)
      ]);

      return {
        success: true,
        data: {
          diagnoses: diagnoses || [],
          medications: medications || [],
          allergies: allergies || [],
          labResults: labResults || [],
          procedures: procedures || []
        }
      };
    } catch (error) {
      console.error('Error fetching medical history:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  async addDiagnosis(diagnosisData) {
    try {
      const { data, error } = await supabase.from('diagnoses').insert([diagnosisData]).select().single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async addMedication(medicationData) {
    try {
      const { data, error } = await supabase.from('medications').insert([medicationData]).select().single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async addAllergy(allergyData) {
    try {
      const { data, error } = await supabase.from('allergies').insert([allergyData]).select().single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export default MedicalHistoryService;
