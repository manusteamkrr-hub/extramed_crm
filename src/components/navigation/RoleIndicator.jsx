import React, { useState, useEffect, useRef } from 'react';
import Icon from '../AppIcon';

const RoleIndicator = ({ currentRole = 'admin', onRoleChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const roleRef = useRef(null);

  const roles = [
    {
      id: 'admin',
      label: 'Администратор',
      description: 'Полный доступ ко всем функциям',
      icon: 'Shield',
      color: 'var(--color-primary)',
    },
    {
      id: 'doctor',
      label: 'Врач',
      description: 'Доступ к медицинским записям',
      icon: 'Stethoscope',
      color: 'var(--color-success)',
    },
    {
      id: 'accountant',
      label: 'Бухгалтер',
      description: 'Доступ к финансовым данным',
      icon: 'Calculator',
      color: 'var(--color-warning)',
    },
  ];

  const currentRoleData = roles?.find((r) => r?.id === currentRole) || roles?.[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleRef?.current && !roleRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleRoleSelect = (roleId) => {
    setIsOpen(false);
    if (onRoleChange) {
      onRoleChange(roleId);
    }
  };

  return (
    <div ref={roleRef} className="relative">
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-smooth"
        aria-label="Change role"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${currentRoleData?.color}15` }}
        >
          <Icon name={currentRoleData?.icon} size={18} color={currentRoleData?.color} />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-body font-medium text-foreground">
            {currentRoleData?.label}
          </p>
          <p className="text-xs caption text-muted-foreground">
            {currentRoleData?.description}
          </p>
        </div>
        <Icon
          name={isOpen ? 'ChevronUp' : 'ChevronDown'}
          size={16}
          color="var(--color-muted-foreground)"
          className="hidden md:block"
        />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-popover border border-border rounded-lg elevation-lg overflow-hidden z-50">
          <div className="p-3 border-b border-border">
            <h3 className="font-heading font-semibold text-foreground text-sm">
              Выбор роли
            </h3>
            <p className="text-xs caption text-muted-foreground mt-1">
              Переключение между ролями пользователя
            </p>
          </div>
          <ul className="p-2">
            {roles?.map((role) => {
              const isActive = role?.id === currentRole;
              return (
                <li key={role?.id}>
                  <button
                    onClick={() => handleRoleSelect(role?.id)}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-lg
                      transition-smooth text-left
                      ${isActive
                        ? 'bg-primary/10 border border-primary' :'hover:bg-muted border border-transparent'
                      }
                    `}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${role?.color}15` }}
                    >
                      <Icon name={role?.icon} size={20} color={role?.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-medium text-foreground text-sm">
                        {role?.label}
                      </p>
                      <p className="text-xs caption text-muted-foreground mt-0.5">
                        {role?.description}
                      </p>
                    </div>
                    {isActive && (
                      <Icon name="Check" size={20} color="var(--color-primary)" className="flex-shrink-0" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RoleIndicator;