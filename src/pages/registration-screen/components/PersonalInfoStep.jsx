import React from 'react';
import Input from 'components/ui/Input';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';

const PersonalInfoStep = ({ formData, errors, onInputChange, verificationStatus, setVerificationStatus }) => {
  const handleVerifyEmail = () => {
    // Simulate email verification
    setTimeout(() => {
      setVerificationStatus(prev => ({ ...prev, email: true }));
      alert('Код подтверждения отправлен на email');
    }, 500);
  };

  const handleVerifyPhone = () => {
    // Simulate phone verification
    setTimeout(() => {
      setVerificationStatus(prev => ({ ...prev, phone: true }));
      alert('SMS с кодом отправлено на телефон');
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
          Личная информация
        </h3>
        <p className="text-sm text-muted-foreground">
          Введите ваши личные данные для создания учетной записи
        </p>
      </div>

      <div className="space-y-5">
        <Input
          label="Полное имя"
          type="text"
          placeholder="Иванов Иван Иванович"
          value={formData?.fullName}
          onChange={(e) => onInputChange('fullName', e?.target?.value)}
          error={errors?.fullName}
          required
        />

        <div className="space-y-2">
          <Input
            label="Email"
            type="email"
            placeholder="ivanov@extramed.ru"
            value={formData?.email}
            onChange={(e) => onInputChange('email', e?.target?.value)}
            error={errors?.email}
            required
          />
          {formData?.email && !verificationStatus?.email && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerifyEmail}
              iconName="Mail"
              iconPosition="left"
            >
              Подтвердить email
            </Button>
          )}
          {verificationStatus?.email && (
            <div className="flex items-center gap-2 text-sm text-success">
              <Icon name="CheckCircle" size={16} />
              <span>Email подтвержден</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Input
            label="Номер телефона"
            type="tel"
            placeholder="+7 (999) 123-45-67"
            value={formData?.phone}
            onChange={(e) => onInputChange('phone', e?.target?.value)}
            error={errors?.phone}
            required
          />
          {formData?.phone && !verificationStatus?.phone && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerifyPhone}
              iconName="Phone"
              iconPosition="left"
            >
              Подтвердить телефон
            </Button>
          )}
          {verificationStatus?.phone && (
            <div className="flex items-center gap-2 text-sm text-success">
              <Icon name="CheckCircle" size={16} />
              <span>Телефон подтвержден</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;