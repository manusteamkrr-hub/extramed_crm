import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const PatientHeader = ({ patient }) => {
  if (!patient) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 md:p-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Icon name="UserCircle" size={24} />
          <p className="text-sm md:text-base">Выберите пациента для создания сметы</p>
        </div>
      </div>
    );
  }

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today?.getFullYear() - birthDate?.getFullYear();
    const monthDiff = today?.getMonth() - birthDate?.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today?.getDate() < birthDate?.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 elevation-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary">
          <Image
            src={patient?.avatar}
            alt={patient?.avatarAlt}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
            <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground">
              {patient?.name}
            </h2>
            <div className="flex items-center gap-2">
              <span
                className={`
                  px-2 py-1 rounded text-xs font-caption font-medium
                  ${
                    patient?.status === 'active' ?'bg-success/10 text-success'
                      : patient?.status === 'discharged' ?'bg-muted text-muted-foreground' :'bg-warning/10 text-warning'
                  }
                `}
              >
                {patient?.status === 'active' ?'Активный'
                  : patient?.status === 'discharged' ?'Выписан' :'Амбулаторный'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <Icon name="FileText" size={16} color="var(--color-muted-foreground)" />
              <div>
                <p className="text-xs caption text-muted-foreground">Мед. карта</p>
                <p className="text-sm font-body font-medium text-foreground">
                  {patient?.medicalRecordNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Icon name="Calendar" size={16} color="var(--color-muted-foreground)" />
              <div>
                <p className="text-xs caption text-muted-foreground">Возраст</p>
                <p className="text-sm font-body font-medium text-foreground">
                  {calculateAge(patient?.dateOfBirth)} лет
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Icon name="Phone" size={16} color="var(--color-muted-foreground)" />
              <div>
                <p className="text-xs caption text-muted-foreground">Телефон</p>
                <p className="text-sm font-body font-medium text-foreground">
                  {patient?.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Icon name="Activity" size={16} color="var(--color-muted-foreground)" />
              <div>
                <p className="text-xs caption text-muted-foreground">Диагноз</p>
                <p className="text-sm font-body font-medium text-foreground truncate">
                  {patient?.diagnosis}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHeader;