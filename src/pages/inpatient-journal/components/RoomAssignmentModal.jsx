import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import estimateService from '../../../services/estimateService';
import inpatientService from '../../../services/inpatientService';

const RoomAssignmentModal = ({ isOpen, onClose, patient, rooms, onSuccess }) => {
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [estimatedDischarge, setEstimatedDischarge] = useState(null);
  const [serviceDuration, setServiceDuration] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen && patient) {
      loadPatientServiceData();
    }
  }, [isOpen, patient]);

  useEffect(() => {
    if (selectedRoomType) {
      filterAvailableRooms();
    }
  }, [selectedRoomType, rooms]);

  const loadPatientServiceData = async () => {
    try {
      setLoading(true);
      
      // Get patient's active estimates to determine discharge date
      const estimatesResult = await estimateService?.getEstimates();
      if (estimatesResult?.success) {
        const patientEstimates = estimatesResult?.data?.filter(est => {
          const estPatientId = est?.patientId || est?.patient_id;
          return estPatientId === patient?.id && 
            (est?.status === 'active' || est?.status === 'approved');
        });

        if (patientEstimates?.length > 0) {
          // Find placement service to get duration
          patientEstimates?.forEach(estimate => {
            const services = estimate?.services || estimate?.estimate_items || [];
            const placementService = services?.find(service => {
              const category = (service?.category || '')?.toLowerCase();
              const name = (service?.name || '')?.toLowerCase();
              return category?.includes('размещение') || 
                     category?.includes('placement') ||
                     name?.includes('палата') ||
                     name?.includes('размещение');
            });

            if (placementService) {
              const days = placementService?.days || placementService?.quantity || estimate?.total_days || estimate?.totalDays || 1;
              setServiceDuration(days);
              
              // Calculate discharge date
              const admissionDate = patient?.admissionDate || patient?.admission_date || new Date();
              const discharge = new Date(admissionDate);
              discharge?.setDate(discharge?.getDate() + days);
              setEstimatedDischarge(discharge?.toISOString()?.split('T')?.[0]);

              // Pre-select room type from service if available
              const serviceName = (placementService?.name || '')?.toLowerCase();
              if (serviceName?.includes('эконом')) setSelectedRoomType('economy');
              else if (serviceName?.includes('vip')) setSelectedRoomType('vip');
              else if (serviceName?.includes('комфорт')) setSelectedRoomType('comfort');
              else if (serviceName?.includes('стандарт')) setSelectedRoomType('standard');
            }
          });
        } else {
          // Default to 7 days if no estimate found
          setServiceDuration(7);
          const discharge = new Date();
          discharge?.setDate(discharge?.getDate() + 7);
          setEstimatedDischarge(discharge?.toISOString()?.split('T')?.[0]);
        }
      }
    } catch (error) {
      console.error('Error loading patient service data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAvailableRooms = () => {
    const filtered = rooms?.filter(room => 
      room?.type === selectedRoomType && 
      room?.capacity > room?.occupied
    );
    setAvailableRooms(filtered);
    
    // Auto-select first available room
    if (filtered?.length > 0 && !selectedRoomNumber) {
      setSelectedRoomNumber(filtered?.[0]?.number);
    }
  };

  const getRoomTypeLabel = (type) => {
    const labels = {
      economy: 'Эконом',
      standard: 'Стандарт',
      comfort: 'Комфорт',
      vip: 'VIP'
    };
    return labels?.[type] || type;
  };

  const handleSubmit = () => {
    if (!selectedRoomType || !selectedRoomNumber) {
      alert('Пожалуйста, выберите тип палаты и номер');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      
      const roomAssignment = {
        patientId: patient?.id || patient?.patient_id,
        patient_id: patient?.id || patient?.patient_id,
        room_number: selectedRoomNumber,
        roomNumber: selectedRoomNumber,
        room_type: selectedRoomType,
        roomType: selectedRoomType,
        admission_date: patient?.admissionDate || patient?.admission_date || new Date()?.toISOString(),
        admissionDate: patient?.admissionDate || patient?.admission_date || new Date()?.toISOString(),
        estimated_discharge: estimatedDischarge,
        estimatedDischarge: estimatedDischarge,
        attending_physician: patient?.attendingPhysician || patient?.attending_physician || 'Не назначен',
        attendingPhysician: patient?.attendingPhysician || patient?.attending_physician || 'Не назначен',
        treatment_status: 'treatment',
        treatmentStatus: 'treatment',
        billing_status: 'pending',
        billingStatus: 'pending',
        status: 'active',
        notes: notes,
        created_at: new Date()?.toISOString(),
        createdAt: new Date()?.toISOString()
      };

      await inpatientService?.createInpatient(roomAssignment);
      
      onSuccess?.();
      onClose();
      
      // Show success message
      alert(`Пациент ${patient?.name || patient?.patients?.name} успешно размещен в палате ${selectedRoomNumber}`);
    } catch (error) {
      console.error('Error assigning room:', error);
      alert('Ошибка при назначении палаты. Пожалуйста, попробуйте снова.');
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const resetForm = () => {
    setSelectedRoomType('');
    setSelectedRoomNumber('');
    setAvailableRooms([]);
    setEstimatedDischarge(null);
    setServiceDuration(0);
    setNotes('');
    setShowConfirmation(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleClose}>
        <div 
          className="bg-card rounded-lg elevation-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e?.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
                Назначение палаты
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {patient?.name || patient?.patients?.name} • МКБ: {patient?.medicalRecordNumber || patient?.patients?.medical_record_number}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              iconName="X"
              onClick={handleClose}
              title="Закрыть"
            />
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Service Duration Info */}
            {serviceDuration > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} color="var(--color-blue-600)" />
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">
                      Информация из услуг
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Длительность размещения: <strong>{serviceDuration} {serviceDuration === 1 ? 'день' : 'дней'}</strong>
                    </p>
                    {estimatedDischarge && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Планируемая выписка: <strong>{new Date(estimatedDischarge)?.toLocaleDateString('ru-RU')}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Room Type Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Тип палаты <span className="text-error">*</span>
              </label>
              <Select
                value={selectedRoomType}
                onChange={(e) => {
                  setSelectedRoomType(e?.target?.value);
                  setSelectedRoomNumber('');
                }}
                options={[
                  { value: '', label: 'Выберите тип палаты' },
                  { value: 'economy', label: 'Эконом' },
                  { value: 'standard', label: 'Стандарт' },
                  { value: 'comfort', label: 'Комфорт' },
                  { value: 'vip', label: 'VIP' }
                ]}
              />
            </div>

            {/* Available Rooms Preview */}
            {selectedRoomType && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Доступность палат ({getRoomTypeLabel(selectedRoomType)})
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableRooms?.length > 0 ? (
                    availableRooms?.map((room) => (
                      <button
                        key={room?.number}
                        onClick={() => setSelectedRoomNumber(room?.number)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedRoomNumber === room?.number
                            ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">
                            Палата {room?.number}
                          </span>
                          {selectedRoomNumber === room?.number && (
                            <Icon name="Check" size={16} color="var(--color-primary)" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="Users" size={14} color="var(--color-muted-foreground)" />
                          <span className="text-muted-foreground">
                            {room?.occupied}/{room?.capacity} занято
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-full p-8 text-center text-muted-foreground">
                      <Icon name="DoorClosed" size={32} color="var(--color-muted-foreground)" className="mx-auto mb-2" />
                      <p>Нет доступных палат данного типа</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Room Number (if manually selected) */}
            {selectedRoomType && availableRooms?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Номер палаты <span className="text-error">*</span>
                </label>
                <Input
                  type="text"
                  value={selectedRoomNumber}
                  onChange={(e) => setSelectedRoomNumber(e?.target?.value)}
                  placeholder="Введите номер палаты"
                />
              </div>
            )}

            {/* Discharge Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Планируемая дата выписки
              </label>
              <Input
                type="date"
                value={estimatedDischarge || ''}
                onChange={(e) => setEstimatedDischarge(e?.target?.value)}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Примечания
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e?.target?.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Дополнительная информация о размещении..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={loading || !selectedRoomType || !selectedRoomNumber}
              iconName={loading ? 'Loader' : 'Check'}
              iconPosition="left"
            >
              {loading ? 'Загрузка...' : 'Назначить палату'}
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-card rounded-lg elevation-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="DoorOpen" size={24} color="var(--color-primary)" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-foreground">
                    Подтверждение назначения
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Проверьте данные перед назначением
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-muted/30 rounded-lg p-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Пациент:</span>
                  <span className="font-medium text-foreground">{patient?.name || patient?.patients?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Палата:</span>
                  <span className="font-medium text-foreground">
                    {selectedRoomNumber} ({getRoomTypeLabel(selectedRoomType)})
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Длительность:</span>
                  <span className="font-medium text-foreground">{serviceDuration} дней</span>
                </div>
                {estimatedDischarge && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Выписка:</span>
                    <span className="font-medium text-foreground">
                      {new Date(estimatedDischarge)?.toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  variant="default"
                  onClick={handleConfirm}
                  disabled={loading}
                  iconName={loading ? 'Loader' : 'Check'}
                  iconPosition="left"
                  className="flex-1"
                >
                  {loading ? 'Назначение...' : 'Подтвердить'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoomAssignmentModal;