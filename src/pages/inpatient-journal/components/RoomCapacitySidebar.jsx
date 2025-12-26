import React from 'react';
import Icon from '../../../components/AppIcon';

const RoomCapacitySidebar = ({ rooms, onRoomSelect, selectedRoom }) => {
  const getRoomTypeColor = (type) => {
    switch (type) {
      case 'economy':
        return { bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-600', icon: 'var(--color-primary)' };
      case 'standard':
        return { bg: 'bg-green-500/10', border: 'border-green-500', text: 'text-green-600', icon: 'var(--color-success)' };
      case 'comfort':
        return { bg: 'bg-amber-500/10', border: 'border-amber-500', text: 'text-amber-600', icon: 'var(--color-warning)' };
      case 'vip':
        return { bg: 'bg-purple-500/10', border: 'border-purple-500', text: 'text-purple-600', icon: '#9333EA' };
      default:
        return { bg: 'bg-slate-500/10', border: 'border-slate-500', text: 'text-slate-600', icon: 'var(--color-muted-foreground)' };
    }
  };

  const getRoomTypeLabel = (type) => {
    switch (type) {
      case 'economy':
        return 'Эконом';
      case 'standard':
        return 'Стандарт';
      case 'comfort':
        return 'Комфорт';
      case 'vip':
        return 'VIP';
      default:
        return type;
    }
  };

  const totalCapacity = rooms?.reduce((sum, room) => sum + room?.capacity, 0);
  const totalOccupied = rooms?.reduce((sum, room) => sum + room?.occupied, 0);
  const occupancyRate = ((totalOccupied / totalCapacity) * 100)?.toFixed(1);

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      <div className="p-4 md:p-6 border-b border-border">
        <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-2">
          Загрузка палат
        </h2>
        <div className="flex items-center gap-2 text-sm md:text-base caption text-muted-foreground">
          <Icon name="Bed" size={18} color="var(--color-muted-foreground)" />
          <span className="data-text">{totalOccupied}/{totalCapacity} мест</span>
          <span className={`ml-auto font-medium ${occupancyRate >= 90 ? 'text-error' : occupancyRate >= 70 ? 'text-warning' : 'text-success'}`}>
            {occupancyRate}%
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3">
        {rooms?.map((room) => {
          const colors = getRoomTypeColor(room?.type);
          const isSelected = selectedRoom === room?.number;
          const availableSpots = room?.capacity - room?.occupied;
          const isFull = availableSpots === 0;

          return (
            <button
              key={room?.number}
              onClick={() => onRoomSelect(room?.number)}
              className={`
                w-full text-left p-3 md:p-4 rounded-lg border-2 transition-smooth
                ${isSelected 
                  ? `${colors?.bg} ${colors?.border} elevation-md` 
                  : 'border-border hover:border-muted-foreground hover:elevation-sm'
                }
                ${isFull ? 'opacity-60' : ''}
              `}
            >
              <div className="flex items-start justify-between gap-2 mb-2 md:mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${colors?.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon name="DoorOpen" size={18} color={colors?.icon} />
                  </div>
                  <div>
                    <p className="font-body font-semibold text-foreground text-sm md:text-base">
                      Палата {room?.number}
                    </p>
                    <p className={`text-xs md:text-sm caption ${colors?.text}`}>
                      {getRoomTypeLabel(room?.type)}
                    </p>
                  </div>
                </div>
                {isFull && (
                  <span className="px-2 py-1 bg-error/10 text-error text-xs font-caption rounded">
                    Занято
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Users" size={16} color="var(--color-muted-foreground)" />
                  <span className="text-xs md:text-sm caption text-muted-foreground">
                    {room?.occupied}/{room?.capacity}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[...Array(room?.capacity)]?.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${
                        index < room?.occupied ? colors?.bg?.replace('/10', '') : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {!isFull && (
                <p className="text-xs caption text-success mt-2">
                  {availableSpots} {availableSpots === 1 ? 'место' : 'места'} доступно
                </p>
              )}
            </button>
          );
        })}
      </div>
      <div className="p-3 md:p-4 border-t border-border">
        <div className="space-y-2">
          <p className="text-xs md:text-sm font-caption font-medium text-muted-foreground mb-2">
            Легенда типов палат:
          </p>
          {['economy', 'standard', 'comfort', 'vip']?.map((type) => {
            const colors = getRoomTypeColor(type);
            const roomsOfType = rooms?.filter(r => r?.type === type);
            const occupiedOfType = roomsOfType?.reduce((sum, r) => sum + r?.occupied, 0);
            const capacityOfType = roomsOfType?.reduce((sum, r) => sum + r?.capacity, 0);

            return (
              <div key={type} className="flex items-center justify-between text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${colors?.bg?.replace('/10', '')}`} />
                  <span className="caption text-foreground">{getRoomTypeLabel(type)}</span>
                </div>
                <span className="caption text-muted-foreground data-text">
                  {occupiedOfType}/{capacityOfType}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoomCapacitySidebar;