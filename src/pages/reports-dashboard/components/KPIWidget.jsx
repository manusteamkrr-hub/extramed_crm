import React from 'react';
import Icon from '../../../components/AppIcon';

const KPIWidget = ({ title, value, change, icon, trend }) => {
  const isPositive = trend === 'up';
  const trendColor = isPositive ? 'text-success' : 'text-error';
  const bgColor = isPositive ? 'bg-success/5' : 'bg-error/5';
  const borderColor = isPositive ? 'border-success/20' : 'border-error/20';

  return (
    <div className={`p-4 md:p-6 ${bgColor} border ${borderColor} rounded-lg transition-smooth hover:elevation-md`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${bgColor} flex items-center justify-center`}>
            <Icon
              name={icon}
              size={20}
              color={isPositive ? 'var(--color-success)' : 'var(--color-error)'}
            />
          </div>
          <p className="text-xs md:text-sm caption text-muted-foreground">{title}</p>
        </div>
        <Icon
          name={isPositive ? 'TrendingUp' : 'TrendingDown'}
          size={20}
          color={isPositive ? 'var(--color-success)' : 'var(--color-error)'}
        />
      </div>
      <p className="text-2xl md:text-3xl font-heading font-semibold text-foreground data-text mb-2">
        {value}
      </p>
      <p className={`text-xs md:text-sm caption ${trendColor}`}>
        {change} к прошлому периоду
      </p>
    </div>
  );
};

export default KPIWidget;