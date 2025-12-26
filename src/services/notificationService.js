import localDB from '../lib/localDatabase';

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
        const notifications = localDB?.select('notifications');
        return notifications?.filter(n => n?.priority === 'urgent' && !n?.dismissed)?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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