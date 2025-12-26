import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricCard = ({ title, value, subtitle, icon, iconColor, trend, trendValue, loading = false }) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus';
  };

  const getTrendColor = () => {
    if (!trend) return 'var(--color-muted-foreground)';
    return trend === 'up' ? 'var(--color-success)' : trend === 'down' ? 'var(--color-error)' : 'var(--color-muted-foreground)';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 elevation-sm hover:elevation-md transition-smooth">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm caption text-muted-foreground mb-1">{title}</p>
          {loading ? (
            <div className="h-8 md:h-10 bg-muted rounded animate-pulse w-24 md:w-32" />
          ) : (
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground data-text">
              {value}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs md:text-sm caption text-muted-foreground mt-1 md:mt-2">{subtitle}</p>
          )}
        </div>
        <div
          className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon name={icon} size={20} color={iconColor} className="md:w-6 md:h-6" />
        </div>
      </div>
      {trend && trendValue && (
        <div className="flex items-center gap-2 pt-3 md:pt-4 border-t border-border">
          <Icon name={getTrendIcon()} size={16} color={getTrendColor()} className="flex-shrink-0" />
          <span className="text-xs md:text-sm caption font-medium" style={{ color: getTrendColor() }}>
            {trendValue}
          </span>
          <span className="text-xs md:text-sm caption text-muted-foreground">за сегодня</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;