import React from 'react';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';

const ProfessionalCredentialsStep = ({ formData, errors, onInputChange, verificationStatus, setVerificationStatus }) => {
  const departmentOptions = [
    { value: 'psychiatry', label: 'Психиатрия' },
    { value: 'neurology', label: 'Неврология' },
    { value: 'therapy', label: 'Терапия' },
    { value: 'surgery', label: 'Хирургия' },
    { value: 'cardiology', label: 'Кардиология' },
    { value: 'administration', label: 'Администрация' },
    { value: 'accounting', label: 'Бухгалтерия' }
  ];

  const specializationOptions = [
    { value: 'psychiatrist', label: 'Врач-психиатр' },
    { value: 'psychotherapist', label: 'Психотерапевт' },
    { value: 'neurologist', label: 'Невролог' },
    { value: 'therapist', label: 'Терапевт' },
    { value: 'surgeon', label: 'Хирург' },
    { value: 'cardiologist', label: 'Кардиолог' },
    { value: 'nurse', label: 'Медсестра' },
    { value: 'administrator', label: 'Администратор' },
    { value: 'accountant', label: 'Бухгалтер' }
  ];

  const handleVerifyLicense = () => {
    // Simulate license verification
    setTimeout(() => {
      setVerificationStatus(prev => ({ ...prev, license: true }));
      alert('Лицензия успешно проверена в базе данных');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
          Профессиональные данные
        </h3>
        <p className="text-sm text-muted-foreground">
          Укажите информацию о вашей профессиональной квалификации
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Input
            label="Номер медицинской лицензии"
            type="text"
            placeholder="МЛ-123456789"
            value={formData?.licenseNumber}
            onChange={(e) => onInputChange('licenseNumber', e?.target?.value)}
            error={errors?.licenseNumber}
            description="Для медицинского персонала"
            required
          />
          {formData?.licenseNumber && !verificationStatus?.license && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerifyLicense}
              iconName="FileCheck"
              iconPosition="left"
            >
              Проверить лицензию
            </Button>
          )}
          {verificationStatus?.license && (
            <div className="flex items-center gap-2 text-sm text-success">
              <Icon name="CheckCircle" size={16} />
              <span>Лицензия подтверждена</span>
            </div>
          )}
        </div>

        <Select
          label="Отделение"
          placeholder="Выберите отделение"
          options={departmentOptions}
          value={formData?.department}
          onChange={(value) => onInputChange('department', value)}
          error={errors?.department}
          required
        />

        <Select
          label="Специализация"
          placeholder="Выберите специализацию"
          options={specializationOptions}
          value={formData?.specialization}
          onChange={(value) => onInputChange('specialization', value)}
          error={errors?.specialization}
          searchable
          required
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">
              Проверка квалификации
            </p>
            <p className="text-xs text-blue-700">
              Все профессиональные данные будут проверены администратором перед активацией учетной записи
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalCredentialsStep;