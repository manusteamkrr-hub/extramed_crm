import localDB from '../lib/localDatabase';

// Enhanced error handling wrapper
const withErrorHandling = async (operation, fallback = null) => {
  try {
    return await operation();
  } catch (error) {
    console.error('Service operation failed:', error);
    
    if (error?.message?.includes('QuotaExceededError')) {
      alert('Storage quota exceeded. Medical history is being compressed. Please export data from Storage Monitor.');
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

const MedicalHistoryService = {
  // Main method expected by patient profile
  async getMedicalHistory(patientId) {
    return withErrorHandling(
      async () => {
        const diagnoses = await localDB?.select('diagnoses', { patient_id: patientId }) || [];
        const medications = await localDB?.select('medications', { patient_id: patientId }) || [];
        const allergies = await localDB?.select('allergies', { patient_id: patientId }) || [];
        const labResults = await localDB?.select('lab_results', { patient_id: patientId }) || [];
        const procedures = await localDB?.select('procedures', { patient_id: patientId }) || [];
        
        return {
          success: true,
          data: {
            diagnoses,
            medications,
            allergies,
            labResults,
            procedures
          }
        };
      },
      { success: false, data: null, error: 'Failed to fetch medical history' }
    );
  },

  async getHistoryByPatientId(patientId) {
    return withErrorHandling(
      () => localDB?.select('medical_history', { patientId }),
      []
    );
  },

  async addHistoryRecord(recordData) {
    return withErrorHandling(
      () => localDB?.insert('medical_history', recordData),
      null
    );
  },

  async updateHistoryRecord(id, updates) {
    return withErrorHandling(
      () => localDB?.update('medical_history', id, updates),
      null
    );
  },

  async deleteHistoryRecord(id) {
    return withErrorHandling(
      () => localDB?.delete('medical_history', id),
      false
    );
  },

  // Diagnosis methods
  async addDiagnosis(diagnosisData) {
    return withErrorHandling(
      async () => {
        const id = await localDB?.insert('diagnoses', diagnosisData);
        return { success: true, data: id };
      },
      { success: false, error: 'Failed to add diagnosis' }
    );
  },

  async updateDiagnosis(id, updates) {
    return withErrorHandling(
      async () => {
        await localDB?.update('diagnoses', id, updates);
        return { success: true };
      },
      { success: false, error: 'Failed to update diagnosis' }
    );
  },

  async deleteDiagnosis(id) {
    return withErrorHandling(
      async () => {
        await localDB?.delete('diagnoses', id);
        return { success: true };
      },
      { success: false, error: 'Failed to delete diagnosis' }
    );
  },

  // Medication methods
  async addMedication(medicationData) {
    return withErrorHandling(
      async () => {
        const id = await localDB?.insert('medications', medicationData);
        return { success: true, data: id };
      },
      { success: false, error: 'Failed to add medication' }
    );
  },

  async updateMedication(id, updates) {
    return withErrorHandling(
      async () => {
        await localDB?.update('medications', id, updates);
        return { success: true };
      },
      { success: false, error: 'Failed to update medication' }
    );
  },

  async deleteMedication(id) {
    return withErrorHandling(
      async () => {
        await localDB?.delete('medications', id);
        return { success: true };
      },
      { success: false, error: 'Failed to delete medication' }
    );
  },

  // Allergy methods
  async addAllergy(allergyData) {
    return withErrorHandling(
      async () => {
        const id = await localDB?.insert('allergies', allergyData);
        return { success: true, data: id };
      },
      { success: false, error: 'Failed to add allergy' }
    );
  },

  async updateAllergy(id, updates) {
    return withErrorHandling(
      async () => {
        await localDB?.update('allergies', id, updates);
        return { success: true };
      },
      { success: false, error: 'Failed to update allergy' }
    );
  },

  async deleteAllergy(id) {
    return withErrorHandling(
      async () => {
        await localDB?.delete('allergies', id);
        return { success: true };
      },
      { success: false, error: 'Failed to delete allergy' }
    );
  },

  // Lab result methods
  async addLabResult(labResultData) {
    return withErrorHandling(
      async () => {
        const id = await localDB?.insert('lab_results', labResultData);
        return { success: true, data: id };
      },
      { success: false, error: 'Failed to add lab result' }
    );
  },

  async updateLabResult(id, updates) {
    return withErrorHandling(
      async () => {
        await localDB?.update('lab_results', id, updates);
        return { success: true };
      },
      { success: false, error: 'Failed to update lab result' }
    );
  },

  async deleteLabResult(id) {
    return withErrorHandling(
      async () => {
        await localDB?.delete('lab_results', id);
        return { success: true };
      },
      { success: false, error: 'Failed to delete lab result' }
    );
  },

  // Procedure methods
  async addProcedure(procedureData) {
    return withErrorHandling(
      async () => {
        const id = await localDB?.insert('procedures', procedureData);
        return { success: true, data: id };
      },
      { success: false, error: 'Failed to add procedure' }
    );
  },

  async updateProcedure(id, updates) {
    return withErrorHandling(
      async () => {
        await localDB?.update('procedures', id, updates);
        return { success: true };
      },
      { success: false, error: 'Failed to update procedure' }
    );
  },

  async deleteProcedure(id) {
    return withErrorHandling(
      async () => {
        await localDB?.delete('procedures', id);
        return { success: true };
      },
      { success: false, error: 'Failed to delete procedure' }
    );
  }
};

export default MedicalHistoryService;