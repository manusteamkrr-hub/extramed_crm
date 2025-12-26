import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'components/ui/Button';



import Icon from 'components/AppIcon';

import RegistrationProgress from './components/RegistrationProgress';
import PersonalInfoStep from './components/PersonalInfoStep';
import ProfessionalCredentialsStep from './components/ProfessionalCredentialsStep';
import RoleSelectionStep from './components/RoleSelectionStep';
import SecurityStep from './components/SecurityStep';

import patientService from '../../services/patientService';

const RegistrationScreen = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '',
    email: '',
    phone: '',
    // Professional Credentials
    licenseNumber: '',
    department: '',
    specialization: '',
    // Role Selection
    role: '',
    // Security
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptHIPAA: false
  });
  const [errors, setErrors] = useState({});
  const [verificationStatus, setVerificationStatus] = useState({
    email: false,
    phone: false,
    license: false
  });

  const totalSteps = 4;

  const steps = [
    { id: 1, title: 'Личная информация', icon: 'User' },
    { id: 2, title: 'Профессиональные данные', icon: 'Briefcase' },
    { id: 3, title: 'Выбор роли', icon: 'Shield' },
    { id: 4, title: 'Безопасность', icon: 'Lock' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData?.fullName?.trim()) {
          newErrors.fullName = 'Введите полное имя';
        }
        if (!formData?.email?.trim()) {
          newErrors.email = 'Введите email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
          newErrors.email = 'Некорректный формат email';
        }
        if (!formData?.phone?.trim()) {
          newErrors.phone = 'Введите номер телефона';
        }
        break;

      case 2:
        if (!formData?.licenseNumber?.trim()) {
          newErrors.licenseNumber = 'Введите номер лицензии';
        }
        if (!formData?.department?.trim()) {
          newErrors.department = 'Выберите отделение';
        }
        if (!formData?.specialization?.trim()) {
          newErrors.specialization = 'Выберите специализацию';
        }
        break;

      case 3:
        if (!formData?.role) {
          newErrors.role = 'Выберите роль';
        }
        break;

      case 4:
        if (!formData?.password) {
          newErrors.password = 'Введите пароль';
        } else if (formData?.password?.length < 8) {
          newErrors.password = 'Пароль должен содержать минимум 8 символов';
        }
        if (formData?.password !== formData?.confirmPassword) {
          newErrors.confirmPassword = 'Пароли не совпадают';
        }
        if (!formData?.acceptTerms) {
          newErrors.acceptTerms = 'Необходимо принять условия использования';
        }
        if (!formData?.acceptHIPAA) {
          newErrors.acceptHIPAA = 'Необходимо подтвердить обучение HIPAA';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);

    try {
      // Parse full name into first and last name
      const nameParts = formData?.fullName?.trim()?.split(' ');
      const firstName = nameParts?.[0] || '';
      const lastName = nameParts?.slice(1)?.join(' ') || '';

      // Prepare patient data for localStorage
      const patientData = {
        // Personal information
        firstName,
        lastName,
        fullName: formData?.fullName?.trim(),
        email: formData?.email?.trim(),
        phone: formData?.phone?.trim(),
        
        // Medical staff credentials
        licenseNumber: formData?.licenseNumber?.trim(),
        department: formData?.department,
        specialization: formData?.specialization,
        role: formData?.role,
        
        // Status and metadata
        status: 'pending_approval', // Waiting for admin approval
        registrationDate: new Date()?.toISOString(),
        lastVisit: new Date()?.toISOString(),
        
        // Security (in real app, password should be hashed and stored separately)
        // For demo purposes, we'll just note that they completed security step
        securityCompleted: true,
        termsAccepted: formData?.acceptTerms,
        hipaaCompleted: formData?.acceptHIPAA,
        
        // Generate a medical record number (MRN)
        mrn: `MRN-${Date.now()}`,
        
        // Additional fields that might be needed
        address: '',dateOfBirth: '',gender: '',emergencyContact: '',insurance: '',
        
        // Verification status
        emailVerified: verificationStatus?.email,
        phoneVerified: verificationStatus?.phone,
        licenseVerified: verificationStatus?.license
      };

      // Save patient to localStorage using patientService
      const createdPatient = await patientService?.createPatient(patientData);
      
      if (createdPatient) {
        setLoading(false);
        // Show success message
        alert('Регистрация успешно завершена! Ваша заявка отправлена на рассмотрение администратору.');
        
        // Navigate to patient directory or login
        navigate('/patient-directory');
      } else {
        throw new Error('Failed to create patient record');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      alert(`Ошибка при регистрации: ${error?.message || 'Неизвестная ошибка'}. Пожалуйста, попробуйте снова.`);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
            verificationStatus={verificationStatus}
            setVerificationStatus={setVerificationStatus}
          />
        );
      case 2:
        return (
          <ProfessionalCredentialsStep
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
            verificationStatus={verificationStatus}
            setVerificationStatus={setVerificationStatus}
          />
        );
      case 3:
        return (
          <RoleSelectionStep
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
          />
        );
      case 4:
        return (
          <SecurityStep
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-3xl">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Icon name="Activity" size={32} color="white" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Регистрация в Extramed CRM
          </h1>
          <p className="text-muted-foreground font-body">
            Создайте учетную запись для доступа к системе
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-card border border-border rounded-xl shadow-lg p-8">
          {/* Progress Indicator */}
          <RegistrationProgress
            steps={steps}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />

          {/* Step Content */}
          <div className="mt-8">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              iconName="ChevronLeft"
              iconPosition="left"
            >
              Назад
            </Button>

            <div className="text-sm text-muted-foreground">
              Шаг {currentStep} из {totalSteps}
            </div>

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                iconName="ChevronRight"
                iconPosition="right"
              >
                Далее
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                loading={loading}
                iconName="Check"
                iconPosition="right"
                variant="success"
              >
                Отправить заявку
              </Button>
            )}
          </div>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Уже есть учетная запись?{' '}
              <button
                type="button"
                onClick={() => navigate('/login-screen')}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Войти
              </button>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Icon name="Shield" size={14} />
            <span>Все данные защищены в соответствии с требованиями HIPAA</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationScreen;