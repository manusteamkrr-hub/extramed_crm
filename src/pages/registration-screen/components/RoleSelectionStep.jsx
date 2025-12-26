import React from 'react';
import Icon from 'components/AppIcon';
import { cn } from 'utils/cn';

const RoleSelectionStep = ({ formData, errors, onInputChange }) => {
  const roles = [
    {
      id: 'admin',
      label: 'Администратор',
      description: 'Полный доступ ко всем функциям системы',
      icon: 'Shield',
      color: 'var(--color-primary)',
      permissions: [
        'Управление пользователями',
        'Настройка системы',
        'Доступ ко всем отчетам',
        'Управление ролями и правами',
        'Аудит безопасности'
      ],
      requirements: 'Требуется дополнительная проверка безопасности'
    },
    {
      id: 'doctor',
      label: 'Врач',
      description: 'Доступ к медицинским записям и лечению пациентов',
      icon: 'Stethoscope',
      color: 'var(--color-success)',
      permissions: [
        'Просмотр и редактирование медицинских карт',
        'Назначение лечения',
        'Доступ к истории болезни',
        'Создание медицинских отчетов',
        'Управление своими пациентами'
      ],
      requirements: 'Требуется подтверждение медицинской лицензии'
    },
    {
      id: 'accountant',
      label: 'Бухгалтер',
      description: 'Доступ к финансовым данным и отчетности',
      icon: 'Calculator',
      color: 'var(--color-warning)',
      permissions: [
        'Управление счетами и оплатами',
        'Создание смет и калькуляций',
        'Финансовые отчеты',
        'Контроль дебиторской задолженности',
        'Экспорт финансовых данных'
      ],
      requirements: 'Требуется подтверждение финансовой квалификации'
    }
  ];

  const handleRoleSelect = (roleId) => {
    onInputChange('role', roleId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
          Выбор роли
        </h3>
        <p className="text-sm text-muted-foreground">
          Выберите роль, которая соответствует вашим обязанностям
        </p>
      </div>

      <div className="space-y-4">
        {roles?.map((role) => {
          const isSelected = formData?.role === role?.id;

          return (
            <button
              key={role?.id}
              type="button"
              onClick={() => handleRoleSelect(role?.id)}
              className={cn(
                'w-full text-left p-5 rounded-xl border-2 transition-all duration-200',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${role?.color}15` }}
                >
                  <Icon name={role?.icon} size={24} color={role?.color} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-heading font-semibold text-foreground">
                      {role?.label}
                    </h4>
                    {isSelected && (
                      <Icon name="CheckCircle" size={20} className="text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {role?.description}
                  </p>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-foreground">
                      Разрешения:
                    </p>
                    <ul className="space-y-1">
                      {role?.permissions?.map((permission, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Icon name="Check" size={14} className="text-success flex-shrink-0 mt-0.5" />
                          <span>{permission}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-start gap-2">
                      <Icon name="AlertCircle" size={14} className="text-warning flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        {role?.requirements}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {errors?.role && (
        <p className="text-sm text-destructive">
          {errors?.role}
        </p>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Icon name="Info" size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900 mb-1">
              Процесс утверждения
            </p>
            <p className="text-xs text-amber-700">
              После отправки заявки администратор проверит ваши данные и назначит соответствующие права доступа. Вы получите уведомление на email после активации учетной записи.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionStep;