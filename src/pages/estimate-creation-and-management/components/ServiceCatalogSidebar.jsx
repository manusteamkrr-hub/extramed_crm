import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const ServiceCatalogSidebar = ({ onServiceSelect, selectedServices = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(['treatment-rooms']);

  const serviceCatalog = [
    {
      id: 'treatment-rooms',
      name: 'Лечение в палатах',
      icon: 'Bed',
      color: 'var(--color-primary)',
      services: [
        { id: '01', name: 'Лечение в палате "Эконом плюс"', price: 10000, unit: 'сутки', isDailyRate: true },
        { id: '02', name: 'Продление лечения в палате "Эконом плюс"', price: 10000, unit: 'сутки', isDailyRate: true },
        { id: '03', name: 'Лечение в палате "Стандарт"', price: 12000, unit: 'сутки', isDailyRate: true },
        { id: '04', name: 'Продление лечения в палате "Стандарт"', price: 12000, unit: 'сутки', isDailyRate: true },
        { id: '05', name: 'Лечение в палате "Эконом"', price: 7000, unit: 'сутки', isDailyRate: true },
        { id: '06', name: 'Продление лечения в палате "Эконом"', price: 7000, unit: 'сутки', isDailyRate: true },
        { id: '07', name: 'Лечение в палате "ВИП"', price: 26000, unit: 'сутки', isDailyRate: true },
        { id: '08', name: 'Продление лечения в палате "ВИП"', price: 26000, unit: 'сутки', isDailyRate: true },
        { id: '09', name: 'Лечение в палате "Комфорт"', price: 15000, unit: 'сутки', isDailyRate: true },
        { id: '10', name: 'Продление лечения в палате "Комфорт"', price: 15000, unit: 'сутки', isDailyRate: true },
        { id: '11', name: 'Лечение в палате "Комфорт+"', price: 16000, unit: 'сутки', isDailyRate: true },
        { id: '12', name: 'Продление лечения в палате "Комфорт+"', price: 16000, unit: 'сутки', isDailyRate: true },
        { id: '13', name: 'Лечение в палате "Эконом" в сопровождении родственника', price: 9000, unit: 'сутки', isDailyRate: true },
        { id: '14', name: 'Продление лечения в палате "Эконом" в сопровождении родственника', price: 9000, unit: 'сутки', isDailyRate: true },
        { id: '15', name: 'Лечение в палате "Эконом плюс" в сопровождении родственника', price: 13500, unit: 'сутки', isDailyRate: true },
        { id: '16', name: 'Продление лечения в палате "Эконом плюс" в сопровождении родственника', price: 13500, unit: 'сутки', isDailyRate: true },
        { id: '17', name: 'Лечение в палате "Стандарт" в сопровождении родственника', price: 16500, unit: 'сутки', isDailyRate: true },
        { id: '18', name: 'Продление лечения в палате "Стандарт" в сопровождении родственника', price: 16500, unit: 'сутки', isDailyRate: true },
        { id: '19', name: 'Лечение в палате "ВИП" в сопровождении родственника', price: 39000, unit: 'сутки', isDailyRate: true },
        { id: '20', name: 'Продление лечения в палате "ВИП" в сопровождении родственника', price: 39000, unit: 'сутки', isDailyRate: true },
        { id: '21', name: 'Лечение в палате "Комфорт" в сопровождении родственника', price: 22500, unit: 'сутки', isDailyRate: true },
        { id: '22', name: 'Продление лечения в палате "Комфорт" в сопровождении родственника', price: 22500, unit: 'сутки', isDailyRate: true },
        { id: '23', name: 'Лечение в палате "Комфорт+" в сопровождении родственника', price: 24000, unit: 'сутки', isDailyRate: true },
        { id: '24', name: 'Продление лечения в палате "Комфорт+" в сопровождении родственника', price: 24000, unit: 'сутки', isDailyRate: true },
      ],
    },
    {
      id: 'consultations',
      name: 'Консультации',
      icon: 'Stethoscope',
      color: 'var(--color-success)',
      services: [
        { id: 'C02', name: 'Консультация психиатра (первичный осмотр)', price: 3500, unit: 'сеанс' },
        { id: 'C03', name: 'Консультация психиатра с назначением препаратов и выпиской рецептов', price: 6000, unit: 'сеанс' },
        { id: 'C04', name: 'Консультация Главного врача', price: 5000, unit: 'сеанс' },
        { id: 'C05', name: 'Консультация невролога', price: 5000, unit: 'сеанс' },
        { id: 'C07', name: 'Консультация по химической зависимости', price: 6000, unit: 'сеанс' },
        { id: 'C10', name: 'Консилиум (профессор, д.м.н., к.м.н., главный врач, врач-психиатр, клиник)', price: 15000, unit: 'сеанс' },
        { id: 'C12', name: 'Консультация терапевта', price: 5000, unit: 'сеанс' },
        { id: 'C13', name: 'Сопровождение консультанта-аддиктолога', price: 6000, unit: 'сеанс' },
      ],
    },
    {
      id: 'iv-hospital',
      name: 'Капельницы и стационар',
      icon: 'Syringe',
      color: 'var(--color-warning)',
      services: [
        { id: 'IV01', name: 'Капельница «Стандарт» с 8.00 до 22.00', price: 6400, unit: 'проц.' },
        { id: 'IV02', name: 'Капельница «Стандарт» с 22.00 до 8.00', price: 7400, unit: 'проц.' },
        { id: 'IV03', name: 'Экстренное вытрезвление (до 3-х капельниц)', price: 11500, unit: 'проц.' },
        { id: 'IV04', name: 'Дневной стационар', price: 6000, unit: 'сутки', isDailyRate: true },
      ],
    },
    {
      id: 'psychotherapy',
      name: 'Психотерапия',
      icon: 'Brain',
      color: 'var(--color-accent)',
      services: [
        { id: 'PT01', name: 'Первичная консультация врача-психотерапевта (20 мин)', price: 2500, unit: 'сеанс' },
        { id: 'PT02', name: 'Индивидуальная психотерапия (1 сеанс)', price: 5000, unit: 'сеанс' },
        { id: 'PT03', name: 'Индивидуальная психотерапия (комплекс из 3-х сеансов)', price: 14000, unit: 'комп.' },
        { id: 'PT04', name: 'Индивидуальная психотерапия (комплекс из 5-ти сеансов)', price: 23000, unit: 'комп.' },
        { id: 'PT05', name: 'Клинико-психологическое консультирование (1 сеанс)', price: 8000, unit: 'сеанс' },
        { id: 'PT06', name: 'Клинико-психологическое консультирование (3 сеанса)', price: 23100, unit: 'комп.' },
        { id: 'PT07', name: 'Клинико-психологическое консультирование (5 сеансов)', price: 37500, unit: 'комп.' },
        { id: 'PT08', name: 'Групповая психотерапия', price: 3500, unit: 'сеанс' },
        { id: 'PT09', name: 'Групповая психотерапия (комплекс из 3-х сеансов)', price: 11000, unit: 'комп.' },
        { id: 'PT10', name: 'Групповая психотерапия (комплекс из 5-ти сеансов)', price: 15000, unit: 'комп.' },
        { id: 'PT11', name: 'Патопсихологическое обследование первичное', price: 6500, unit: 'сеанс' },
      ],
    },
    {
      id: 'laboratory',
      name: 'Лабораторная диагностика',
      icon: 'TestTube',
      color: 'var(--color-error)',
      services: [
        { id: 'LAB01', name: 'Экспресс-тест на алкоголь', price: 400, unit: 'шт.' },
        { id: 'LAB02', name: 'Тестирование на наркотические вещества (6 групп наркотических средств)', price: 1200, unit: 'тест' },
        { id: 'LAB03', name: 'Тестирование на наркотические вещества (10 групп наркотических средств)', price: 1800, unit: 'тест' },
        { id: 'LAB04', name: 'Химико-токсикологические исследования мочи на наличие наркотических средств', price: 5500, unit: 'сеанс' },
        { id: 'LAB05', name: 'Химико-токсикологические исследования образца биожидкости на наличии', price: 2500, unit: 'сеанс' },
        { id: 'LAB06', name: 'Иммунохроматографический анализ мочи на 10 групп наркотических средств', price: 1600, unit: 'сеанс' },
        { id: 'LAB07', name: 'Определение маркера злоупотребления алкоголем (CDT)', price: 2500, unit: 'сутки' },
      ],
    },
    {
      id: 'additional-procedures',
      name: 'Дополнительные процедуры',
      icon: 'Activity',
      color: 'var(--color-primary)',
      services: [
        { id: 'ADD01', name: 'МРТ гипофиз с контрастом (до 80 кг.)', price: 8200, unit: 'шт.' },
        { id: 'ADD02', name: 'Ноотропная терапия', price: 3000, unit: 'сеанс' },
        { id: 'ADD03', name: 'Гепатотропная терапия', price: 3500, unit: 'сеанс' },
        { id: 'ADD04', name: 'Гипербарическая оксигенотерапия (1 сеанс)', price: 6000, unit: 'сеанс' },
        { id: 'ADD05', name: 'Гипербарическая оксигенотерапия (комплекс из 3х сеансов)', price: 16000, unit: 'сеанс' },
        { id: 'ADD06', name: 'Ксенонотерапия (комплекс из 3х сеансов)', price: 42000, unit: 'комп.' },
        { id: 'ADD07', name: 'Дополнительно 1 литр Xenon к основному сеансу (не более 10 литров на 1 процедура)', price: 4500, unit: 'литр' },
        { id: 'ADD08', name: 'Процедура детоксикации', price: 15000, unit: 'сеанс' },
        { id: 'ADD09', name: 'Процедура детоксикации', price: 44000, unit: 'комп.' },
        { id: 'ADD10', name: 'Процедура детоксикации', price: 68000, unit: 'сеанс' },
      ],
    },
  ];

  const filteredCatalog = useMemo(() => {
    if (!searchQuery?.trim()) return serviceCatalog;

    const query = searchQuery?.toLowerCase();
    return serviceCatalog?.map((category) => ({
        ...category,
        services: category?.services?.filter(
          (service) =>
            service?.name?.toLowerCase()?.includes(query) ||
            service?.id?.toLowerCase()?.includes(query)
        ),
      }))?.filter((category) => category?.services?.length > 0);
  }, [searchQuery]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) =>
      prev?.includes(categoryId)
        ? prev?.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleServiceClick = (service, category) => {
    if (onServiceSelect) {
      onServiceSelect({
        ...service,
        categoryName: category?.name,
        categoryId: category?.id,
      });
    }
  };

  const isServiceSelected = (serviceId) => {
    return selectedServices?.some((s) => s?.id === serviceId);
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      <div className="p-4 md:p-6 border-b border-border">
        <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-4">
          Каталог услуг
        </h2>
        <Input
          type="search"
          placeholder="Поиск услуг..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e?.target?.value)}
          className="w-full"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        {filteredCatalog?.length > 0 ? (
          <div className="space-y-2">
            {filteredCatalog?.map((category) => {
              const isExpanded = expandedCategories?.includes(category?.id);
              return (
                <div key={category?.id} className="bg-muted/50 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category?.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted transition-smooth"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${category?.color}15` }}
                      >
                        <Icon name={category?.icon} size={18} color={category?.color} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm md:text-base font-body font-medium text-foreground">
                          {category?.name}
                        </p>
                        <p className="text-xs caption text-muted-foreground">
                          {category?.services?.length} услуг
                        </p>
                      </div>
                    </div>
                    <Icon
                      name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
                      size={20}
                      color="var(--color-muted-foreground)"
                    />
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border">
                      {category?.services?.map((service) => {
                        const isSelected = isServiceSelected(service?.id);
                        return (
                          <button
                            key={service?.id}
                            onClick={() => handleServiceClick(service, category)}
                            className={`
                              w-full text-left p-3 border-b border-border last:border-b-0
                              hover:bg-muted transition-smooth
                              ${isSelected ? 'bg-primary/5' : ''}
                            `}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-body font-medium text-foreground mb-1">
                                  {service?.name}
                                </p>
                                <p className="text-xs caption text-muted-foreground">
                                  Код: {service?.id}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-body font-semibold text-foreground whitespace-nowrap">
                                  {service?.price?.toLocaleString('ru-RU')} ₽
                                </p>
                                <p className="text-xs caption text-muted-foreground">
                                  за {service?.unit}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="mt-2 flex items-center gap-1 text-primary">
                                <Icon name="Check" size={14} />
                                <span className="text-xs caption">Добавлено</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="SearchX" size={32} className="mx-auto mb-3" />
            <p className="text-sm">Услуги не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCatalogSidebar;