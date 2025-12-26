import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const EstimateToolbar = ({ estimate, onSave, onExport, onApplyTemplate, onBulkDiscount }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [bulkDiscountValue, setBulkDiscountValue] = useState(0);

  const templates = [
    { value: 'detox', label: 'Детоксикация стандарт' },
    { value: 'therapy', label: 'Психотерапия курс' },
    { value: 'inpatient-week', label: 'Стационар 7 дней' },
    { value: 'outpatient', label: 'Амбулаторное лечение' },
  ];

  const discountOptions = [
    { value: 0, label: 'Без скидки' },
    { value: 5, label: '5%' },
    { value: 10, label: '10%' },
    { value: 15, label: '15%' },
    { value: 20, label: '20%' },
  ];

  const handleApplyTemplate = () => {
    if (selectedTemplate && onApplyTemplate) {
      onApplyTemplate(selectedTemplate);
      setSelectedTemplate('');
    }
  };

  const handleApplyBulkDiscount = () => {
    if (onBulkDiscount) {
      onBulkDiscount(bulkDiscountValue);
    }
  };

  const canSave = estimate?.status === 'draft' || estimate?.status === 'active';

  return (
    <div className="bg-card border-b border-border p-3 md:p-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-4">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <Button
            variant="default"
            size="sm"
            iconName="Save"
            iconPosition="left"
            onClick={onSave}
            disabled={!canSave}
          >
            Сохранить
          </Button>

          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
            onClick={onExport}
          >
            Экспорт
          </Button>

          <Button
            variant="outline"
            size="sm"
            iconName="Printer"
            iconPosition="left"
            onClick={() => window.print()}
          >
            Печать
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              placeholder="Шаблон"
              options={templates}
              value={selectedTemplate}
              onChange={setSelectedTemplate}
              className="w-full sm:w-48"
            />
            <Button
              variant="outline"
              size="sm"
              iconName="FileCheck"
              onClick={handleApplyTemplate}
              disabled={!selectedTemplate}
            >
              Применить
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              placeholder="Скидка"
              options={discountOptions}
              value={bulkDiscountValue}
              onChange={setBulkDiscountValue}
              className="w-full sm:w-32"
            />
            <Button
              variant="outline"
              size="sm"
              iconName="Percent"
              onClick={handleApplyBulkDiscount}
            >
              Применить
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateToolbar;