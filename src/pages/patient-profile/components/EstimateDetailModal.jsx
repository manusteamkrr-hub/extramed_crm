import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { getCategoryDisplayName, calculateServiceTotal } from '../../../data/medicalServices';

const EstimateDetailModal = ({ isOpen, onClose, estimate }) => {
  if (!isOpen || !estimate) return null;

  const getEstimateStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-success/10 text-success border-success/20';
      case 'partially_paid':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'active':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'draft':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getEstimateStatusLabel = (status) => {
    switch (status) {
      case 'paid':
        return 'Оплачено';
      case 'partially_paid':
        return 'Частично оплачено';
      case 'active':
        return 'Активная';
      case 'draft':
        return 'Черновик';
      default:
        return 'Неизвестно';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return 'Wallet';
      case 'card':
        return 'CreditCard';
      case 'transfer':
        return 'ArrowRightLeft';
      default:
        return 'DollarSign';
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'cash':
        return 'Наличные';
      case 'card':
        return 'Карта';
      case 'transfer':
        return 'Перевод';
      default:
        return 'Не указан';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Create estimate details as text
    const estimateText = `
Смета: ${estimate?.number}
Статус: ${getEstimateStatusLabel(estimate?.status)}
Дата создания: ${estimate?.createdDate}
Создано: ${estimate?.createdBy}
${estimate?.paymentMethod ? `Способ оплаты: ${getPaymentMethodLabel(estimate?.paymentMethod)}` : ''}
${estimate?.insuranceType === 'dms' ? 'Тип: ДМС' : ''}

УСЛУГИ:
${estimate?.services?.map((service, idx) => {
  const total = calculateServiceTotal(service);
  return `${idx + 1}. ${service?.name} (${service?.code})
   Категория: ${getCategoryDisplayName(service?.category)}
   ${service?.isDailyRate && service?.days ? `Дней: ${service?.days}` : ''}
   ${service?.quantity > 1 ? `Количество: ${service?.quantity}` : ''}
   Цена: ${service?.price?.toLocaleString('ru-RU')} ₽
   Итого: ${total?.toLocaleString('ru-RU')} ₽`;
})?.join('\n\n')}

ФИНАНСЫ:
Общая сумма: ${estimate?.totalAmount?.toLocaleString('ru-RU')} ₽
Оплачено: ${estimate?.paidAmount?.toLocaleString('ru-RU')} ₽
${estimate?.outstandingAmount > 0 ? `Задолженность: ${estimate?.outstandingAmount?.toLocaleString('ru-RU')} ₽` : ''}
    `?.trim();

    // Create blob and download
    const blob = new Blob([estimateText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Смета_${estimate?.number}.txt`;
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="FileText" size={20} color="var(--color-primary)" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground">
                Детальный просмотр сметы
              </h2>
              <p className="text-sm caption text-muted-foreground">{estimate?.number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-smooth"
            aria-label="Закрыть"
          >
            <Icon name="X" size={20} color="var(--color-foreground)" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Estimate Header Info */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-heading font-semibold text-foreground">
                {estimate?.number}
              </h3>
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-caption border ${getEstimateStatusColor(estimate?.status)}`}>
                {getEstimateStatusLabel(estimate?.status)}
              </span>
              {estimate?.paymentMethod && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-caption bg-info/10 text-info border border-info/20">
                  <Icon name={getPaymentMethodIcon(estimate?.paymentMethod)} size={12} />
                  {getPaymentMethodLabel(estimate?.paymentMethod)}
                </span>
              )}
              {estimate?.insuranceType === 'dms' && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-caption bg-success/10 text-success border border-success/20">
                  ДМС
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm caption text-muted-foreground">
                <Icon name="Calendar" size={16} />
                <span>Создана: {estimate?.createdDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm caption text-muted-foreground">
                <Icon name="User" size={16} />
                <span>{estimate?.createdBy}</span>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
              Услуги ({estimate?.services?.length || 0})
            </h3>
            <div className="space-y-3">
              {estimate?.services?.map((service, idx) => {
                const serviceTotal = calculateServiceTotal(service);
                return (
                  <div key={idx} className="bg-muted/20 rounded-lg p-4 border border-border">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-caption bg-primary/10 text-primary border border-primary/20">
                            {getCategoryDisplayName(service?.category)}
                          </span>
                          <span className="text-xs caption text-muted-foreground">
                            Код: {service?.code || service?.id}
                          </span>
                        </div>
                        <h4 className="text-base font-body font-medium text-foreground mb-2">
                          {service?.name}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs caption text-muted-foreground">
                          <div>
                            <p className="font-semibold">Цена за единицу:</p>
                            <p>{service?.price?.toLocaleString('ru-RU')} ₽</p>
                          </div>
                          {service?.isDailyRate && service?.days && (
                            <div>
                              <p className="font-semibold">Количество дней:</p>
                              <p>{service?.days}</p>
                            </div>
                          )}
                          {service?.quantity > 1 && (
                            <div>
                              <p className="font-semibold">Количество:</p>
                              <p>{service?.quantity}</p>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">Единица измерения:</p>
                            <p>{service?.unit || 'услуга'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm caption text-muted-foreground mb-1">Итого:</p>
                        <p className="text-xl font-body font-semibold text-foreground">
                          {serviceTotal?.toLocaleString('ru-RU')} ₽
                        </p>
                        {service?.isDailyRate && service?.days > 1 && (
                          <p className="text-xs caption text-muted-foreground mt-1">
                            {service?.price?.toLocaleString('ru-RU')} ₽ × {service?.days}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
              Финансовая информация
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <span className="text-base font-body text-muted-foreground">Общая сумма:</span>
                <span className="text-xl font-heading font-semibold text-foreground">
                  {estimate?.totalAmount?.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
                <span className="text-base font-body text-muted-foreground">Оплачено:</span>
                <span className="text-xl font-heading font-semibold text-success">
                  {estimate?.paidAmount?.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              {estimate?.outstandingAmount > 0 && (
                <div className="flex items-center justify-between p-4 bg-error/10 rounded-lg border border-error/20">
                  <span className="text-base font-body text-muted-foreground">Задолженность:</span>
                  <span className="text-xl font-heading font-semibold text-error">
                    {estimate?.outstandingAmount?.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Printer"
              iconPosition="left"
              onClick={handlePrint}
            >
              Печать
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
              onClick={handleExport}
            >
              Экспорт
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {estimate?.status !== 'paid' && (
              <Button
                variant="default"
                size="sm"
                iconName="CreditCard"
                iconPosition="left"
              >
                Оплатить
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Закрыть
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateDetailModal;