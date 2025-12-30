import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';
import RegistrationProgress from './components/RegistrationProgress';
import PersonalInfoStep from './components/PersonalInfoStep';
import ProfessionalCredentialsStep from './components/ProfessionalCredentialsStep';
import RoleSelectionStep from './components/RoleSelectionStep';
import SecurityStep from './components/SecurityStep';
import { pageVariants, pageTransition } from '../../config/animations';
import { supabase } from '../../lib/supabase';

const RegistrationScreen = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    department: '',
    specialization: '',
    role: '',
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
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Введите полное имя';
      if (!formData.email.trim()) newErrors.email = 'Введите email';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Некорректный формат email';
      if (!formData.phone.trim()) newErrors.phone = 'Введите номер телефона';
    } else if (step === 2) {
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'Введите номер лицензии';
      if (!formData.department.trim()) newErrors.department = 'Выберите отделение';
      if (!formData.specialization.trim()) newErrors.specialization = 'Выберите специализацию';
    } else if (step === 3) {
      if (!formData.role) newErrors.role = 'Выберите роль';
    } else if (step === 4) {
      if (!formData.password) newErrors.password = 'Введите пароль';
      else if (formData.password.length < 8) newErrors.password = 'Пароль должен содержать минимум 8 символов';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Пароли не совпадают';
      if (!formData.acceptTerms) newErrors.acceptTerms = 'Необходимо принять условия';
      if (!formData.acceptHIPAA) newErrors.acceptHIPAA = 'Необходимо подтвердить HIPAA';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setLoading(true);

    try {
      // 1. Sign up user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create user profile in user_profiles table
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            id: authData.user.id,
            full_name: formData.fullName,
            role: formData.role,
            department: formData.department,
            specialization: formData.specialization,
            license_number: formData.licenseNumber,
            phone: formData.phone
          }]);

        if (profileError) throw profileError;

        alert('Регистрация успешна! Пожалуйста, проверьте email для подтверждения.');
        navigate('/login-screen');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(`Ошибка при регистрации: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-background p-4"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="w-full max-w-2xl">
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

        <div className="bg-card border border-border rounded-xl shadow-lg p-8">
          <RegistrationProgress steps={steps} currentStep={currentStep} totalSteps={totalSteps} />
          <div className="mt-8">
            {currentStep === 1 && <PersonalInfoStep formData={formData} errors={errors} onInputChange={handleInputChange} verificationStatus={verificationStatus} setVerificationStatus={setVerificationStatus} />}
            {currentStep === 2 && <ProfessionalCredentialsStep formData={formData} errors={errors} onInputChange={handleInputChange} verificationStatus={verificationStatus} setVerificationStatus={setVerificationStatus} />}
            {currentStep === 3 && <RoleSelectionStep formData={formData} errors={errors} onInputChange={handleInputChange} />}
            {currentStep === 4 && <SecurityStep formData={formData} errors={errors} onInputChange={handleInputChange} />}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1} iconName="ChevronLeft" iconPosition="left">
              Назад
            </Button>
            <div className="text-sm text-muted-foreground">Шаг {currentStep} из {totalSteps}</div>
            {currentStep < totalSteps ? (
              <Button onClick={handleNext} iconName="ChevronRight" iconPosition="right">Далее</Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading} iconName="Check" iconPosition="right" variant="success">
                Зарегистрироваться
              </Button>
            )}
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Уже есть учетная запись?{' '}
              <button type="button" onClick={() => navigate('/login-screen')} className="text-primary hover:text-primary/80 font-medium transition-colors">
                Войти
              </button>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RegistrationScreen;
