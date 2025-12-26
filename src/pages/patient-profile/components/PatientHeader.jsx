import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const PatientHeader = ({ patient, onEdit }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'discharged':
        return 'bg-muted text-muted-foreground border-border';
      case 'outpatient':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Активный стационар';
      case 'discharged':
        return 'Выписан';
      case 'outpatient':
        return 'Амбулаторный';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 elevation-sm">
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        <div className="flex-shrink-0">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden">
            <Image
              src={patient?.photo}
              alt={patient?.photoAlt}
              className="w-full h-full object-cover"
            />
            {patient?.hasAlerts && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-error rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={14} color="var(--color-error-foreground)" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-foreground mb-2">
                {patient?.fullName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs md:text-sm font-caption border ${getStatusColor(patient?.status)}`}>
                  <Icon name="Activity" size={14} />
                  {getStatusLabel(patient?.status)}
                </span>
                {patient?.insuranceStatus && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs md:text-sm font-caption bg-primary/10 text-primary border border-primary/20">
                    <Icon name="Shield" size={14} />
                    {patient?.insuranceStatus}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth text-sm md:text-base"
            >
              <Icon name="Edit" size={18} color="var(--color-primary-foreground)" />
              <span className="font-body font-medium">Редактировать</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Calendar" size={20} color="var(--color-primary)" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm caption text-muted-foreground">Дата рождения</p>
                <p className="text-sm md:text-base font-body font-medium text-foreground mt-0.5">{patient?.dateOfBirth}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                <Icon name="FileText" size={20} color="var(--color-success)" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm caption text-muted-foreground">Мед. карта</p>
                <p className="text-sm md:text-base font-body font-medium text-foreground mt-0.5 data-text">{patient?.medicalRecordNumber}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Phone" size={20} color="var(--color-warning)" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm caption text-muted-foreground">Телефон</p>
                <p className="text-sm md:text-base font-body font-medium text-foreground mt-0.5 data-text">{patient?.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Icon name="MapPin" size={20} color="var(--color-accent)" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm caption text-muted-foreground">Возраст</p>
                <p className="text-sm md:text-base font-body font-medium text-foreground mt-0.5">{patient?.age} лет</p>
              </div>
            </div>
          </div>

          {patient?.alerts && patient?.alerts?.length > 0 && (
            <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="AlertCircle" size={20} color="var(--color-error)" className="flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-medium text-error mb-1">Важные предупреждения</p>
                  <ul className="space-y-1">
                    {patient?.alerts?.map((alert, index) => (
                      <li key={index} className="text-xs md:text-sm caption text-error/90">• {alert}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientHeader;