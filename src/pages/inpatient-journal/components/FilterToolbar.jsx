import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const FilterToolbar = ({ onFilterChange, onSavePreset, savedPresets }) => {
  const [activeFilters, setActiveFilters] = useState({
    roomTypes: [],
    physician: '',
    admissionDateFrom: '',
    admissionDateTo: '',
    treatmentStatus: [],
    searchQuery: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const roomTypeOptions = [
    { value: 'economy', label: 'Эконом' },
    { value: 'standard', label: 'Стандарт' },
    { value: 'comfort', label: 'Комфорт' },
    { value: 'vip', label: 'VIP' }
  ];

  const physicianOptions = [
    { value: '', label: 'Все врачи' },
    { value: 'ivanov', label: 'Иванов И.И.' },
    { value: 'petrova', label: 'Петрова М.С.' },
    { value: 'sidorov', label: 'Сидоров П.А.' },
    { value: 'kuznetsova', label: 'Кузнецова Е.В.' }
  ];

  const treatmentStatusOptions = [
    { value: 'admission', label: 'Поступление' },
    { value: 'treatment', label: 'Лечение' },
    { value: 'observation', label: 'Наблюдение' },
    { value: 'discharge-prep', label: 'Подготовка к выписке' }
  ];

  const handleFilterUpdate = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      roomTypes: [],
      physician: '',
      admissionDateFrom: '',
      admissionDateTo: '',
      treatmentStatus: [],
      searchQuery: ''
    };
    setActiveFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(activeFilters)?.some(val => 
    Array.isArray(val) ? val?.length > 0 : val !== ''
  );

  const activeFilterCount = [
    activeFilters?.roomTypes?.length > 0,
    activeFilters?.physician !== '',
    activeFilters?.admissionDateFrom !== '' || activeFilters?.admissionDateTo !== '',
    activeFilters?.treatmentStatus?.length > 0,
    activeFilters?.searchQuery !== ''
  ]?.filter(Boolean)?.length;

  return (
    <div className="bg-card border-b border-border">
      <div className="p-3 md:p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 md:gap-4 mb-3 md:mb-4">
          <div className="flex-1 w-full lg:w-auto">
            <Input
              type="search"
              placeholder="Поиск по имени пациента, номеру палаты..."
              value={activeFilters?.searchQuery}
              onChange={(e) => handleFilterUpdate('searchQuery', e?.target?.value)}
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <Button
              variant="outline"
              size="sm"
              iconName={showAdvanced ? 'ChevronUp' : 'ChevronDown'}
              iconPosition="right"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex-1 lg:flex-initial"
            >
              Фильтры {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                iconName="X"
                onClick={handleClearFilters}
              >
                Очистить
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
            >
              Экспорт
            </Button>
          </div>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 p-3 md:p-4 bg-muted/50 rounded-lg">
            <Select
              label="Тип палаты"
              options={roomTypeOptions}
              value={activeFilters?.roomTypes}
              onChange={(val) => handleFilterUpdate('roomTypes', val)}
              multiple
              searchable
              placeholder="Выберите типы"
            />

            <Select
              label="Лечащий врач"
              options={physicianOptions}
              value={activeFilters?.physician}
              onChange={(val) => handleFilterUpdate('physician', val)}
              placeholder="Выберите врача"
            />

            <div>
              <label className="block text-sm font-caption font-medium text-foreground mb-2">
                Дата поступления
              </label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={activeFilters?.admissionDateFrom}
                  onChange={(e) => handleFilterUpdate('admissionDateFrom', e?.target?.value)}
                  className="flex-1"
                />
                <Input
                  type="date"
                  value={activeFilters?.admissionDateTo}
                  onChange={(e) => handleFilterUpdate('admissionDateTo', e?.target?.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <Select
              label="Статус лечения"
              options={treatmentStatusOptions}
              value={activeFilters?.treatmentStatus}
              onChange={(val) => handleFilterUpdate('treatmentStatus', val)}
              multiple
              placeholder="Выберите статусы"
            />
          </div>
        )}

        {savedPresets && savedPresets?.length > 0 && (
          <div className="flex items-center gap-2 mt-3 md:mt-4 flex-wrap">
            <span className="text-xs md:text-sm caption text-muted-foreground">
              Сохраненные фильтры:
            </span>
            {savedPresets?.map((preset) => (
              <button
                key={preset?.id}
                onClick={() => {
                  setActiveFilters(preset?.filters);
                  onFilterChange(preset?.filters);
                }}
                className="px-3 py-1.5 bg-primary/10 text-primary text-xs md:text-sm font-caption rounded-lg hover:bg-primary/20 transition-smooth"
              >
                {preset?.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterToolbar;