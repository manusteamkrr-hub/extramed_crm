import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UrgentNotificationsList = ({ 
  notifications, 
  loading = false, 
  onViewAll, 
  onClearNotification, 
  onClearAll 
}) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'var(--color-error)';
      case 'high':
        return 'var(--color-warning)';
      case 'medium':
        return 'var(--color-primary)';
      default:
        return 'var(--color-muted-foreground)';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
        return 'AlertCircle';
      case 'high':
        return 'AlertTriangle';
      case 'medium':
        return 'Info';
      default:
        return 'Bell';
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
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 elevation-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-heading font-semibold text-foreground">
          Срочные уведомления
        </h3>
        <div className="flex items-center gap-2">
          {notifications?.length > 0 && (
            <>
              <span className="bg-error text-error-foreground text-xs font-caption font-medium rounded-full px-2 py-1">
                {notifications?.filter((n) => n?.priority === 'critical')?.length}
              </span>
              <button
                onClick={onClearAll}
                className="text-xs md:text-sm font-caption text-muted-foreground hover:text-foreground transition-smooth underline"
                title="Очистить все уведомления"
              >
                Очистить все
              </button>
            </>
          )}
          <Icon name="AlertCircle" size={20} color="var(--color-error)" className="md:w-6 md:h-6" />
        </div>
      </div>
      {loading ? (
        <div className="space-y-3 md:space-y-4 flex-1">
          {[1, 2, 3, 4]?.map((i) => (
            <div key={i} className="h-20 md:h-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : notifications?.length > 0 ? (
        <>
          <div className="space-y-3 md:space-y-4 flex-1 overflow-y-auto scroll-smooth">
            {notifications?.map((notification) => {
              const priorityColor = getPriorityColor(notification?.priority);
              const priorityIcon = getPriorityIcon(notification?.priority);

              return (
                <div
                  key={notification?.id}
                  className="border border-border rounded-lg p-3 md:p-4 hover:bg-muted transition-smooth group relative"
                  style={{ borderLeftWidth: '4px', borderLeftColor: priorityColor }}
                >
                  <button
                    onClick={() => onClearNotification(notification?.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-smooth p-1 hover:bg-background rounded"
                    title="Закрыть уведомление"
                  >
                    <Icon name="X" size={16} color="var(--color-muted-foreground)" />
                  </button>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${priorityColor}15` }}
                    >
                      <Icon name={priorityIcon} size={16} color={priorityColor} className="md:w-5 md:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm md:text-base font-body font-medium text-foreground">
                          {notification?.title}
                        </p>
                        <span className="text-xs caption text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(notification?.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm caption text-muted-foreground line-clamp-2">
                        {notification?.message}
                      </p>
                      {notification?.patientId && (
                        <Link
                          to={`/patient-profile?id=${notification?.patientId}`}
                          className="inline-flex items-center gap-1 text-xs md:text-sm caption text-primary hover:text-primary/80 transition-smooth mt-2"
                        >
                          Открыть профиль
                          <Icon name="ArrowRight" size={14} color="var(--color-primary)" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border mt-4">
            <Button
              variant="outline"
              fullWidth
              iconName="ExternalLink"
              iconPosition="right"
              onClick={onViewAll}
            >
              Показать все уведомления
            </Button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8 md:py-12">
          <Icon name="CheckCircle" size={48} color="var(--color-success)" className="mb-3 md:mb-4" />
          <p className="text-sm md:text-base font-body font-medium text-foreground mb-2">
            Нет срочных уведомлений
          </p>
          <p className="text-xs md:text-sm caption text-muted-foreground">
            Все задачи выполнены
          </p>
        </div>
      )}
    </div>
  );
};

export default UrgentNotificationsList;