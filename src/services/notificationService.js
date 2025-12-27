import localDB from '../lib/localDatabase';
import realtimeSyncService from './realtimeSync';

// Enhanced error handling wrapper
const withErrorHandling = async (operation, fallback = null) => {
  try {
    return await operation();
  } catch (error) {
    console.error('Service operation failed:', error);
    
    if (error?.message?.includes('QuotaExceededError')) {
      // Auto-cleanup old notifications on quota error
      console.log('Quota exceeded, cleaning old notifications...');
      localDB?.handleQuotaExceeded();
      // Retry the operation
      try {
        return await operation();
      } catch (retryError) {
        console.error('Retry failed:', retryError);
      }
    } else if (error?.message?.includes('DataCorruptedError')) {
      alert('Notification data corrupted. Attempting recovery...');
      try {
        localDB?.restoreFromBackup();
      } catch (e) {
        console.error('Recovery failed:', e);
      }
    }
    
    return fallback;
  }
};

// ✅ NEW: Register notification sync callbacks
realtimeSyncService?.registerSyncCallback('inpatient_records', 'notifications', async (action, data) => {
  if (action === 'create' || action === 'update') {
    console.log('🔔 Generating notifications for inpatient record change:', data);
    await NotificationService.generateNotifications();
  }
});

realtimeSyncService?.registerSyncCallback('estimates', 'notifications', async (action, data) => {
  if (action === 'create' || action === 'update') {
    console.log('🔔 Generating notifications for estimate change:', data);
    await NotificationService.generateNotifications();
  }
});

realtimeSyncService?.registerSyncCallback('patients', 'notifications', async (action, data) => {
  if (action === 'create') {
    console.log('🔔 Generating notifications for new patient:', data);
    await NotificationService.generateNotifications();
  }
});

const NotificationService = {
  async getNotifications({ limit = 50 } = {}) {
    return withErrorHandling(
      () => {
        const notifications = localDB?.select('notifications') || [];
        const sorted = notifications?.sort((a, b) => new Date(b?.timestamp || b?.createdAt) - new Date(a?.timestamp || a?.createdAt));
        const limited = sorted?.slice(0, limit);
        return { success: true, data: limited };
      },
      { success: false, data: [], error: 'Failed to load notifications' }
    );
  },

  async markAsRead(notificationId) {
    return withErrorHandling(
      () => {
        localDB?.update('notifications', notificationId, { read: true });
        return { success: true };
      },
      { success: false }
    );
  },

  async markAllAsRead() {
    return withErrorHandling(
      () => {
        const notifications = localDB?.select('notifications') || [];
        notifications?.forEach(n => {
          if (!n?.read) {
            localDB?.update('notifications', n?.id, { read: true });
          }
        });
        return { success: true };
      },
      { success: false }
    );
  },

  async deleteAllNotifications() {
    return withErrorHandling(
      () => {
        const notifications = localDB?.select('notifications') || [];
        notifications?.forEach(n => {
          localDB?.delete('notifications', n?.id);
        });
        return { success: true };
      },
      { success: false }
    );
  },

  async getUrgentNotifications() {
    return withErrorHandling(
      () => {
        // Generate real-time notifications from actual data sources
        const urgentNotifications = [];
        
        // 1. Check for critical room capacity
        const inpatients = localDB?.select('inpatients', { status: 'active' }) || [];
        const rooms = localDB?.select('rooms') || [];
        
        rooms?.forEach(room => {
          const occupants = inpatients?.filter(inp => inp?.roomId === room?.id);
          const occupancyRate = (occupants?.length / room?.totalBeds) * 100;

          if (occupancyRate >= 90) {
            urgentNotifications?.push({
              id: `capacity-${room?.id}-${Date.now()}`,
              type: 'capacity',
              priority: 'critical',
              title: 'Критическая загруженность палаты',
              message: `Палата ${room?.roomNumber} (${room?.type}) заполнена на ${Math.round(occupancyRate)}%. Требуется срочное решение.`,
              timestamp: new Date()?.toISOString(),
              patientId: null,
              dismissed: false,
              read: false
            });
          }
        });

        // 2. Check for patients requiring discharge
        const patients = localDB?.select('patients') || [];
        patients?.forEach(patient => {
          const inpatient = inpatients?.find(inp => inp?.patientId === patient?.id);
          if (inpatient?.dischargeDate) {
            const dischargeDate = new Date(inpatient.dischargeDate);
            const today = new Date();
            const daysDiff = Math.ceil((dischargeDate - today) / (1000 * 60 * 60 * 24));

            if (daysDiff <= 1 && daysDiff >= 0) {
              urgentNotifications?.push({
                id: `discharge-${patient?.id}-${Date.now()}`,
                type: 'discharge',
                priority: 'high',
                title: 'Пациент готов к выписке',
                message: `${patient?.firstName} ${patient?.lastName} должен быть выписан завтра. Необходимо завершить документы.`,
                timestamp: new Date()?.toISOString(),
                patientId: patient?.id,
                dismissed: false,
                read: false
              });
            }
          }
        });

        // 3. Check for unpaid estimates
        const estimates = localDB?.select('estimates') || [];
        const unpaidEstimates = estimates?.filter(est => 
          est?.status === 'unpaid' || est?.status === 'partially_paid'
        );

        unpaidEstimates?.forEach(estimate => {
          const patient = patients?.find(p => p?.id === estimate?.patientId);
          const dueDate = new Date(estimate?.createdAt);
          dueDate?.setDate(dueDate?.getDate() + 7); // 7 days payment term
          const today = new Date();
          
          if (today > dueDate) {
            urgentNotifications?.push({
              id: `payment-${estimate?.id}-${Date.now()}`,
              type: 'payment',
              priority: 'medium',
              title: 'Просроченная оплата',
              message: `Счет №${estimate?.estimateNumber} для ${patient?.firstName} ${patient?.lastName} просрочен. Сумма: ${new Intl.NumberFormat('ru-RU')?.format(estimate?.totalAmount)} ₽`,
              timestamp: new Date()?.toISOString(),
              patientId: patient?.id,
              dismissed: false,
              read: false
            });
          }
        });

        // 4. Check for critical medical conditions
        const medicalRecords = localDB?.select('medical_records') || [];
        medicalRecords?.forEach(record => {
          if (record?.severity === 'critical' || record?.status === 'urgent') {
            const patient = patients?.find(p => p?.id === record?.patientId);
            urgentNotifications?.push({
              id: `medical-${record?.id}-${Date.now()}`,
              type: 'medical',
              priority: 'critical',
              title: 'Критическое состояние пациента',
              message: `${patient?.firstName} ${patient?.lastName}: ${record?.diagnosis}. Требуется немедленное внимание врача.`,
              timestamp: new Date()?.toISOString(),
              patientId: patient?.id,
              dismissed: false,
              read: false
            });
          }
        });

        // Sort by priority and timestamp
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return urgentNotifications?.sort((a, b) => {
          const priorityDiff = priorityOrder?.[a?.priority] - priorityOrder?.[b?.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return new Date(b?.timestamp) - new Date(a?.timestamp);
        });
      },
      []
    );
  },

  async generateNotifications() {
    return withErrorHandling(
      async () => {
        const notifications = [];
        const inpatients = localDB?.select('inpatients', { status: 'active' });
        const rooms = localDB?.select('rooms');

        // Check capacity alerts
        rooms?.forEach(room => {
          const occupants = inpatients?.filter(inp => inp?.roomId === room?.id);
          const occupancyRate = (occupants?.length / room?.totalBeds) * 100;

          if (occupancyRate >= 90) {
            notifications?.push({
              id: `capacity-${room?.id}`,
              type: 'capacity',
              priority: 'urgent',
              title: 'Критическая загруженность',
              message: `Палата ${room?.roomNumber} заполнена на ${Math.round(occupancyRate)}%`,
              timestamp: new Date()?.toISOString(),
              createdAt: new Date()?.toISOString(),
              dismissed: false,
              read: false
            });
          }
        });

        // Store new notifications
        const existing = localDB?.select('notifications');
        const newNotifications = notifications?.filter(n => 
          !existing?.some(e => e?.id === n?.id)
        );

        for (const notification of newNotifications) {
          await localDB?.insert('notifications', notification);
        }

        return notifications;
      },
      []
    );
  },

  async getSystemHealth() {
    return withErrorHandling(
      () => {
        const storageInfo = localDB?.getStorageInfo();
        const metadata = localDB?.getMetadata();
        
        const systemStatus = [
          {
            id: 'database',
            name: 'База данных',
            status: localDB?.storageAvailable ? 'operational' : 'offline',
            message: localDB?.storageAvailable 
              ? `Использовано ${storageInfo?.percentage}% хранилища` 
              : 'Хранилище недоступно',
            icon: 'Database'
          },
          {
            id: 'backup',
            name: 'Резервное копирование',
            status: metadata?.lastBackup ? 'operational' : 'warning',
            message: metadata?.lastBackup 
              ? `Последнее: ${new Date(metadata.lastBackup)?.toLocaleString('ru-RU')}` 
              : 'Резервные копии не найдены',
            icon: 'Shield'
          },
          {
            id: 'storage',
            name: 'Доступное место',
            status: storageInfo?.percentage > 90 ? 'warning' : 'operational',
            message: `${Math.round(storageInfo?.available / 1024 / 1024 * 100) / 100} МБ свободно`,
            icon: 'HardDrive'
          }
        ];

        return systemStatus;
      },
      []
    );
  },

  async dismissNotification(notificationId) {
    return withErrorHandling(
      () => localDB?.update('notifications', notificationId, { dismissed: true }),
      false
    );
  },

  async clearAllNotifications() {
    return withErrorHandling(
      () => {
        const notifications = localDB?.select('notifications');
        notifications?.forEach(n => {
          localDB?.update('notifications', n?.id, { dismissed: true });
        });
        return true;
      },
      false
    );
  }
};

export default NotificationService;