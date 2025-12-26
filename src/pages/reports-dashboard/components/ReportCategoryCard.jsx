import React from 'react';
import Icon from '../../../components/AppIcon';

const ReportCategoryCard = ({ category, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 rounded-lg transition-smooth
        ${isActive 
          ? 'bg-primary text-primary-foreground elevation-sm' 
          : 'hover:bg-muted text-foreground'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
            ${isActive ? 'bg-primary-foreground/20' : 'bg-primary/10'}
          `}
        >
          <Icon
            name={category?.icon}
            size={20}
            color={isActive ? 'var(--color-primary-foreground)' : 'var(--color-primary)'}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-body font-medium text-sm truncate">
            {category?.name}
          </p>
          <p className={`text-xs caption mt-0.5 ${isActive ? 'opacity-90' : 'text-muted-foreground'}`}>
            {category?.count} отчетов
          </p>
        </div>
      </div>
    </button>
  );
};

export default ReportCategoryCard;