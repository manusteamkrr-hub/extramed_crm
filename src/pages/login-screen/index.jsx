import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import { Checkbox } from 'components/ui/Checkbox';
import Icon from 'components/AppIcon';
import { pageVariants, pageTransition } from '../../config/animations';
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    setAuthError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }
    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setAuthError('');

    const { error } = await signIn(formData.email, formData.password);

    if (error) {
      setAuthError(error.message || 'Ошибка при входе. Проверьте данные.');
      setLoading(false);
    } else {
      navigate('/main-dashboard');
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
      <div className="w-full max-w-md">
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

        <div className="bg-card border border-border rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-heading font-semibold text-foreground mb-2">
              Вход в систему
            </h2>
            <p className="text-sm text-muted-foreground">
              Введите учетные данные для доступа
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-center gap-2">
              <Icon name="AlertCircle" size={16} />
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="doctor@extramed.ru"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              required
            />

            <div className="relative">
              <Input
                label="Пароль"
                type={showPassword ? 'text' : 'password'}
                placeholder="Введите пароль"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={errors.password}
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

            <Checkbox
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              label="Запомнить это устройство"
            />

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
      </div>
    </motion.div>
  );
};

export default LoginScreen;
