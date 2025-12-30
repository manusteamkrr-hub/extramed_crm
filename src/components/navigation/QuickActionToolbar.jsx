import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import Button from '../ui/Button';

const QuickActionToolbar = ({ onActionClick }) => {
  const { userProfile } = useAuth();
  const userRole = userProfile?.role || 'admin';
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions = {
    admin: [
      {
        id: 'new-admission',
        label: 'Новое поступление',
        icon: 'UserPlus',
        color: 'var(--color-primary)',
        shortcut: 'Ctrl+N',
      },
      {
        id: 'create-estimate',
        label: 'Создать смету',
        icon: 'FileText',
        color: 'var(--color-success)',
        shortcut: 'Ctrl+E',
      },
      {
        id: 'process-payment',
        label: 'Обработать оплату',
        icon: 'CreditCard',
        color: 'var(--color-warning)',
        shortcut: 'Ctrl+P',
      },
    ],
    doctor: [
      {
        id: 'new-admission',
        label: 'Новое поступление',
        icon: 'UserPlus',
        color: 'var(--color-primary)',
        shortcut: 'Ctrl+N',
      },
      {
        id: 'view-schedule',
        label: 'Расписание',
        icon: 'Calendar',
        color: 'var(--color-success)',
        shortcut: 'Ctrl+S',
      },
    ],
    accountant: [
      {
        id: 'create-estimate',
        label: 'Создать смету',
        icon: 'FileText',
        color: 'var(--color-success)',
        shortcut: 'Ctrl+E',
      },
      {
        id: 'process-payment',
        label: 'Обработать оплату',
        icon: 'CreditCard',
        color: 'var(--color-warning)',
        shortcut: 'Ctrl+P',
      },
      {
        id: 'generate-report',
        label: 'Создать отчет',
        icon: 'BarChart3',
        color: 'var(--color-primary)',
        shortcut: 'Ctrl+R',
      },
    ],
  };

  const actions = quickActions?.[userRole] || quickActions?.admin;

  const handleActionClick = (actionId) => {
    if (onActionClick) {
      onActionClick(actionId);
    }
    setIsExpanded(false);
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <div className="hidden lg:flex items-center gap-2">
        {actions?.map((action) => (
          <Button
            key={action?.id}
            variant="outline"
            size="sm"
            iconName={action?.icon}
            iconPosition="left"
            onClick={() => handleActionClick(action?.id)}
            className="group"
            title={`${action?.label} (${action?.shortcut})`}
          >
            {action?.label}
          </Button>
        ))}
      </div>
      <div className="fixed bottom-6 right-6 lg:hidden z-50">
        {isExpanded && (
          <div className="mb-4 space-y-2">
            {actions?.map((action) => (
              <button
                key={action?.id}
                onClick={() => handleActionClick(action?.id)}
                className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 elevation-lg hover:elevation-xl transition-smooth w-full"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${action?.color}15` }}
                >
                  <Icon name={action?.icon} size={20} color={action?.color} />
                </div>
                <span className="font-body font-medium text-foreground text-sm">
                  {action?.label}
                </span>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleToggleExpand}
          className="w-14 h-14 bg-primary text-primary-foreground rounded-full elevation-lg hover:elevation-xl transition-smooth flex items-center justify-center"
          aria-label="Quick actions"
        >
          <Icon
            name={isExpanded ? 'X' : 'Plus'}
            size={24}
            color="var(--color-primary-foreground)"
          />
        </button>
      </div>
    </>
  );
};

export default QuickActionToolbar;