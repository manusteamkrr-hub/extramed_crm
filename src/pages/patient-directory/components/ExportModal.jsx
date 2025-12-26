import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox, CheckboxGroup } from '../../../components/ui/Checkbox';

const ExportModal = ({ isOpen, onClose, selectedCount }) => {
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [selectedFields, setSelectedFields] = useState([
    'name',
    'medicalRecordNumber',
    'dateOfBirth',
    'phone',
  ]);

  if (!isOpen) return null;

  const formatOptions = [
    { value: 'xlsx', label: 'Excel (.xlsx)' },
    { value: 'csv', label: 'CSV (.csv)' },
    { value: 'pdf', label: 'PDF (.pdf)' },
  ];

  const fieldOptions = [
    { id: 'name', label: 'ФИО пациента' },
    { id: 'medicalRecordNumber', label: 'Номер карты' },
    { id: 'dateOfBirth', label: 'Дата рождения' },
    { id: 'phone', label: 'Телефон' },
    { id: 'email', label: 'Email' },
    { id: 'address', label: 'Адрес' },
    { id: 'insurance', label: 'Страхование' },
    { id: 'diagnosis', label: 'Диагноз' },
    { id: 'lastVisit', label: 'Последний визит' },
    { id: 'status', label: 'Статус' },
  ];

  const handleFieldToggle = (fieldId) => {
    if (selectedFields?.includes(fieldId)) {
      setSelectedFields(selectedFields?.filter((id) => id !== fieldId));
    } else {
      setSelectedFields([...selectedFields, fieldId]);
    }
  };

  const handleExport = () => {
    console.log('Exporting:', { format: exportFormat, fields: selectedFields });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg elevation-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Download" size={20} color="var(--color-primary)" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-foreground text-lg md:text-xl">
                Экспорт данных пациентов
              </h2>
              <p className="text-sm caption text-muted-foreground mt-1">
                Выбрано записей: {selectedCount}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-smooth"
            aria-label="Close"
          >
            <Icon name="X" size={20} color="var(--color-foreground)" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <Select
            label="Формат экспорта"
            options={formatOptions}
            value={exportFormat}
            onChange={setExportFormat}
          />

          <div>
            <h3 className="font-heading font-semibold text-foreground text-sm mb-3">
              Выберите поля для экспорта
            </h3>
            <CheckboxGroup>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fieldOptions?.map((field) => (
                  <Checkbox
                    key={field?.id}
                    label={field?.label}
                    checked={selectedFields?.includes(field?.id)}
                    onChange={() => handleFieldToggle(field?.id)}
                  />
                ))}
              </div>
            </CheckboxGroup>
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-body font-medium text-foreground mb-1">
                  Информация о конфиденциальности
                </p>
                <p className="text-sm caption text-muted-foreground">
                  Экспортируемые данные содержат конфиденциальную медицинскую информацию. Убедитесь, что файл будет храниться в безопасном месте и доступ к нему имеют только авторизованные лица.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 md:p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            variant="default"
            iconName="Download"
            iconPosition="left"
            onClick={handleExport}
            disabled={selectedFields?.length === 0}
          >
            Экспортировать
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;