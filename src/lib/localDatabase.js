// Local Database Manager with Enhanced Error Handling
// Handles localStorage operations with comprehensive error recovery

const STORAGE_KEYS = {
  PATIENTS: 'extramed_patients',
  INPATIENTS: 'extramed_inpatients',
  ESTIMATES: 'extramed_estimates',
  MEDICAL_HISTORY: 'extramed_medical_history',
  NOTIFICATIONS: 'extramed_notifications',
  REPORTS: 'extramed_reports',
  ROOMS: 'extramed_rooms',
  BACKUP: 'extramed_backup',
  METADATA: 'extramed_metadata'
};

// Error types for localStorage operations
const STORAGE_ERRORS = {
  QUOTA_EXCEEDED: 'QuotaExceededError',
  DATA_CORRUPTED: 'DataCorruptedError',
  STORAGE_UNAVAILABLE: 'StorageUnavailableError',
  PARSE_ERROR: 'ParseError',
  PERMISSION_DENIED: 'PermissionDeniedError'
};

class LocalDatabase {
  constructor() {
    this.storageAvailable = this.checkStorageAvailability();
    this.autoBackupInterval = null;
    this.initializeAutoBackup();
  }

  /**
   * Check if localStorage is available and accessible
   */
  checkStorageAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.error('localStorage is not available:', e);
      return false;
    }
  }

  /**
   * Get available storage space estimation
   */
  getStorageInfo() {
    if (!this.storageAvailable) {
      return { available: 0, used: 0, total: 0, percentage: 0 };
    }

    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key]?.length + key?.length;
        }
      }

      // Estimate total storage (usually 5-10MB per domain)
      const estimated = 5 * 1024 * 1024; // 5MB conservative estimate
      const available = estimated - used;
      const percentage = (used / estimated) * 100;

      return {
        available,
        used,
        total: estimated,
        percentage: Math.round(percentage)
      };
    } catch (e) {
      console.error('Error calculating storage info:', e);
      return { available: 0, used: 0, total: 0, percentage: 0 };
    }
  }

  /**
   * Check if storage is near quota limit
   */
  isStorageNearLimit() {
    const info = this.getStorageInfo();
    return info?.percentage > 80; // Warning threshold at 80%
  }

  /**
   * Create backup of all data
   */
  createBackup() {
    if (!this.storageAvailable) return null;

    try {
      const backup = {
        timestamp: new Date()?.toISOString(),
        version: '1.0',
        data: {}
      };

      Object.values(STORAGE_KEYS)?.forEach(key => {
        if (key !== STORAGE_KEYS?.BACKUP && key !== STORAGE_KEYS?.METADATA) {
          const data = localStorage.getItem(key);
          if (data) {
            backup.data[key] = data;
          }
        }
      });

      // Store backup with compression attempt
      const backupString = JSON.stringify(backup);
      localStorage.setItem(STORAGE_KEYS?.BACKUP, backupString);

      // Update metadata
      this.updateMetadata({ lastBackup: backup?.timestamp });

      return backup;
    } catch (e) {
      console.error('Failed to create backup:', e);
      
      // If backup fails due to quota, try to clean old data
      if (e?.name === 'QuotaExceededError') {
        this.handleQuotaExceeded();
      }
      
      return null;
    }
  }

  /**
   * Restore from backup
   */
  restoreFromBackup() {
    if (!this.storageAvailable) {
      throw new Error(STORAGE_ERRORS.STORAGE_UNAVAILABLE);
    }

    try {
      const backupString = localStorage.getItem(STORAGE_KEYS?.BACKUP);
      if (!backupString) {
        throw new Error('No backup available');
      }

      const backup = JSON.parse(backupString);
      
      // Validate backup structure
      if (!backup?.data || !backup?.timestamp) {
        throw new Error(STORAGE_ERRORS.DATA_CORRUPTED);
      }

      // Restore each key
      Object.entries(backup?.data)?.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });

      console.log('Data restored from backup:', backup?.timestamp);
      return true;
    } catch (e) {
      console.error('Failed to restore from backup:', e);
      throw e;
    }
  }

  /**
   * Handle quota exceeded error
   */
  handleQuotaExceeded() {
    console.warn('Storage quota exceeded. Attempting cleanup...');

    try {
      // Strategy 1: Remove old notifications
      const notifications = this.safeGetItem(STORAGE_KEYS?.NOTIFICATIONS, []);
      if (notifications?.length > 50) {
        const recentNotifications = notifications?.slice(-50);
        this.safeSetItem(STORAGE_KEYS?.NOTIFICATIONS, recentNotifications);
        console.log('Cleaned old notifications');
      }

      // Strategy 2: Compress medical history (keep last 100 records)
      const medicalHistory = this.safeGetItem(STORAGE_KEYS?.MEDICAL_HISTORY, []);
      if (medicalHistory?.length > 100) {
        const recentHistory = medicalHistory?.slice(-100);
        this.safeSetItem(STORAGE_KEYS?.MEDICAL_HISTORY, recentHistory);
        console.log('Compressed medical history');
      }

      // Strategy 3: Remove old completed estimates (older than 90 days)
      const estimates = this.safeGetItem(STORAGE_KEYS?.ESTIMATES, []);
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo?.setDate(ninetyDaysAgo?.getDate() - 90);
      
      const activeEstimates = estimates?.filter(est => {
        const estDate = new Date(est.createdAt);
        return est?.status !== 'paid' || estDate > ninetyDaysAgo;
      });
      
      if (activeEstimates?.length < estimates?.length) {
        this.safeSetItem(STORAGE_KEYS?.ESTIMATES, activeEstimates);
        console.log('Cleaned old estimates');
      }

      return true;
    } catch (e) {
      console.error('Cleanup failed:', e);
      return false;
    }
  }

  /**
   * Validate and parse JSON data
   */
  validateAndParse(data, fallback = null) {
    if (!data) return fallback;

    try {
      const parsed = JSON.parse(data);
      
      // Additional validation: check if parsed data is valid
      if (parsed === null || parsed === undefined) {
        console.warn('Parsed data is null/undefined');
        return fallback;
      }

      return parsed;
    } catch (e) {
      console.error('JSON parse error:', e);
      
      // Attempt recovery
      try {
        // Try to fix common JSON issues
        const fixed = // Remove trailing commas in objects
        data?.replace(/,\s*}/g, '}')?.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
        
        return JSON.parse(fixed);
      } catch (recoveryError) {
        console.error('Data recovery failed:', recoveryError);
        return fallback;
      }
    }
  }

  /**
   * Safe get item with error handling
   */
  safeGetItem(key, fallback = null) {
    if (!this.storageAvailable) {
      console.warn('Storage not available, using fallback');
      return fallback;
    }

    try {
      const item = localStorage.getItem(key);
      
      if (item === null) {
        return fallback;
      }

      return this.validateAndParse(item, fallback);
    } catch (e) {
      console.error(`Error reading ${key}:`, e);
      
      // Try to restore from backup
      if (e?.name === STORAGE_ERRORS?.DATA_CORRUPTED) {
        console.log('Attempting to restore from backup...');
        try {
          this.restoreFromBackup();
          const item = localStorage.getItem(key);
          return this.validateAndParse(item, fallback);
        } catch (restoreError) {
          console.error('Backup restore failed:', restoreError);
        }
      }

      return fallback;
    }
  }

  /**
   * Safe set item with error handling and automatic backup
   */
  safeSetItem(key, value) {
    if (!this.storageAvailable) {
      throw new Error(STORAGE_ERRORS.STORAGE_UNAVAILABLE);
    }

    try {
      // Check storage space before writing
      if (this.isStorageNearLimit()) {
        console.warn('Storage near limit, attempting cleanup...');
        this.handleQuotaExceeded();
      }

      const stringValue = JSON.stringify(value);
      localStorage.setItem(key, stringValue);

      // Create backup after successful write (throttled)
      this.throttledBackup();

      return true;
    } catch (e) {
      console.error(`Error writing ${key}:`, e);

      if (e?.name === 'QuotaExceededError') {
        // Try cleanup and retry
        const cleanedUp = this.handleQuotaExceeded();
        
        if (cleanedUp) {
          try {
            const stringValue = JSON.stringify(value);
            localStorage.setItem(key, stringValue);
            console.log('Write succeeded after cleanup');
            return true;
          } catch (retryError) {
            console.error('Write failed after cleanup:', retryError);
            throw new Error(STORAGE_ERRORS.QUOTA_EXCEEDED);
          }
        } else {
          throw new Error(STORAGE_ERRORS.QUOTA_EXCEEDED);
        }
      }

      throw e;
    }
  }

  /**
   * Throttled backup to avoid excessive backup operations
   */
  throttledBackup() {
    if (this._lastBackupTime) {
      const timeSinceLastBackup = Date.now() - this._lastBackupTime;
      // Only backup if more than 5 minutes have passed
      if (timeSinceLastBackup < 5 * 60 * 1000) {
        return;
      }
    }

    this._lastBackupTime = Date.now();
    this.createBackup();
  }

  /**
   * Initialize automatic backup every 30 minutes
   */
  initializeAutoBackup() {
    // Create initial backup
    setTimeout(() => this.createBackup(), 5000);

    // Set up periodic backup
    this.autoBackupInterval = setInterval(() => {
      this.createBackup();
    }, 30 * 60 * 1000); // 30 minutes
  }

  /**
   * Update metadata
   */
  updateMetadata(data) {
    try {
      const metadata = this.safeGetItem(STORAGE_KEYS?.METADATA, {});
      const updated = { ...metadata, ...data, lastUpdated: new Date()?.toISOString() };
      localStorage.setItem(STORAGE_KEYS?.METADATA, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update metadata:', e);
    }
  }

  /**
   * Get metadata
   */
  getMetadata() {
    return this.safeGetItem(STORAGE_KEYS?.METADATA, {});
  }

  /**
   * Clear all data with confirmation
   */
  clearAll() {
    if (!this.storageAvailable) return;

    try {
      // Create final backup before clearing
      this.createBackup();

      Object.values(STORAGE_KEYS)?.forEach(key => {
        if (key !== STORAGE_KEYS?.BACKUP) {
          localStorage.removeItem(key);
        }
      });

      console.log('All data cleared');
      return true;
    } catch (e) {
      console.error('Failed to clear data:', e);
      return false;
    }
  }

  /**
   * Export all data as downloadable file
   */
  exportData() {
    try {
      const exportData = {
        exportDate: new Date()?.toISOString(),
        version: '1.0',
        storageInfo: this.getStorageInfo(),
        data: {}
      };

      Object.values(STORAGE_KEYS)?.forEach(key => {
        if (key !== STORAGE_KEYS?.BACKUP) {
          const data = this.safeGetItem(key);
          if (data) {
            exportData.data[key] = data;
          }
        }
      });

      return exportData;
    } catch (e) {
      console.error('Export failed:', e);
      return null;
    }
  }

  /**
   * Import data from exported file
   */
  importData(importData) {
    try {
      if (!importData || !importData?.data) {
        throw new Error('Invalid import data');
      }

      // Validate structure
      if (!importData?.exportDate || !importData?.version) {
        throw new Error(STORAGE_ERRORS.DATA_CORRUPTED);
      }

      // Create backup before import
      this.createBackup();

      // Import each key
      Object.entries(importData?.data)?.forEach(([key, value]) => {
        this.safeSetItem(key, value);
      });

      console.log('Data imported successfully');
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      
      // Restore from backup if import fails
      try {
        this.restoreFromBackup();
      } catch (restoreError) {
        console.error('Failed to restore backup after import failure:', restoreError);
      }
      
      return false;
    }
  }

  // SQL-like query methods with enhanced error handling
  select(tableName, conditions = {}) {
    try {
      const data = this.safeGetItem(STORAGE_KEYS?.[tableName?.toUpperCase()], []);
      
      if (!Array.isArray(data)) {
        console.warn(`Data for ${tableName} is not an array`);
        return [];
      }

      if (Object.keys(conditions)?.length === 0) {
        return data;
      }

      return data?.filter(item => {
        return Object.entries(conditions)?.every(([key, value]) => {
          if (typeof value === 'function') {
            return value(item?.[key]);
          }
          return item?.[key] === value;
        });
      });
    } catch (e) {
      console.error(`Select failed for ${tableName}:`, e);
      return [];
    }
  }

  insert(tableName, record) {
    try {
      const data = this.safeGetItem(STORAGE_KEYS?.[tableName?.toUpperCase()], []);
      
      const newRecord = {
        ...record,
        id: record?.id || this.generateId(),
        createdAt: record?.createdAt || new Date()?.toISOString(),
        updatedAt: new Date()?.toISOString()
      };

      data?.push(newRecord);
      this.safeSetItem(STORAGE_KEYS?.[tableName?.toUpperCase()], data);

      return newRecord;
    } catch (e) {
      console.error(`Insert failed for ${tableName}:`, e);
      throw e;
    }
  }

  update(tableName, id, updates) {
    try {
      const data = this.safeGetItem(STORAGE_KEYS?.[tableName?.toUpperCase()], []);
      const index = data?.findIndex(item => item?.id === id);

      if (index === -1) {
        throw new Error(`Record not found: ${id}`);
      }

      data[index] = {
        ...data?.[index],
        ...updates,
        updatedAt: new Date()?.toISOString()
      };

      this.safeSetItem(STORAGE_KEYS?.[tableName?.toUpperCase()], data);
      return data?.[index];
    } catch (e) {
      console.error(`Update failed for ${tableName}:`, e);
      throw e;
    }
  }

  delete(tableName, id) {
    try {
      const data = this.safeGetItem(STORAGE_KEYS?.[tableName?.toUpperCase()], []);
      const filtered = data?.filter(item => item?.id !== id);

      if (filtered?.length === data?.length) {
        throw new Error(`Record not found: ${id}`);
      }

      this.safeSetItem(STORAGE_KEYS?.[tableName?.toUpperCase()], filtered);
      return true;
    } catch (e) {
      console.error(`Delete failed for ${tableName}:`, e);
      throw e;
    }
  }

  generateId() {
    return `${Date.now()}-${Math.random()?.toString(36)?.substr(2, 9)}`;
  }

  // Cleanup on window unload
  cleanup() {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
    }
  }
}

// Create singleton instance
const localDB = new LocalDatabase();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    localDB?.cleanup();
  });
}

export default localDB;
export { STORAGE_KEYS, STORAGE_ERRORS };