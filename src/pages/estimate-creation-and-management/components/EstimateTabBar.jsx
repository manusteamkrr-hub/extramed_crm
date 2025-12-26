import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EstimateTabBar = ({ estimates, activeEstimateId, onTabChange, onNewEstimate }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-muted text-muted-foreground';
      case 'active':
        return 'bg-primary/10 text-primary';
      case 'partially_paid':
        return 'bg-warning/10 text-warning';
      case 'paid':
        return 'bg-success/10 text-success';
      case 'closed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft':
        return 'Черновик';
      case 'active':
        return 'Активная';
      case 'partially_paid':
        return 'Частично оплачена';
      case 'paid':
        return 'Оплачена';
      case 'closed':
        return 'Закрыта';
      default:
        return status;
    }
  };

  return (
    <div className="bg-card border-b border-border">
      <div className="flex items-center gap-2 p-3 md:p-4 overflow-x-auto">
        {estimates?.map((estimate) => {
          const isActive = estimate?.id === activeEstimateId;
          return (
            <button
              key={estimate?.id}
              onClick={() => onTabChange(estimate?.id)}
              className={`
                flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg
                transition-smooth flex-shrink-0 border
                ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary elevation-sm'
                    : 'bg-muted/50 text-foreground border-transparent hover:bg-muted'
                }
              `}
            >
              <Icon
                name="FileText"
                size={16}
                color={isActive ? 'var(--color-primary-foreground)' : 'var(--color-foreground)'}
              />
              <div className="text-left">
                <p className="text-sm font-body font-medium whitespace-nowrap">
                  Смета #{estimate?.number}
                </p>
                <p
                  className={`text-xs caption ${
                    isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}
                >
                  {getStatusLabel(estimate?.status)}
                </p>
              </div>
            </button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          iconName="Plus"
          iconPosition="left"
          onClick={onNewEstimate}
          className="flex-shrink-0"
        >
          Новая смета
        </Button>
      </div>
    </div>
  );
};

export default EstimateTabBar;