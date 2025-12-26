import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import { medicalServices, serviceCategories, getCategoryDisplayName, getServicesByCategory, calculateServiceTotal } from '../../../data/medicalServices';
import CreateEstimateModal from './CreateEstimateModal';

const FinancialSummaryTab = ({ financialData, userRole, patientId, onEstimateCreated }) => {
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [serviceDays, setServiceDays] = useState(1);
  const [serviceQuantity, setServiceQuantity] = useState(1);
  const [appliedServices, setAppliedServices] = useState([]);
  const [showEstimateModal, setShowEstimateModal] = useState(false);

  // Load applied services from existing estimates
  useEffect(() => {
    if (financialData?.estimates && financialData?.estimates?.length > 0) {
      const allServices = financialData?.estimates?.flatMap(estimate => 
        (estimate?.services || [])?.map(service => ({
          ...service,
          estimateId: estimate?.id,
          estimateNumber: estimate?.number,
          estimateDate: estimate?.createdDate,
          isDailyRate: service?.isDailyRate || false,
          quantity: service?.quantity || 1,
          days: service?.days || 1,
          price: service?.price,
          code: service?.code,
          name: service?.name,
          category: service?.category,
          unit: service?.unit || 'услуга',
          appliedDate: estimate?.createdDate?.split('T')?.[0],
          isNewService: false // Mark as existing service from estimate
        }))
      );
      setAppliedServices(allServices);
    }
  }, [financialData]);

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

  const handleAddService = () => {
    if (!selectedService) return;

    const newService = {
      ...selectedService,
      days: selectedService?.isDailyRate ? serviceDays : 1,
      quantity: serviceQuantity,
      appliedDate: new Date()?.toISOString()?.split('T')?.[0],
      isNewService: true // Mark as new service not yet in estimate
    };

    setAppliedServices([...appliedServices, newService]);
    setSelectedService(null);
    setServiceDays(1);
    setServiceQuantity(1);
    setShowServiceSelector(false);
    setSelectedCategory('');
  };

  const handleRemoveService = (index) => {
    const serviceToRemove = appliedServices?.[index];
    
    // Only allow removal of new services that haven't been added to an estimate yet
    if (serviceToRemove?.isNewService) {
      setAppliedServices(appliedServices?.filter((_, i) => i !== index));
    } else {
      alert('Невозможно удалить услугу из существующей сметы. Отредактируйте смету.');
    }
  };

  const getTotalAppliedServicesAmount = () => {
    return appliedServices?.reduce((total, service) => {
      return total + calculateServiceTotal(service, service?.days, service?.quantity);
    }, 0);
  };

  const getNewServicesForEstimate = () => {
    return appliedServices?.filter(service => service?.isNewService);
  };

  const categoryOptions = Object.values(serviceCategories)?.map(cat => ({
    value: cat,
    label: getCategoryDisplayName(cat)
  }));

  const serviceOptions = selectedCategory 
    ? getServicesByCategory(selectedCategory)?.map(service => ({
        value: service?.id,
        label: `${service?.code} - ${service?.name} (${service?.price?.toLocaleString('ru-RU')} ₽/${service?.unit})`
      }))
    : [];

  const findServiceById = (id) => {
    return medicalServices?.find(s => s?.id === id);
  };

  const handleCreateEstimate = () => {
    const newServices = getNewServicesForEstimate();
    if (newServices?.length === 0) {
      alert('Пожалуйста, добавьте новые услуги перед созданием сметы');
      return;
    }
    setShowEstimateModal(true);
  };

  const handleEstimateCreated = async (estimateData) => {
    if (onEstimateCreated) {
      await onEstimateCreated(estimateData);
    }
    // Don't clear appliedServices anymore - they will be reloaded from estimates via useEffect
    setShowEstimateModal(false);
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

  if (userRole === 'doctor') {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <Icon name="Lock" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
        <p className="text-sm md:text-base caption text-muted-foreground">
          Финансовая информация доступна только администраторам и бухгалтерам
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Applied Services Section */}
      <div className="bg-card border border-border rounded-lg p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground">
              Примененные услуги
            </h2>
            <p className="text-sm caption text-muted-foreground mt-1">
              Все услуги из смет пациента
            </p>
          </div>
          <Button
            variant="default"
            size="sm"
            iconName="Plus"
            iconPosition="left"
            onClick={() => setShowServiceSelector(!showServiceSelector)}
          >
            Добавить услугу
          </Button>
        </div>

        {showServiceSelector && (
          <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
            <h3 className="text-base font-heading font-semibold text-foreground mb-4">Выбор услуги</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select
                label="Категория услуг"
                value={selectedCategory}
                onChange={(newValue) => {
                  setSelectedCategory(newValue);
                  setSelectedService(null);
                }}
                options={[{ value: '', label: 'Выберите категорию' }, ...categoryOptions]}
              />
              <Select
                label="Услуга"
                value={selectedService?.id || ''}
                onChange={(newValue) => setSelectedService(findServiceById(newValue))}
                options={[{ value: '', label: 'Выберите услугу' }, ...serviceOptions]}
                disabled={!selectedCategory}
              />
            </div>

            {selectedService && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {selectedService?.isDailyRate && (
                  <Input
                    label="Количество дней"
                    type="number"
                    min="1"
                    value={serviceDays}
                    onChange={(e) => setServiceDays(parseInt(e?.target?.value) || 1)}
                  />
                )}
                <Input
                  label="Количество"
                  type="number"
                  min="1"
                  value={serviceQuantity}
                  onChange={(e) => setServiceQuantity(parseInt(e?.target?.value) || 1)}
                />
              </div>
            )}

            {selectedService && (
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg mb-4">
                <div>
                  <p className="text-sm font-caption text-muted-foreground">Стоимость:</p>
                  <p className="text-lg font-body font-semibold text-foreground">
                    {calculateServiceTotal(selectedService, serviceDays, serviceQuantity)?.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
                {selectedService?.isDailyRate && (
                  <p className="text-xs caption text-muted-foreground">
                    {selectedService?.price?.toLocaleString('ru-RU')} ₽ × {serviceDays} дней × {serviceQuantity}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowServiceSelector(false);
                  setSelectedService(null);
                  setSelectedCategory('');
                  setServiceDays(1);
                  setServiceQuantity(1);
                }}
              >
                Отмена
              </Button>
              <Button
                variant="default"
                size="sm"
                iconName="Check"
                onClick={handleAddService}
                disabled={!selectedService}
              >
                Добавить
              </Button>
            </div>
          </div>
        )}

        {appliedServices?.length > 0 && (
          <div className="space-y-3">
            {appliedServices?.map((service, index) => {
              const total = calculateServiceTotal(service, service?.days, service?.quantity);
              const isNewService = service?.isNewService;
              
              return (
                <div key={index} className="flex items-start justify-between p-4 bg-muted/20 rounded-lg border border-border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2 flex-wrap">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-caption bg-primary/10 text-primary border border-primary/20">
                        {getCategoryDisplayName(service?.category)}
                      </span>
                      {!isNewService && service?.estimateNumber && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-caption bg-info/10 text-info border border-info/20">
                          Смета: {service?.estimateNumber}
                        </span>
                      )}
                      {isNewService && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-caption bg-warning/10 text-warning border border-warning/20">
                          Новая услуга
                        </span>
                      )}
                      <span className="text-xs caption text-muted-foreground">
                        {isNewService ? 'Добавлена' : 'Применена'}: {service?.appliedDate}
                      </span>
                    </div>
                    <h4 className="text-sm md:text-base font-body font-medium text-foreground mb-1">
                      {service?.name}
                    </h4>
                    <div className="flex flex-wrap gap-3 text-xs md:text-sm caption text-muted-foreground">
                      <span>Код: {service?.code}</span>
                      {service?.isDailyRate && <span>• Дней: {service?.days}</span>}
                      {service?.quantity > 1 && <span>• Количество: {service?.quantity}</span>}
                      <span>• Ед.изм: {service?.unit}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      <p className="text-base md:text-lg font-body font-semibold text-foreground">
                        {total?.toLocaleString('ru-RU')} ₽
                      </p>
                      {service?.isDailyRate && service?.days > 1 && (
                        <p className="text-xs caption text-muted-foreground">
                          {service?.price?.toLocaleString('ru-RU')} ₽ × {service?.days}
                        </p>
                      )}
                    </div>
                    {isNewService && (
                      <button
                        onClick={() => handleRemoveService(index)}
                        className="p-2 rounded-lg hover:bg-error/10 transition-smooth"
                        title="Удалить услугу"
                      >
                        <Icon name="Trash2" size={18} color="var(--color-error)" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            
            <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
              <span className="text-base md:text-lg font-heading font-semibold text-foreground">
                Итого по услугам:
              </span>
              <span className="text-xl md:text-2xl font-heading font-bold text-success">
                {getTotalAppliedServicesAmount()?.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>
        )}

        {getNewServicesForEstimate()?.length > 0 && (
          <div className="mt-4 p-4 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-start gap-3 mb-3">
              <Icon name="AlertCircle" size={20} color="var(--color-warning)" />
              <div>
                <p className="text-sm font-body font-semibold text-foreground">
                  У вас есть {getNewServicesForEstimate()?.length} новых услуг
                </p>
                <p className="text-xs caption text-muted-foreground mt-1">
                  Создайте смету, чтобы эти услуги были зафиксированы в финансовой системе
                </p>
              </div>
            </div>
            <Button
              variant="default"
              size="md"
              iconName="FileText"
              iconPosition="left"
              onClick={handleCreateEstimate}
            >
              Создать смету ({getNewServicesForEstimate()?.length} услуг)
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="FileText" size={20} color="var(--color-primary)" />
            </div>
            <p className="text-sm caption text-muted-foreground">Всего смет</p>
          </div>
          <p className="text-2xl md:text-3xl font-heading font-semibold text-foreground data-text">
            {financialData?.totalEstimates}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Icon name="Ruble" size={20} color="var(--color-success)" />
            </div>
            <p className="text-sm caption text-muted-foreground">Оплачено</p>
          </div>
          <p className="text-2xl md:text-3xl font-heading font-semibold text-foreground data-text">
            {financialData?.totalPaid?.toLocaleString('ru-RU')} ₽
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Icon name="AlertCircle" size={20} color="var(--color-warning)" />
            </div>
            <p className="text-sm caption text-muted-foreground">Задолженность</p>
          </div>
          <p className="text-2xl md:text-3xl font-heading font-semibold text-foreground data-text">
            {financialData?.totalOutstanding?.toLocaleString('ru-RU')} ₽
          </p>
        </div>
      </div>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground">
            Сметы
          </h2>
        </div>

        <div className="space-y-3">
          {financialData?.estimates?.map((estimate, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-4 md:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="text-base md:text-lg font-heading font-semibold text-foreground data-text">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm caption text-muted-foreground">
                      <Icon name="Calendar" size={16} />
                      <span>Создана: {estimate?.createdDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm caption text-muted-foreground">
                      <Icon name="User" size={16} />
                      <span>{estimate?.createdBy}</span>
                    </div>
                  </div>

                  {/* Services breakdown with daily calculation */}
                  {estimate?.services && estimate?.services?.length > 0 && (
                    <div className="mb-4 bg-muted/30 rounded-lg p-3">
                      <p className="text-xs caption text-muted-foreground mb-2 font-semibold">Услуги:</p>
                      <div className="space-y-2">
                        {estimate?.services?.map((service, sIdx) => {
                          const serviceTotal = calculateServiceTotal(service);
                          return (
                            <div key={sIdx} className="flex items-start justify-between gap-2 text-xs">
                              <div className="flex-1 min-w-0">
                                <p className="text-foreground font-medium">{service?.name}</p>
                                <p className="text-muted-foreground caption">
                                  Код: {service?.id}
                                  {service?.isDailyRate && service?.days && (
                                    <span className="ml-2">• {service?.days} {service?.days === 1 ? 'день' : service?.days < 5 ? 'дня' : 'дней'}</span>
                                  )}
                                  {service?.quantity > 1 && (
                                    <span className="ml-2">• Кол-во: {service?.quantity}</span>
                                  )}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-foreground font-semibold">
                                  {serviceTotal?.toLocaleString('ru-RU')} ₽
                                </p>
                                {service?.isDailyRate && service?.days > 1 && (
                                  <p className="text-muted-foreground caption">
                                    {service?.price?.toLocaleString('ru-RU')} ₽ × {service?.days}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                    <div className="flex items-center gap-2">
                      <span className="caption text-muted-foreground">Сумма:</span>
                      <span className="font-body font-semibold text-foreground data-text">
                        {estimate?.totalAmount?.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="caption text-muted-foreground">Оплачено:</span>
                      <span className="font-body font-semibold text-success data-text">
                        {estimate?.paidAmount?.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    {estimate?.outstandingAmount > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="caption text-muted-foreground">Остаток/Долг:</span>
                        <span className="font-body font-semibold text-error data-text">
                          {estimate?.outstandingAmount?.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" iconName="Eye">
                    Просмотр
                  </Button>
                  {estimate?.status !== 'paid' && (
                    <Button variant="default" size="sm" iconName="CreditCard">
                      Оплатить
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border pt-4 md:pt-6">
        <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-4">
          История платежей
        </h2>

        <div className="space-y-3">
          {financialData?.paymentHistory?.map((payment, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Icon name={getPaymentMethodIcon(payment?.method)} size={20} color="var(--color-success)" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-body font-medium text-foreground mb-1">
                      Платеж #{payment?.id}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm caption text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" size={14} />
                        {payment?.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="User" size={14} />
                        {payment?.processedBy}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base md:text-lg font-body font-semibold text-success data-text">
                    {payment?.amount?.toLocaleString('ru-RU')} ₽
                  </p>
                  <p className="text-xs caption text-muted-foreground mt-1">
                    {payment?.methodLabel}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <CreateEstimateModal
        isOpen={showEstimateModal}
        onClose={() => setShowEstimateModal(false)}
        appliedServices={getNewServicesForEstimate()}
        patientId={patientId}
        onEstimateCreated={handleEstimateCreated}
      />
    </div>
  );
};

export default FinancialSummaryTab;