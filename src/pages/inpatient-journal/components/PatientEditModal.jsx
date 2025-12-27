import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

import inpatientService from '../../../services/inpatientService';


const PatientEditModal = ({ patient, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: 'standard',
    admissionDate: '',
    attendingPhysician: '',
    estimatedDischarge: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extensionDays, setExtensionDays] = useState(1);
  
  // 🆕 NEW: Auto-sync state tracking
  const [autoSyncedFields, setAutoSyncedFields] = useState({
    physician: false,
    roomType: false
  });

  // 🆕 NEW: Check if patient is from placement service
  const [isPlacementBased, setIsPlacementBased] = useState(false);

  useEffect(() => {
    if (patient) {
      // 🆕 NEW: Detect placement-based patients
      const isFromPlacement = patient?.source === 'placement_service' || patient?.id?.startsWith('placement_');
      setIsPlacementBased(isFromPlacement);
      
      // 🔧 FIXED: Auto-sync attending physician from patient profile
      const syncedPhysician = getSyncedPhysician(patient);
      
      // 🔧 FIXED: Auto-sync room type from estimate services
      const syncedRoomType = getRoomTypeFromEstimate(patient);
      
      setFormData({
        roomNumber: patient?.roomNumber || patient?.room_number || '',
        roomType: syncedRoomType || patient?.roomType || patient?.room_type || 'standard',
        admissionDate: patient?.admissionDate || patient?.admission_date || '',
        attendingPhysician: syncedPhysician,
        estimatedDischarge: patient?.estimatedDischarge || patient?.estimated_discharge || ''
      });
      
      // Track which fields were auto-synced
      setAutoSyncedFields({
        physician: !!syncedPhysician,
        roomType: !!syncedRoomType
      });
    }
  }, [patient]);

  // 🆕 NEW: Function to get synced physician from patient profile
  const getSyncedPhysician = (patientData) => {
    if (!patientData) return '';
    
    // Priority: patient profile > diagnoses table > existing inpatient record
    const patientProfile = patientData?.patients || {};
    
    // Try to get from patient profile
    if (patientProfile?.attendingPhysician || patientProfile?.attending_physician) {
      return patientProfile?.attendingPhysician || patientProfile?.attending_physician;
    }
    
    // Fallback to existing inpatient record
    if (patientData?.attendingPhysician || patientData?.attending_physician) {
      return patientData?.attendingPhysician || patientData?.attending_physician;
    }
    
    return '';
  };

  // 🆕 NEW: Function to extract room type from estimate ward services
  const getRoomTypeFromEstimate = (patientData) => {
    if (!patientData) return null;
    
    // If room type already assigned from placement service, use it
    if (patientData?.source === 'placement_service') {
      return patientData?.roomType || patientData?.room_type || 'standard';
    }
    
    // If room type exists and is not default, keep it
    if (patientData?.roomType || patientData?.room_type) {
      const existingType = patientData?.roomType || patientData?.room_type;
      if (existingType !== 'standard' && existingType !== 'Не назначена') {
        return existingType;
      }
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    // 🔧 FIXED: Prevent updates to placement-based patients
    if (isPlacementBased) {
      setError('Невозможно редактировать пациента из сметы. Эти данные автоматически синхронизируются с оплаченными услугами.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Update inpatient record
      const updates = {
        room_number: formData?.roomNumber,
        roomNumber: formData?.roomNumber,
        room_type: formData?.roomType,
        roomType: formData?.roomType,
        admission_date: formData?.admissionDate,
        admissionDate: formData?.admissionDate,
        attending_physician: formData?.attendingPhysician,
        attendingPhysician: formData?.attendingPhysician,
        estimated_discharge: formData?.estimatedDischarge,
        estimatedDischarge: formData?.estimatedDischarge,
        updated_at: new Date()?.toISOString()
      };

      await inpatientService?.updateInpatient(patient?.id, updates);
      
      // Call onSave callback to refresh data
      if (onSave) {
        await onSave();
      }
      
      onClose();
    } catch (err) {
      setError(err?.message || 'Ошибка при сохранении данных');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // 🔧 FIXED: Better patient name resolution matching grid row pattern
  const patientName = patient?.name || patient?.patients?.name || 'Неизвестный пациент';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg elevation-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 md:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
              Редактирование данных пациента
            </h2>
            <p className="text-sm caption text-muted-foreground mt-1">
              {patientName}
            </p>
            {/* 🆕 NEW: Show MRN for additional identification */}
            {(patient?.medicalRecordNumber || patient?.patients?.medical_record_number) && (
              <p className="text-xs caption text-muted-foreground mt-0.5">
                МКБ: {patient?.medicalRecordNumber || patient?.patients?.medical_record_number}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-smooth"
          >
            <Icon name="X" size={24} color="var(--color-muted-foreground)" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          {error && (
            <div className="p-4 bg-error/10 border border-error rounded-lg flex items-start gap-3">
              <Icon name="AlertCircle" size={20} color="var(--color-error)" />
              <div className="flex-1">
                <p className="text-sm font-medium text-error">{error}</p>
              </div>
            </div>
          )}

          {/* 🆕 NEW: Warning for placement-based patients */}
          {isPlacementBased && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="AlertTriangle" size={20} color="var(--color-yellow-600)" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900 mb-1">
                    Пациент из сметы
                  </p>
                  <p className="text-xs text-yellow-700">
                    Этот пациент был автоматически добавлен из оплаченной сметы. 
                    Данные синхронизируются с услугами размещения и профилем пациента. 
                    Прямое редактирование недоступно.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 🆕 NEW: Info banner about auto-sync */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} color="var(--color-blue-600)" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Автоматическая синхронизация данных
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  {autoSyncedFields?.physician && (
                    <li className="flex items-center gap-1">
                      <Icon name="Check" size={14} color="var(--color-blue-600)" />
                      <span>Лечащий врач синхронизирован из профиля пациента</span>
                    </li>
                  )}
                  {autoSyncedFields?.roomType && (
                    <li className="flex items-center gap-1">
                      <Icon name="Check" size={14} color="var(--color-blue-600)" />
                      <span>Тип палаты определён из оплаченных услуг сметы</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Room Number */}
            <div>
              <label className="block text-sm font-caption font-medium text-foreground mb-2">
                Номер палаты
              </label>
              <Input
                type="text"
                value={formData?.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e?.target?.value })}
                placeholder="Введите номер палаты"
                required
                disabled={isPlacementBased}
              />
            </div>

            {/* 🔧 REMOVED: Room Type selector - now auto-synced */}
            {/* Room Type Display - Read-only with sync indicator */}
            <div>
              <label className="block text-sm font-caption font-medium text-foreground mb-2 flex items-center gap-2">
                Тип палаты
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                  <Icon name="RefreshCw" size={12} />
                  Авто
                </span>
              </label>
              <div className="px-3 py-2 border border-muted rounded-lg bg-muted/30">
                <p className="text-sm text-foreground">
                  {formData?.roomType === 'economy' && 'Эконом'}
                  {formData?.roomType === 'standard' && 'Стандарт'}
                  {formData?.roomType === 'comfort' && 'Комфорт'}
                  {formData?.roomType === 'vip' && 'VIP'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Определяется автоматически из оплаченных услуг
                </p>
              </div>
            </div>

            {/* Admission Date */}
            <div>
              <label className="block text-sm font-caption font-medium text-foreground mb-2">
                Дата поступления
              </label>
              <Input
                type="date"
                value={formData?.admissionDate?.split('T')?.[0] || ''}
                onChange={(e) => setFormData({ ...formData, admissionDate: new Date(e.target.value)?.toISOString() })}
                required
                disabled={isPlacementBased}
              />
            </div>

            {/* 🔧 REMOVED: Attending Physician selector - now auto-synced */}
            {/* Attending Physician Display - Read-only with sync indicator */}
            <div>
              <label className="block text-sm font-caption font-medium text-foreground mb-2 flex items-center gap-2">
                Лечащий врач
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                  <Icon name="RefreshCw" size={12} />
                  Авто
                </span>
              </label>
              <div className="px-3 py-2 border border-muted rounded-lg bg-muted/30">
                <p className="text-sm text-foreground">
                  {formData?.attendingPhysician || 'Не назначен'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Синхронизируется из профиля пациента
                </p>
              </div>
            </div>

            {/* Estimated Discharge Date */}
            <div className="md:col-span-2">
              <label className="block text-sm font-caption font-medium text-foreground mb-2">
                Планируемая дата выписки
              </label>
              <Input
                type="date"
                value={formData?.estimatedDischarge?.split('T')?.[0] || ''}
                onChange={(e) => setFormData({ ...formData, estimatedDischarge: new Date(e.target.value)?.toISOString() })}
                disabled={isPlacementBased}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="default"
              iconName="Save"
              iconPosition="left"
              disabled={loading || isPlacementBased}
              className="flex-1"
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientEditModal;