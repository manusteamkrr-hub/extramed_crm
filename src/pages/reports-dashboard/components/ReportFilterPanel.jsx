import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const ReportFilterPanel = ({ filters, onFilterChange, onApply, onReset }) => {
  const departmentOptions = [
    { value: 'all', label: 'Все отделения' },
    { value: 'cardiology', label: 'Кардиология' },
    { value: 'neurology', label: 'Неврология' },
    { value: 'psychiatry', label: 'Психиатрия' },
    { value: 'therapy', label: 'Терапия' },
  ];

  const physicianOptions = [
    { value: 'all', label: 'Все врачи' },
    { value: 'ivanov', label: 'Иванов И.И.' },
    { value: 'petrova', label: 'Петрова М.С.' },
    { value: 'sidorov', label: 'Сидоров П.А.' },
  ];

  const periodOptions = [
    { value: 'today', label: 'Сегодня' },
    { value: 'week', label: 'Эта неделя' },
    { value: 'month', label: 'Этот месяц' },
    { value: 'quarter', label: 'Этот квартал' },
    { value: 'year', label: 'Этот год' },
    { value: 'custom', label: 'Произвольный период' },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 elevation-sm">
      <h3 className="font-heading font-semibold text-foreground mb-4 text-base md:text-lg">
        Параметры отчета
      </h3>
      <div className="space-y-4">
        <Select
          label="Период"
          options={periodOptions}
          value={filters?.period}
          onChange={(value) => onFilterChange('period', value)}
        />

        {filters?.period === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Дата начала"
              type="date"
              value={filters?.startDate}
              onChange={(e) => onFilterChange('startDate', e?.target?.value)}
            />
            <Input
              label="Дата окончания"
              type="date"
              value={filters?.endDate}
              onChange={(e) => onFilterChange('endDate', e?.target?.value)}
            />
          </div>
        )}

        <Select
          label="Отделение"
          options={departmentOptions}
          value={filters?.department}
          onChange={(value) => onFilterChange('department', value)}
        />

        <Select
          label="Врач"
          options={physicianOptions}
          value={filters?.physician}
          onChange={(value) => onFilterChange('physician', value)}
          searchable
        />

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            variant="default"
            fullWidth
            iconName="Filter"
            iconPosition="left"
            onClick={onApply}
          >
            Применить фильтры
          </Button>
          <Button
            variant="outline"
            fullWidth
            iconName="RotateCcw"
            iconPosition="left"
            onClick={onReset}
          >
            Сбросить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportFilterPanel;