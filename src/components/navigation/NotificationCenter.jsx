import React, { useState, useEffect, useRef } from 'react';
import Icon from '../AppIcon';
import notificationService from '../../services/notificationService';

const NotificationCenter = ({ userRole = 'admin' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const notificationRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Load notifications from local storage
  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { success, data, error: fetchError } = await notificationService?.getNotifications({
        limit: 50
      });

      if (success) {
        setNotifications(data || []);
        const unread = data?.filter((n) => !n?.read)?.length || 0;
        setUnreadCount(unread);
      } else {
        setError(fetchError || 'Failed to load notifications');
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Initialize polling for local storage updates (replaces real-time subscription)
  useEffect(() => {
    // Load initial notifications
    loadNotifications();

    // Set up polling interval to check for new notifications every 10 seconds
    pollingIntervalRef.current = setInterval(() => {
      loadNotifications();
    }, 10000);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup polling on unmount
    return () => {
      if (pollingIntervalRef?.current) {
        clearInterval(pollingIntervalRef?.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef?.current && !notificationRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notificationId) => {
    const notification = notifications?.find((n) => n?.id === notificationId);
    
    if (notification && !notification?.read) {
      // Mark as read in database
      await notificationService?.markAsRead(notificationId);
      
      // Update local state
      setNotifications((prev) =>
        prev?.map((n) => (n?.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const { success } = await notificationService?.markAllAsRead();
      
      if (success) {
        setNotifications((prev) => prev?.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      const { success } = await notificationService?.deleteAllNotifications();
      
      if (success) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'urgent':
        return { name: 'AlertCircle', color: 'var(--color-error)' };
      case 'warning':
        return { name: 'AlertTriangle', color: 'var(--color-warning)' };
      case 'success':
        return { name: 'CheckCircle', color: 'var(--color-success)' };
      case 'admission':
        return { name: 'UserPlus', color: 'var(--color-primary)' };
      case 'discharge':
        return { name: 'UserMinus', color: 'var(--color-muted-foreground)' };
      case 'status_change':
        return { name: 'Activity', color: 'var(--color-warning)' };
      default:
        return { name: 'Info', color: 'var(--color-primary)' };
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    return date?.toLocaleDateString('ru-RU');
  };

  return (
    <div ref={notificationRef} className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg hover:bg-muted transition-smooth"
        aria-label="Notifications"
      >
        <Icon name="Bell" size={24} color="var(--color-foreground)" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs font-caption font-medium rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-popover border border-border rounded-lg elevation-lg overflow-hidden z-50">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-heading font-semibold text-foreground">
              Уведомления
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm caption text-primary hover:text-primary/80 transition-smooth"
                >
                  Прочитать все
                </button>
              )}
              {notifications?.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm caption text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Очистить
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">Загрузка уведомлений...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-error">
                <p className="text-sm">{error}</p>
              </div>
            ) : notifications?.length > 0 ? (
              <ul>
                {notifications?.map((notification) => {
                  const icon = getNotificationIcon(notification?.type);
                  return (
                    <li key={notification?.id}>
                      <button
                        onClick={() => handleNotificationClick(notification?.id)}
                        className={`
                          w-full text-left p-4 border-b border-border last:border-b-0
                          hover:bg-muted transition-smooth
                          ${!notification?.read ? 'bg-primary/5' : ''}
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <Icon
                            name={icon?.name}
                            size={20}
                            color={icon?.color}
                            className="flex-shrink-0 mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-body font-medium text-foreground">
                                {notification?.title}
                              </p>
                              {!notification?.read && (
                                <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-sm caption text-muted-foreground mb-2">
                              {notification?.message}
                            </p>
                            <p className="text-xs caption text-muted-foreground">
                              {formatTimestamp(notification?.timestamp || notification?.createdAt)}
                            </p>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Icon name="BellOff" size={32} className="mx-auto mb-3" />
                <p className="text-sm">Нет уведомлений</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;