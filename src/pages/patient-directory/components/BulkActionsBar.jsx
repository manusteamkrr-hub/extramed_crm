import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkActionsBar = ({ selectedCount, onAction, onClearSelection }) => {
  const [showActions, setShowActions] = useState(false);

  if (selectedCount === 0) return null;

  const bulkActions = [
    {
      id: 'export',
      label: 'Экспорт данных',
      icon: 'Download',
      color: 'var(--color-primary)',
    },
    {
      id: 'send-notification',
      label: 'Отправить уведомление',
      icon: 'Send',
      color: 'var(--color-success)',
    },
    {
      id: 'generate-report',
      label: 'Создать отчет',
      icon: 'FileText',
      color: 'var(--color-warning)',
    },
    {
      id: 'archive',
      label: 'Архивировать',
      icon: 'Archive',
      color: 'var(--color-muted-foreground)',
    },
  ];

  const handleActionClick = (actionId) => {
    if (onAction) {
      onAction(actionId);
    }
    setShowActions(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4">
      <div className="bg-card border border-border rounded-lg elevation-xl px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="CheckSquare" size={18} color="var(--color-primary)" />
          </div>
          <div>
            <p className="font-body font-medium text-foreground text-sm md:text-base">
              Выбрано: {selectedCount}
            </p>
            <p className="text-xs caption text-muted-foreground hidden md:block">
              {selectedCount === 1 ? 'пациент' : selectedCount < 5 ? 'пациента' : 'пациентов'}
            </p>
          </div>
        </div>

        <div className="h-8 w-px bg-border hidden md:block" />

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2">
            {bulkActions?.map((action) => (
              <Button
                key={action?.id}
                variant="outline"
                size="sm"
                iconName={action?.icon}
                iconPosition="left"
                onClick={() => handleActionClick(action?.id)}
              >
                {action?.label}
              </Button>
            ))}
          </div>

          <div className="lg:hidden relative">
            <Button
              variant="outline"
              size="sm"
              iconName="MoreVertical"
              onClick={() => setShowActions(!showActions)}
            >
              Действия
            </Button>
            {showActions && (
              <div className="absolute bottom-full right-0 mb-2 w-56 bg-popover border border-border rounded-lg elevation-lg overflow-hidden">
                {bulkActions?.map((action) => (
                  <button
                    key={action?.id}
                    onClick={() => handleActionClick(action?.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-smooth text-left border-b border-border last:border-b-0"
                  >
                    <Icon name={action?.icon} size={18} color={action?.color} />
                    <span className="font-body text-foreground text-sm">{action?.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={onClearSelection}
            className="ml-2"
          >
            Отменить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;