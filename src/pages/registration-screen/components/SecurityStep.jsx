import React, { useState } from 'react';
import Input from 'components/ui/Input';
import { Checkbox } from 'components/ui/Checkbox';
import Icon from 'components/AppIcon';
import { cn } from 'utils/cn';

const SecurityStep = ({ formData, errors, onInputChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password?.length >= 8) strength++;
    if (password?.length >= 12) strength++;
    if (/[a-z]/?.test(password) && /[A-Z]/?.test(password)) strength++;
    if (/\d/?.test(password)) strength++;
    if (/[^a-zA-Z0-9]/?.test(password)) strength++;

    if (strength <= 2) return { strength: 33, label: 'Слабый', color: 'bg-red-500' };
    if (strength <= 3) return { strength: 66, label: 'Средний', color: 'bg-amber-500' };
    return { strength: 100, label: 'Сильный', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData?.password);

  const passwordRequirements = [
    { met: formData?.password?.length >= 8, text: 'Минимум 8 символов' },
    { met: /[a-z]/?.test(formData?.password) && /[A-Z]/?.test(formData?.password), text: 'Заглавные и строчные буквы' },
    { met: /\d/?.test(formData?.password), text: 'Минимум одна цифра' },
    { met: /[^a-zA-Z0-9]/?.test(formData?.password), text: 'Специальный символ (!@#$%^&*)' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
          Настройка безопасности
        </h3>
        <p className="text-sm text-muted-foreground">
          Создайте надежный пароль и примите условия использования
        </p>
      </div>

      <div className="space-y-5">
        {/* Password */}
        <div className="space-y-3">
          <div className="relative">
            <Input
              label="Пароль"
              type={showPassword ? 'text' : 'password'}
              placeholder="Введите пароль"
              value={formData?.password}
              onChange={(e) => onInputChange('password', e?.target?.value)}
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

          {/* Password Strength Meter */}
          {formData?.password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Надежность пароля:</span>
                <span className={cn(
                  'font-medium',
                  passwordStrength?.strength === 100 && 'text-green-600',
                  passwordStrength?.strength === 66 && 'text-amber-600',
                  passwordStrength?.strength === 33 && 'text-red-600'
                )}>
                  {passwordStrength?.label}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('h-full transition-all duration-300', passwordStrength?.color)}
                  style={{ width: `${passwordStrength?.strength}%` }}
                />
              </div>
            </div>
          )}

          {/* Password Requirements */}
          <div className="space-y-1">
            {passwordRequirements?.map((req, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <Icon
                  name={req?.met ? 'CheckCircle' : 'Circle'}
                  size={14}
                  className={req?.met ? 'text-success' : 'text-muted-foreground'}
                />
                <span className={req?.met ? 'text-success' : 'text-muted-foreground'}>
                  {req?.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <Input
            label="Подтверждение пароля"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Повторите пароль"
            value={formData?.confirmPassword}
            onChange={(e) => onInputChange('confirmPassword', e?.target?.value)}
            error={errors?.confirmPassword}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={18} />
          </button>
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-4 pt-4 border-t border-border">
          <Checkbox
            checked={formData?.acceptTerms}
            onChange={(e) => onInputChange('acceptTerms', e?.target?.checked)}
            label="Я принимаю условия использования"
            description="Прочитайте и примите пользовательское соглашение"
            error={errors?.acceptTerms}
            required
          />

          <Checkbox
            checked={formData?.acceptHIPAA}
            onChange={(e) => onInputChange('acceptHIPAA', e?.target?.checked)}
            label="Я прошел обучение по HIPAA"
            description="Подтверждаю знание требований конфиденциальности медицинских данных"
            error={errors?.acceptHIPAA}
            required
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Icon name="Shield" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">
              Защита данных
            </p>
            <p className="text-xs text-blue-700">
              Ваш пароль будет зашифрован с использованием современных алгоритмов. Мы никогда не храним пароли в открытом виде и не передаем их третьим лицам.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityStep;