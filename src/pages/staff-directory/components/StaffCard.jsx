import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const StaffCard = ({ staff, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'vacation':
        return 'bg-warning/10 text-warning';
      case 'inactive':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Активный';
      case 'vacation':
        return 'В отпуске';
      case 'inactive':
        return 'Неактивный';
      default:
        return status;
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'available':
        return 'bg-success';
      case 'busy':
        return 'bg-warning';
      case 'off':
        return 'bg-muted-foreground';
      default:
        return 'bg-muted-foreground';
    }
  };

  const fullName = `${staff?.lastName || ''} ${staff?.firstName || ''} ${staff?.middleName || ''}`?.trim();

  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border">
            <Image
              src={staff?.photo || "https://img.rocket.new/generatedImages/rocket_gen_img_10c48cdd0-1763299750352.png"}
              alt={`${fullName} photo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card ${getAvailabilityColor(staff?.availability)}`} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-foreground truncate">
            {fullName}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {staff?.specialty || 'Специальность не указана'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {staff?.department || 'Отделение не указано'}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(staff?.status)}`}>
              {getStatusLabel(staff?.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Пациентов</p>
            <p className="text-sm font-medium text-foreground">{staff?.patientLoad || 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Стаж (лет)</p>
            <p className="text-sm font-medium text-foreground">{staff?.experience || 0}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Icon name="Phone" size={14} color="var(--color-muted-foreground)" />
          <p className="text-xs text-muted-foreground truncate">{staff?.phone || 'Не указан'}</p>
        </div>
      </div>
    </div>
  );
};

export default StaffCard;