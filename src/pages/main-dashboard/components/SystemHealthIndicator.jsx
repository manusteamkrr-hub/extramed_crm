import React from 'react';
import Icon from '../../../components/AppIcon';

const SystemHealthIndicator = ({ systemStatus, loading = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'var(--color-success)';
      case 'degraded':
        return 'var(--color-warning)';
      case 'down':
        return 'var(--color-error)';
      default:
        return 'var(--color-muted-foreground)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return 'CheckCircle';
      case 'degraded':
        return 'AlertTriangle';
      case 'down':
        return 'XCircle';
      default:
        return 'HelpCircle';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'operational':
        return 'Работает';
      case 'degraded':
        return 'Снижена';
      case 'down':
        return 'Недоступно';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 elevation-sm">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-heading font-semibold text-foreground">
          Состояние систем
        </h3>
        <Icon name="Activity" size={20} color="var(--color-primary)" className="md:w-6 md:h-6" />
      </div>
      {loading ? (
        <div className="space-y-3 md:space-y-4">
          {[1, 2, 3]?.map((i) => (
            <div key={i} className="h-16 md:h-20 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {systemStatus?.map((system) => {
            const statusColor = getStatusColor(system?.status);
            const statusIcon = getStatusIcon(system?.status);
            const statusLabel = getStatusLabel(system?.status);

            return (
              <div
                key={system?.id}
                className="flex items-center justify-between p-3 md:p-4 border border-border rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${statusColor}15` }}
                  >
                    <Icon name={system?.icon} size={16} color={statusColor} className="md:w-5 md:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-body font-medium text-foreground truncate">
                      {system?.name}
                    </p>
                    <p className="text-xs md:text-sm caption text-muted-foreground">
                      {system?.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Icon name={statusIcon} size={16} color={statusColor} className="md:w-5 md:h-5" />
                  <span className="text-xs md:text-sm caption font-medium" style={{ color: statusColor }}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-4 md:mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-xs md:text-sm caption text-muted-foreground">
            Последнее обновление
          </p>
          <p className="text-xs md:text-sm caption text-foreground font-medium">
            {new Date()?.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthIndicator;