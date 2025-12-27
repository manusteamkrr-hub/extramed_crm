import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import inpatientService from '../../../services/inpatientService';

const PatientEditModal = ({ patient, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: 'standard',
    admissionDate: '',
    attendingPhysician: '',
    treatmentStatus: 'admission',
    estimatedDischarge: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patient) {
      setFormData({
        roomNumber: patient?.roomNumber || patient?.room_number || '',
        roomType: patient?.roomType || patient?.room_type || 'standard',
        admissionDate: patient?.admissionDate || patient?.admission_date || '',
        attendingPhysician: patient?.attendingPhysician || patient?.attending_physician || '',
        treatmentStatus: patient?.treatmentStatus || patient?.treatment_status || 'admission',
        estimatedDischarge: patient?.estimatedDischarge || patient?.estimated_discharge || ''
      });
    }
  }, [patient]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
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
        treatment_status: formData?.treatmentStatus,
        treatmentStatus: formData?.treatmentStatus,
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg elevation-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 md:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
              Редактирование данных пациента
            </h2>
            <p className="text-sm caption text-muted-foreground mt-1">
              {patient?.name || patient?.patients?.name}
            </p>
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
              />
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-sm font-caption font-medium text-foreground mb-2">
                Тип палаты
              </label>
              <Select
                value={formData?.roomType}
                onChange={(e) => setFormData({ ...formData, roomType: e?.target?.value })}
                required
              >
                <option value="economy">Эконом</option>
                <option value="standard">Стандарт</option>
                <option value="comfort">Комфорт</option>
                <option value="vip">VIP</option>
              </Select>
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
              />
            </div>

            {/* Attending Physician */}
            <div>
              <label className="block text-sm font-caption font-medium text-foreground mb-2">
                Лечащий врач
              </label>
              <Input
                type="text"
                value={formData?.attendingPhysician}
                onChange={(e) => setFormData({ ...formData, attendingPhysician: e?.target?.value })}
                placeholder="ФИО лечащего врача"
                required
              />
            </div>

            {/* Treatment Status */}
            <div>
              <label className="block text-sm font-caption font-medium text-foreground mb-2">
                Статус лечения
              </label>
              <Select
                value={formData?.treatmentStatus}
                onChange={(e) => setFormData({ ...formData, treatmentStatus: e?.target?.value })}
                required
              >
                <option value="admission">Поступление</option>
                <option value="treatment">Лечение</option>
                <option value="observation">Наблюдение</option>
                <option value="discharge-prep">Подготовка к выписке</option>
              </Select>
            </div>

            {/* Estimated Discharge Date */}
            <div>
              <label className="block text-sm font-caption font-medium text-foreground mb-2">
                Планируемая дата выписки
              </label>
              <Input
                type="date"
                value={formData?.estimatedDischarge?.split('T')?.[0] || ''}
                onChange={(e) => setFormData({ ...formData, estimatedDischarge: new Date(e.target.value)?.toISOString() })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="default"
              iconName="Save"
              iconPosition="left"
              disabled={loading}
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