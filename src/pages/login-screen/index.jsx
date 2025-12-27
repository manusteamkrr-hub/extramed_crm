import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import { Checkbox } from 'components/ui/Checkbox';
import Icon from 'components/AppIcon';
import { pageVariants, pageTransition } from '../../config/animations';


const LoginScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [enable2FA, setEnable2FA] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: ''
  });
  const [errors, setErrors] = useState({});
  const [lastLogin, setLastLogin] = useState('2025-12-25 14:30:00');

  const roleOptions = [
    {
      value: 'admin',
      label: 'Администратор',
      description: 'Полный доступ ко всем функциям',
      icon: 'Shield'
    },
    {
      value: 'doctor',
      label: 'Врач',
      description: 'Доступ к медицинским записям',
      icon: 'Stethoscope'
    },
    {
      value: 'accountant',
      label: 'Бухгалтер',
      description: 'Доступ к финансовым данным',
      icon: 'Calculator'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.username?.trim()) {
      newErrors.username = 'Введите имя пользователя или email';
    }

    if (!formData?.password) {
      newErrors.password = 'Введите пароль';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }

    if (!formData?.role) {
      newErrors.role = 'Выберите роль';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleLogin = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Navigate to dashboard based on role
      navigate('/main-dashboard');
    }, 1500);
  };

  const handleForgotPassword = () => {
    // Navigate to password reset flow
    alert('Функция восстановления пароля будет реализована');
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
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Icon name="Activity" size={32} color="white" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Extramed CRM
          </h1>
          <p className="text-muted-foreground font-body">
            Система управления медицинским учреждением
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-heading font-semibold text-foreground mb-2">
              Вход в систему
            </h2>
            <p className="text-sm text-muted-foreground">
              Введите учетные данные для доступа
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username/Email */}
            <Input
              label="Имя пользователя или Email"
              type="text"
              placeholder="username@extramed.ru"
              value={formData?.username}
              onChange={(e) => handleInputChange('username', e?.target?.value)}
              error={errors?.username}
              required
            />

            {/* Password */}
            <div className="relative">
              <Input
                label="Пароль"
                type={showPassword ? 'text' : 'password'}
                placeholder="Введите пароль"
                value={formData?.password}
                onChange={(e) => handleInputChange('password', e?.target?.value)}
                error={errors?.password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
              </button>
            </div>

            {/* Role Selection */}
            <Select
              label="Роль"
              placeholder="Выберите роль"
              options={roleOptions}
              value={formData?.role}
              onChange={(value) => handleInputChange('role', value)}
              error={errors?.role}
              required
            />

            {/* Two-Factor Authentication */}
            <Checkbox
              checked={enable2FA}
              onChange={(e) => setEnable2FA(e?.target?.checked)}
              label="Включить двухфакторную аутентификацию"
              description="Дополнительная защита вашей учетной записи"
            />

            {/* Remember Device */}
            <Checkbox
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e?.target?.checked)}
              label="Запомнить это устройство"
              description="Не запрашивать пароль на этом устройстве 30 дней"
            />

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Забыли пароль?
              </button>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              loading={loading}
              iconName="LogIn"
              iconPosition="right"
              size="lg"
            >
              Войти в систему
            </Button>

            {/* Registration Link */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Нет учетной записи?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/registration-screen')}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Зарегистрироваться
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Security Indicators */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Icon name="Lock" size={14} />
            <span>SSL шифрование активно</span>
          </div>
          {lastLogin && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Icon name="Clock" size={14} />
              <span>Последний вход: {lastLogin}</span>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Icon name="Shield" size={14} />
            <span>HIPAA-совместимая система</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginScreen;