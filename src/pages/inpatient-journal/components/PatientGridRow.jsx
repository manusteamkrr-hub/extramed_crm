import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import PatientEditModal from './PatientEditModal';

const PatientGridRow = ({ patient, isSelected, onSelect, userRole, onQuickAction }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'admission':
        return { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'Поступление' };
      case 'treatment':
        return { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Лечение' };
      case 'observation':
        return { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Наблюдение' };
      case 'discharge-prep':
        return { bg: 'bg-purple-500/10', text: 'text-purple-600', label: 'Подготовка к выписке' };
      default:
        return { bg: 'bg-slate-500/10', text: 'text-slate-600', label: status };
    }
  };

  const getRoomTypeColor = (type) => {
    switch (type) {
      case 'economy':
        return 'text-blue-600';
      case 'standard':
        return 'text-green-600';
      case 'comfort':
        return 'text-amber-600';
      case 'vip':
        return 'text-purple-600';
      default:
        return 'text-slate-600';
    }
  };

  const statusColors = getStatusColor(patient?.treatmentStatus);
  const roomColor = getRoomTypeColor(patient?.roomType);

  const daysSinceAdmission = Math.floor(
    (new Date() - new Date(patient.admissionDate)) / (1000 * 60 * 60 * 24)
  );

  const daysUntilDischarge = patient?.estimatedDischarge
    ? Math.floor((new Date(patient.estimatedDischarge) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const isOverdue = daysUntilDischarge !== null && daysUntilDischarge < 0;
  
  // Check if patient needs room assignment
  const needsRoomAssignment = !patient?.roomNumber || 
    patient?.roomNumber === 'Не назначена' || patient?.roomNumber?.toLowerCase()?.includes('не назначена') ||
    patient?.source === 'placement_service';

  const handleActionClick = (action) => {
    setShowActionsMenu(false);
    
    if (action === 'edit-inline') {
      setShowEditModal(true);
      return;
    }
    
    onQuickAction(patient?.id, action);
  };

  const handleEditSave = async () => {
    setShowEditModal(false);
    // Trigger parent refresh
    if (onQuickAction) {
      onQuickAction(patient?.id, 'refresh-data');
    }
  };

  return (
    <div className={`border-b border-border transition-smooth ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'}`}>
      <div className="flex items-center gap-2 md:gap-4 p-3 md:p-4">
        <Checkbox
          checked={isSelected}
          onChange={(e) => onSelect(patient?.id, e?.target?.checked)}
          className="flex-shrink-0"
        />

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden p-2 hover:bg-muted rounded-lg transition-smooth"
        >
          <Icon
            name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
            size={20}
            color="var(--color-muted-foreground)"
          />
        </button>

        <div className="hidden lg:grid lg:grid-cols-12 gap-3 md:gap-4 flex-1 items-center">
          <div className="col-span-3">
            <button
              onClick={() => navigate('/patient-profile', { state: { patientId: patient?.id } })}
              className="text-left hover:text-primary transition-smooth"
            >
              <p className="font-body font-semibold text-foreground text-sm md:text-base">
                {patient?.name}
              </p>
              <p className="text-xs md:text-sm caption text-muted-foreground mt-0.5">
                {patient?.medicalRecordNumber}
              </p>
            </button>
          </div>

          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <Icon name="DoorOpen" size={16} color={needsRoomAssignment ? 'var(--color-amber-600)' : roomColor} />
              <span className={`font-body font-medium text-sm md:text-base ${needsRoomAssignment ? 'text-amber-600' : roomColor}`}>
                {needsRoomAssignment ? 'Не назначена' : `Палата ${patient?.roomNumber}`}
              </span>
            </div>
            <p className="text-xs md:text-sm caption text-muted-foreground mt-0.5">
              {needsRoomAssignment ? 'Требуется назначение' : 
               (patient?.roomType === 'economy' ? 'Эконом' : 
                patient?.roomType === 'standard' ? 'Стандарт' : 
                patient?.roomType === 'comfort' ? 'Комфорт' : 'VIP')}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-xs md:text-sm caption text-muted-foreground">
              {new Date(patient.admissionDate)?.toLocaleDateString('ru-RU')}
            </p>
            <p className="text-xs caption text-muted-foreground mt-0.5">
              {daysSinceAdmission} {daysSinceAdmission === 1 ? 'день' : 'дней'}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-xs md:text-sm font-body text-foreground">
              {patient?.attendingPhysician}
            </p>
          </div>

          <div className="col-span-2">
            <span className={`inline-flex px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-caption ${statusColors?.bg} ${statusColors?.text}`}>
              {statusColors?.label}
            </span>
            {patient?.estimatedDischarge && (
              <p className={`text-xs caption mt-1 ${isOverdue ? 'text-error font-medium' : 'text-muted-foreground'}`}>
                {isOverdue ? 'Просрочено' : `Выписка: ${new Date(patient.estimatedDischarge)?.toLocaleDateString('ru-RU')}`}
              </p>
            )}
          </div>

          <div className="col-span-1 flex items-center justify-end gap-1">
            {needsRoomAssignment && (
              <Button
                variant="default"
                size="icon"
                iconName="DoorOpen"
                onClick={() => handleActionClick('assign-room')}
                title="Назначить палату"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              iconName="Edit"
              onClick={() => setShowEditModal(true)}
              title="Редактировать"
            />
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                iconName="MoreVertical"
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                title="Действия"
              />
              {showActionsMenu && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg elevation-md py-1 z-10 min-w-[180px]">
                  <button
                    onClick={() => handleActionClick('edit-inline')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-smooth flex items-center gap-2"
                  >
                    <Icon name="Edit" size={16} />
                    Быстрое редактирование
                  </button>
                  {needsRoomAssignment && (
                    <button
                      onClick={() => handleActionClick('assign-room')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-smooth flex items-center gap-2"
                    >
                      <Icon name="DoorOpen" size={16} />
                      Назначить палату
                    </button>
                  )}
                  <button
                    onClick={() => handleActionClick('transfer-room')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-smooth flex items-center gap-2"
                  >
                    <Icon name="ArrowRightLeft" size={16} />
                    Перевести в другую палату
                  </button>
                  <button
                    onClick={() => handleActionClick('discharge')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-smooth flex items-center gap-2"
                  >
                    <Icon name="LogOut" size={16} />
                    Выписать пациента
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 lg:hidden">
          <button
            onClick={() => navigate('/patient-profile', { state: { patientId: patient?.id } })}
            className="text-left hover:text-primary transition-smooth"
          >
            <p className="font-body font-semibold text-foreground text-sm md:text-base">
              {patient?.name}
            </p>
            <p className="text-xs md:text-sm caption text-muted-foreground mt-0.5">
              {needsRoomAssignment ? 'Палата не назначена' : `Палата ${patient?.roomNumber}`} • {patient?.attendingPhysician}
            </p>
          </button>
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-caption ${statusColors?.bg} ${statusColors?.text}`}>
              {statusColors?.label}
            </span>
            {needsRoomAssignment && (
              <span className="inline-flex px-2 py-1 rounded-lg text-xs font-caption bg-amber-500/10 text-amber-600">
                Требуется палата
              </span>
            )}
            {isOverdue && (
              <span className="inline-flex px-2 py-1 rounded-lg text-xs font-caption bg-error/10 text-error">
                Просрочено
              </span>
            )}
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="lg:hidden p-3 md:p-4 bg-muted/30 border-t border-border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs caption text-muted-foreground mb-1">Дата поступления</p>
              <p className="text-sm font-body text-foreground">
                {new Date(patient.admissionDate)?.toLocaleDateString('ru-RU')}
              </p>
            </div>
            <div>
              <p className="text-xs caption text-muted-foreground mb-1">Дней в стационаре</p>
              <p className="text-sm font-body text-foreground">{daysSinceAdmission}</p>
            </div>
            <div>
              <p className="text-xs caption text-muted-foreground mb-1">Лечащий врач</p>
              <p className="text-sm font-body text-foreground">{patient?.attendingPhysician}</p>
            </div>
            <div>
              <p className="text-xs caption text-muted-foreground mb-1">Тип палаты</p>
              <p className={`text-sm font-body ${roomColor}`}>
                {patient?.roomType === 'economy' ? 'Эконом' : 
                 patient?.roomType === 'standard' ? 'Стандарт' : 
                 patient?.roomType === 'comfort' ? 'Комфорт' : 'VIP'}
              </p>
            </div>
          </div>
          {patient?.estimatedDischarge && (
            <div>
              <p className="text-xs caption text-muted-foreground mb-1">Планируемая выписка</p>
              <p className={`text-sm font-body ${isOverdue ? 'text-error' : 'text-foreground'}`}>
                {new Date(patient.estimatedDischarge)?.toLocaleDateString('ru-RU')}
                {isOverdue && ' (Просрочено)'}
              </p>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button
              variant="default"
              size="sm"
              iconName="Edit"
              iconPosition="left"
              onClick={() => setShowEditModal(true)}
              className="flex-1"
            >
              Редактировать
            </Button>
            {needsRoomAssignment && (
              <Button
                variant="outline"
                size="sm"
                iconName="DoorOpen"
                iconPosition="left"
                onClick={() => handleActionClick('assign-room')}
              >
                Палата
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              iconName="MoreVertical"
              onClick={() => setShowActionsMenu(!showActionsMenu)}
            />
          </div>
        </div>
      )}
      
      <PatientEditModal
        patient={patient}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditSave}
      />
    </div>
  );
};

export default PatientGridRow;