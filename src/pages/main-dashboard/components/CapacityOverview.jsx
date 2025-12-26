import React from 'react';
import Icon from '../../../components/AppIcon';

const CapacityOverview = ({ capacityData, loading = false }) => {
  const getOccupancyColor = (percentage) => {
    if (percentage >= 90) return 'var(--color-error)';
    if (percentage >= 70) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  const getOccupancyStatus = (percentage) => {
    if (percentage >= 90) return 'Критическая загрузка';
    if (percentage >= 70) return 'Высокая загрузка';
    return 'Нормальная загрузка';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 elevation-sm h-full">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-heading font-semibold text-foreground">
          Загруженность палат
        </h3>
        <Icon name="Bed" size={20} color="var(--color-primary)" className="md:w-6 md:h-6" />
      </div>
      {loading ? (
        <div className="space-y-4 md:space-y-6">
          {[1, 2, 3, 4]?.map((i) => (
            <div key={i} className="h-16 md:h-20 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {capacityData?.map((room) => {
            const occupancyPercentage = (room?.occupied / room?.total) * 100;
            const occupancyColor = getOccupancyColor(occupancyPercentage);

            return (
              <div key={room?.type} className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <div
                      className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${room?.color}15` }}
                    >
                      <Icon name={room?.icon} size={16} color={room?.color} className="md:w-5 md:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-base font-body font-medium text-foreground truncate">
                        {room?.type}
                      </p>
                      <p className="text-xs md:text-sm caption text-muted-foreground">
                        {room?.occupied} из {room?.total} занято
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base md:text-lg font-heading font-semibold data-text" style={{ color: occupancyColor }}>
                      {Math.round(occupancyPercentage)}%
                    </p>
                    <p className="text-xs caption text-muted-foreground whitespace-nowrap">
                      {room?.available} свободно
                    </p>
                  </div>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-smooth"
                    style={{
                      width: `${occupancyPercentage}%`,
                      backgroundColor: occupancyColor,
                    }}
                  />
                </div>
              </div>
            );
          })}

          <div className="pt-4 md:pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="text-sm md:text-base font-body font-medium text-foreground">
                Общая загрузка
              </p>
              <p className="text-base md:text-lg font-heading font-semibold text-foreground data-text">
                {capacityData?.reduce((acc, room) => acc + room?.occupied, 0)} /{' '}
                {capacityData?.reduce((acc, room) => acc + room?.total, 0)}
              </p>
            </div>
            <p className="text-xs md:text-sm caption text-muted-foreground mt-1 md:mt-2">
              {getOccupancyStatus(
                (capacityData?.reduce((acc, room) => acc + room?.occupied, 0) /
                  capacityData?.reduce((acc, room) => acc + room?.total, 0)) *
                  100
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CapacityOverview;