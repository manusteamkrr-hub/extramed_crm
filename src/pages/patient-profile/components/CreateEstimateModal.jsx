import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const CreateEstimateModal = ({ isOpen, onClose, appliedServices, patientId, onEstimateCreated }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [paidAmount, setPaidAmount] = useState(0);
  const [insuranceType, setInsuranceType] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const totalAmount = appliedServices?.reduce((sum, service) => {
    const price = service?.price || 0;
    const days = service?.isDailyRate ? (service?.days || 1) : 1;
    const quantity = service?.quantity || 1;
    return sum + (price * days * quantity);
  }, 0);

  const paymentMethodOptions = [
    { value: '', label: 'Выберите тип оплаты' },
    { value: 'cash', label: 'Наличные' },
    { value: 'card', label: 'Карта' },
    { value: 'transfer', label: 'Перевод' }
  ];

  const paymentStatusOptions = [
    { value: 'unpaid', label: 'Неоплачена' },
    { value: 'paid', label: 'Оплачена' },
    { value: 'partially_paid', label: 'Оплачена частично' }
  ];

  const insuranceOptions = [
    { value: '', label: 'Без страхования' },
    { value: 'dms', label: 'ДМС' }
  ];

  const handleCreate = async () => {
    if (!paymentMethod) {
      alert('Пожалуйста, выберите тип оплаты');
      return;
    }

    if (appliedServices?.length === 0) {
      alert('Нет добавленных услуг для создания сметы');
      return;
    }

    setLoading(true);

    const estimateData = {
      patientId,
      services: appliedServices,
      totalAmount,
      paidAmount: paymentStatus === 'paid' ? totalAmount : (paymentStatus === 'partially_paid' ? parseFloat(paidAmount) : 0),
      paymentMethod,
      paymentStatus,
      insuranceType,
      createdAt: new Date()?.toISOString(),
      number: `EST-${Date.now()}`
    };

    await onEstimateCreated(estimateData);
    setLoading(false);
    onClose();
  };

  const remainingAmount = totalAmount - parseFloat(paidAmount || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 md:p-6 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
            Создать смету
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-smooth"
            disabled={loading}
          >
            <Icon name="X" size={20} color="var(--color-muted-foreground)" />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {/* Services Summary */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="text-base font-heading font-semibold text-foreground mb-3">
              Услуги ({appliedServices?.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {appliedServices?.map((service, index) => {
                const serviceTotal = service?.price * (service?.isDailyRate ? service?.days : 1) * service?.quantity;
                return (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-foreground">{service?.name}</span>
                    <span className="font-semibold text-foreground">{serviceTotal?.toLocaleString('ru-RU')} ₽</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border mt-3 pt-3 flex justify-between">
              <span className="font-heading font-semibold text-foreground">Итого:</span>
              <span className="text-xl font-heading font-bold text-success">{totalAmount?.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>

          {/* Payment Method */}
          <Select
            label="Тип оплаты *"
            value={paymentMethod}
            onChange={setPaymentMethod}
            options={paymentMethodOptions}
          />

          {/* Payment Status */}
          <Select
            label="Статус сметы *"
            value={paymentStatus}
            onChange={(value) => {
              setPaymentStatus(value);
              if (value === 'paid') {
                setPaidAmount(totalAmount);
              } else if (value === 'unpaid') {
                setPaidAmount(0);
              }
            }}
            options={paymentStatusOptions}
          />

          {/* Partial Payment Amount */}
          {paymentStatus === 'partially_paid' && (
            <div className="space-y-2">
              <Input
                label="Оплаченная сумма"
                type="number"
                min="0"
                max={totalAmount}
                value={paidAmount}
                onChange={(e) => setPaidAmount(e?.target?.value)}
                placeholder="Введите оплаченную сумму"
              />
              {remainingAmount > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="AlertCircle" size={16} color="var(--color-warning)" />
                  <span className="text-warning">
                    Остаток: {remainingAmount?.toLocaleString('ru-RU')} ₽ (Долг)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Insurance Type */}
          <Select
            label="Страхование"
            value={insuranceType}
            onChange={setInsuranceType}
            options={insuranceOptions}
          />

          {/* Status Indicators */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="text-sm font-caption font-semibold text-foreground mb-2">Индикаторы статуса:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="text-muted-foreground">Оплачена - 100% суммы оплачено</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error"></div>
                <span className="text-muted-foreground">Неоплачена - 0% суммы оплачено</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <span className="text-muted-foreground">Частично оплачена - есть остаток/долг</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border p-4 md:p-6 flex gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Отмена
          </Button>
          <Button
            variant="default"
            size="md"
            iconName="Check"
            onClick={handleCreate}
            disabled={loading || !paymentMethod}
            className="flex-1"
          >
            {loading ? 'Создание...' : 'Создать смету'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateEstimateModal;