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
      case 'extension':
        return { bg: 'bg-indigo-500/10', text: 'text-indigo-600', label: 'Продление' };
      case 'discharge-prep':
        return { bg: 'bg-purple-500/10', text: 'text-purple-600', label: 'Подготовка к выписке' };
      default:
        return { bg: 'bg-slate-500/10', text: 'text-slate-600', label: status || 'Неизвестно' };
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
  
  // 🔧 FIXED: Better room type label mapping
  const getRoomTypeLabel = (type) => {
    const labels = {
      'economy': 'Эконом',
      'standard': 'Стандарт',
      'comfort': 'Комфорт',
      'vip': 'VIP'
    };
    return labels?.[type] || type || 'Неизвестно';
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
    
  // 🔧 UPDATED: Get patient name for tooltips/modals but display only MRN in grid
  const patientName = patient?.name || patient?.patients?.name || 'Неизвестный пациент';
  const patientMRN = patient?.medicalRecordNumber || patient?.patients?.medical_record_number || 'Без номера';
  const patientPhysician = patient?.attendingPhysician || 'Не назначен';

  const handleActionClick = (action) => {
    setShowActionsMenu(false);
    
    if (action === 'edit-inline') {
      setShowEditModal(true);
      return;
    }
    
    if (action === 'extend-service') {
      // Handle service extension
      handleExtendService();
      return;
    }
    
    onQuickAction(patient?.id, action);
  };

  // 🆕 NEW: Handle service extension action
  const handleExtendService = async () => {
    // Show prompt to ask for extension days
    const daysInput = prompt('Введите количество дней для продления услуги (1-30):', '7');
    
    if (!daysInput) return; // User cancelled
    
    const days = parseInt(daysInput);
    
    if (isNaN(days) || days < 1 || days > 30) {
      alert('❌ Пожалуйста, введите корректное количество дней (от 1 до 30)');
      return;
    }
    
    try {
      const result = await createExtensionEstimate(patient?.id, days);
      
      if (result?.success) {
        alert(`✅ Создана смета на продление лечения на ${days} ${days === 1 ? 'день' : 'дней'}. Новая дата выписки: ${new Date(result?.newDischargeDate)?.toLocaleDateString('ru-RU')}`);
        
        // Trigger parent refresh
        if (onQuickAction) {
          onQuickAction(patient?.id, 'refresh-data');
        }
      } else {
        throw new Error(result?.error || 'Failed to create extension estimate');
      }
    } catch (err) {
      console.error('❌ Error extending service:', err);
      alert(`❌ Ошибка при создании сметы на продление: ${err?.message}`);
    }
  };

  // 🆕 NEW: Create extension estimate automatically
  const createExtensionEstimate = async (inpatientRecordId, days) => {
    try {
      console.log('📋 Creating extension estimate for inpatient record:', inpatientRecordId, 'days:', days);
      
      // 🔧 CRITICAL FIX: Use the ACTUAL patient ID from the inpatient record structure
      // The inpatientRecordId is NOT the same as the patient ID
      const actualPatientId = patient?.patientId || patient?.patient_id || patient?.patients?.id;
      
      if (!actualPatientId) {
        throw new Error('Could not determine actual patient ID from inpatient record');
      }
      
      console.log('🔍 Resolved actual patient ID:', actualPatientId, 'from inpatient record ID:', inpatientRecordId);
      
      // Get patient data using the ACTUAL patient ID
      const patients = JSON.parse(localStorage.getItem('extramed_patients') || '[]');
      const patientData = patients?.find(p => p?.id === actualPatientId);
      
      if (!patientData) {
        throw new Error(`Patient not found with ID: ${actualPatientId}`);
      }
      
      console.log('✅ Found patient data:', patientData?.name);
      
      // Get current room type
      const roomType = patient?.roomType || 'standard';
      
      // Determine service details based on room type
      const roomServiceMap = {
        'economy': {
          name: 'Продление лечения в палате (Эконом)',
          category: 'ward_treatment',
          price: 2000
        },
        'standard': {
          name: 'Продление лечения в палате (Стандарт)',
          category: 'ward_treatment',
          price: 3500
        },
        'comfort': {
          name: 'Продление лечения в палате (Комфорт)',
          category: 'ward_treatment',
          price: 5000
        },
        'vip': {
          name: 'Продление лечения в палате (VIP)',
          category: 'ward_treatment',
          price: 8000
        }
      };
      
      const serviceConfig = roomServiceMap?.[roomType] || roomServiceMap?.['standard'];
      
      // Create extension service
      const extensionService = {
        id: crypto.randomUUID(),
        name: serviceConfig?.name,
        category: serviceConfig?.category,
        categoryName: 'Лечение в палате',
        code: `WARD_EXT_${roomType?.toUpperCase()}`,
        price: serviceConfig?.price,
        quantity: days,
        days: days,
        totalPrice: serviceConfig?.price * days,
        discount: 0,
        finalPrice: serviceConfig?.price * days
      };
      
      // Calculate new discharge date
      const currentDischarge = patient?.estimatedDischarge ? new Date(patient.estimatedDischarge) : new Date();
      const newDischarge = new Date(currentDischarge);
      newDischarge?.setDate(newDischarge?.getDate() + days);
      
      // Create new estimate using ACTUAL patient ID
      const newEstimate = {
        id: crypto.randomUUID(),
        patientId: actualPatientId,
        patient_id: actualPatientId,
        patientName: patientData?.name,
        patient_name: patientData?.name,
        status: 'draft',
        type: 'extension',
        services: [extensionService],
        estimate_items: [extensionService],
        totalDays: days,
        total_days: days,
        subtotal: extensionService?.totalPrice,
        discount: 0,
        discountPercent: 0,
        discount_percent: 0,
        total: extensionService?.finalPrice,
        totalAmount: extensionService?.finalPrice,
        total_amount: extensionService?.finalPrice,
        notes: `Автоматическое продление лечения на ${days} ${days === 1 ? 'день' : 'дней'}`,
        createdAt: new Date()?.toISOString(),
        created_at: new Date()?.toISOString(),
        updatedAt: new Date()?.toISOString(),
        updated_at: new Date()?.toISOString(),
        extensionFrom: patient?.estimatedDischarge,
        extension_from: patient?.estimatedDischarge,
        extensionTo: newDischarge?.toISOString(),
        extension_to: newDischarge?.toISOString()
      };
      
      // Save estimate to localStorage
      const estimates = JSON.parse(localStorage.getItem('extramed_estimates') || '[]');
      estimates?.push(newEstimate);
      localStorage.setItem('extramed_estimates', JSON.stringify(estimates));
      
      // Dispatch events for real-time sync
      window.dispatchEvent(new CustomEvent('estimateCreated', {
        detail: newEstimate
      }));
      
      console.log('✅ Extension estimate created successfully:', newEstimate);
      
      return {
        success: true,
        estimate: newEstimate,
        newDischargeDate: newDischarge?.toISOString()
      };
    } catch (err) {
      console.error('❌ Error creating extension estimate:', err);
      return {
        success: false,
        error: err?.message
      };
    }
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
              title={`${patientName} - Нажмите для открытия профиля`}
            >
              <p className="font-body font-semibold text-foreground text-sm md:text-base">
                {patientMRN}
              </p>
              <p className="text-xs md:text-sm caption text-muted-foreground mt-0.5">
                ID пациента (MRN)
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
              {needsRoomAssignment ? 'Требуется назначение' : getRoomTypeLabel(patient?.roomType)}
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
              {patientPhysician}
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
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg elevation-md py-1 z-10 min-w-[200px]">
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
                    onClick={() => handleActionClick('extend-service')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-smooth flex items-center gap-2"
                  >
                    <Icon name="Calendar" size={16} />
                    Продлить услугу
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
            title={patientName}
          >
            <p className="font-body font-semibold text-foreground text-sm md:text-base">
              {patientMRN}
            </p>
            <p className="text-xs md:text-sm caption text-muted-foreground mt-0.5">
              {needsRoomAssignment ? 'Палата не назначена' : `Палата ${patient?.roomNumber}`} • {patientPhysician}
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
          <div className="pb-2 border-b border-border">
            <p className="text-xs caption text-muted-foreground mb-1">ФИО пациента</p>
            <p className="text-sm font-body text-foreground font-medium">{patientName}</p>
          </div>
          
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
              <p className="text-sm font-body text-foreground">{patientPhysician}</p>
            </div>
            <div>
              <p className="text-xs caption text-muted-foreground mb-1">Тип палаты</p>
              <p className={`text-sm font-body ${roomColor}`}>
                {getRoomTypeLabel(patient?.roomType)}
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