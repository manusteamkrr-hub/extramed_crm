import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

import { icd10Codes } from '../../../data/icd10Codes';

const MedicalHistoryTab = ({ medicalHistory, onAddDiagnosis, onAddMedication, onAddAllergy }) => {
  const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleDiagnosisSearch = (query) => {
    setSearchQuery(query);
    if (query?.length >= 2) {
      const filtered = icd10Codes?.filter(
        item => 
          item?.code?.toLowerCase()?.includes(query?.toLowerCase()) ||
          item?.description?.toLowerCase()?.includes(query?.toLowerCase())
      );
      setSearchResults(filtered?.slice(0, 20)); // Limit to 20 results
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectDiagnosis = (diagnosis) => {
    onAddDiagnosis({
      code: diagnosis?.code,
      description: diagnosis?.description,
      diagnosedDate: new Date()?.toISOString()?.split('T')?.[0],
      physician: 'Текущий врач',
    });
    setShowDiagnosisForm(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground">
            Диагнозы
          </h2>
          <Button
            variant="outline"
            size="sm"
            iconName="Plus"
            iconPosition="left"
            onClick={() => setShowDiagnosisForm(!showDiagnosisForm)}
          >
            Добавить диагноз
          </Button>
        </div>

        {showDiagnosisForm && (
          <div className="bg-card border border-border rounded-lg p-4 mb-4">
            <div className="relative">
              <Input
                label="Поиск по МКБ-10"
                placeholder="Введите код или описание диагноза..."
                value={searchQuery}
                onChange={(e) => handleDiagnosisSearch(e?.target?.value)}
              />
              {searchResults?.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg elevation-lg overflow-hidden z-10">
                  <ul className="max-h-64 overflow-y-auto">
                    {searchResults?.map((result, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleSelectDiagnosis(result)}
                          className="w-full text-left px-4 py-3 hover:bg-muted transition-smooth border-b border-border last:border-b-0"
                        >
                          <p className="font-body font-medium text-foreground data-text">{result?.code}</p>
                          <p className="text-sm caption text-muted-foreground mt-1">{result?.description}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {medicalHistory?.diagnoses?.map((diagnosis, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-primary/10 text-primary text-xs md:text-sm font-caption data-text">
                      {diagnosis?.code}
                    </span>
                    {diagnosis?.isPrimary && (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-success/10 text-success text-xs font-caption">
                        Основной
                      </span>
                    )}
                  </div>
                  <p className="text-sm md:text-base font-body text-foreground mb-2">{diagnosis?.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm caption text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="Calendar" size={14} />
                      {diagnosis?.diagnosedDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="User" size={14} />
                      {diagnosis?.physician}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border pt-4 md:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground">
            Медикаменты
          </h2>
          <Button
            variant="outline"
            size="sm"
            iconName="Plus"
            iconPosition="left"
            onClick={() => setShowMedicationForm(!showMedicationForm)}
          >
            Добавить медикамент
          </Button>
        </div>

        <div className="space-y-3">
          {medicalHistory?.medications?.map((medication, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-body font-medium text-foreground mb-1">{medication?.name}</p>
                  <p className="text-sm caption text-muted-foreground mb-2">{medication?.dosage}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm caption text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="Calendar" size={14} />
                      {medication?.startDate} - {medication?.endDate || 'Продолжается'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="User" size={14} />
                      {medication?.prescribedBy}
                    </span>
                  </div>
                </div>
                {medication?.isActive && (
                  <span className="inline-flex items-center px-2 py-1 rounded bg-success/10 text-success text-xs font-caption flex-shrink-0">
                    Активен
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border pt-4 md:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground">
            Аллергии
          </h2>
          <Button
            variant="outline"
            size="sm"
            iconName="Plus"
            iconPosition="left"
            onClick={() => setShowAllergyForm(!showAllergyForm)}
          >
            Добавить аллергию
          </Button>
        </div>

        <div className="space-y-3">
          {medicalHistory?.allergies?.map((allergy, index) => (
            <div key={index} className="bg-error/10 border border-error/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="AlertTriangle" size={20} color="var(--color-error)" className="flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-body font-medium text-error mb-1">{allergy?.allergen}</p>
                  <p className="text-sm caption text-error/90 mb-2">{allergy?.reaction}</p>
                  <p className="text-xs caption text-error/80">Степень: {allergy?.severity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicalHistoryTab;