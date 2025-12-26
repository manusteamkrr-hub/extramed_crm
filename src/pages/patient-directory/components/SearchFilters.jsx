import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const SearchFilters = ({ onFilterChange, onReset, currentFilters }) => {
  const [filters, setFilters] = useState({
    name: '',
    patientId: '',
    phone: '',
    insurance: '',
    admissionDateFrom: '',
    admissionDateTo: '',
    status: '',
    diagnosis: '',
    ageFrom: '',
    ageTo: '',
    gender: '',
    hasActiveEstimate: false,
    hasUnpaidBalance: false,
  });

  // Sync with parent filters when they change
  useEffect(() => {
    if (currentFilters) {
      setFilters(prev => ({
        ...prev,
        ...currentFilters
      }));
    }
  }, [currentFilters]);

  const statusOptions = [
    { value: '', label: 'Все статусы' },
    { value: 'active', label: 'Активный' },
    { value: 'discharged', label: 'Выписан' },
    { value: 'outpatient', label: 'Амбулаторный' },
    { value: 'archived', label: 'Архив' },
  ];

  const genderOptions = [
    { value: '', label: 'Все' },
    { value: 'male', label: 'Мужской' },
    { value: 'female', label: 'Женский' },
  ];

  const insuranceOptions = [
    { value: '', label: 'Все страховые' },
    { value: 'oms', label: 'ОМС' },
    { value: 'dms', label: 'ДМС' },
    { value: 'private', label: 'Частное' },
    { value: 'none', label: 'Без страховки' },
  ];

  const handleInputChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleReset = () => {
    const resetFilters = {
      name: '',
      patientId: '',
      phone: '',
      insurance: '',
      admissionDateFrom: '',
      admissionDateTo: '',
      status: '',
      diagnosis: '',
      ageFrom: '',
      ageTo: '',
      gender: '',
      hasActiveEstimate: false,
      hasUnpaidBalance: false,
    };
    setFilters(resetFilters);
    if (onReset) {
      onReset();
    }
  };

  const activeFilterCount = Object.values(filters)?.filter(
    (value) => value !== '' && value !== false
  )?.length;

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 elevation-sm">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2">
          <Icon name="Filter" size={20} color="var(--color-primary)" />
          <h3 className="font-heading font-semibold text-foreground text-base md:text-lg">
            Фильтры поиска
          </h3>
          {activeFilterCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-caption font-medium px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconName="RotateCcw"
          iconPosition="left"
          onClick={handleReset}
          disabled={activeFilterCount === 0}
        >
          Сбросить
        </Button>
      </div>
      <div className="space-y-4">
        <Input
          label="ФИО пациента"
          type="text"
          placeholder="Иванов Иван Иванович"
          value={filters?.name}
          onChange={(e) => handleInputChange('name', e?.target?.value)}
        />

        <Input
          label="Номер карты"
          type="text"
          placeholder="MRN-2025-001"
          value={filters?.patientId}
          onChange={(e) => handleInputChange('patientId', e?.target?.value)}
        />

        <Input
          label="Телефон"
          type="tel"
          placeholder="+7 (999) 123-45-67"
          value={filters?.phone}
          onChange={(e) => handleInputChange('phone', e?.target?.value)}
        />

        <Select
          label="Страхование"
          options={insuranceOptions}
          value={filters?.insurance}
          onChange={(value) => handleInputChange('insurance', value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Дата поступления от"
            type="date"
            value={filters?.admissionDateFrom}
            onChange={(e) => handleInputChange('admissionDateFrom', e?.target?.value)}
          />
          <Input
            label="Дата поступления до"
            type="date"
            value={filters?.admissionDateTo}
            onChange={(e) => handleInputChange('admissionDateTo', e?.target?.value)}
          />
        </div>

        <Select
          label="Статус пациента"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleInputChange('status', value)}
        />

        <Input
          label="Диагноз (МКБ-10)"
          type="text"
          placeholder="F10.2, J18.9"
          value={filters?.diagnosis}
          onChange={(e) => handleInputChange('diagnosis', e?.target?.value)}
          description="Введите код или название диагноза"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Возраст от"
            type="number"
            placeholder="18"
            min="0"
            max="120"
            value={filters?.ageFrom}
            onChange={(e) => handleInputChange('ageFrom', e?.target?.value)}
          />
          <Input
            label="Возраст до"
            type="number"
            placeholder="65"
            min="0"
            max="120"
            value={filters?.ageTo}
            onChange={(e) => handleInputChange('ageTo', e?.target?.value)}
          />
        </div>

        <Select
          label="Пол"
          options={genderOptions}
          value={filters?.gender}
          onChange={(value) => handleInputChange('gender', value)}
        />

        <div className="pt-4 border-t border-border space-y-3">
          <Checkbox
            label="Есть активная смета"
            checked={filters?.hasActiveEstimate}
            onChange={(e) => handleInputChange('hasActiveEstimate', e?.target?.checked)}
          />
          <Checkbox
            label="Есть неоплаченный баланс"
            checked={filters?.hasUnpaidBalance}
            onChange={(e) => handleInputChange('hasUnpaidBalance', e?.target?.checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;