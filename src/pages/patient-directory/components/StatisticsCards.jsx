import React from 'react';
import Icon from '../../../components/AppIcon';

const StatisticsCards = ({ stats }) => {
  const cards = [
    {
      id: 'total',
      label: 'Всего пациентов',
      value: stats?.total,
      icon: 'Users',
      color: 'var(--color-primary)',
      trend: '+8%',
      trendUp: true,
    },
    {
      id: 'active',
      label: 'Активные',
      value: stats?.active,
      icon: 'Activity',
      color: 'var(--color-success)',
      trend: '+5%',
      trendUp: true,
    },
    {
      id: 'outpatient',
      label: 'Амбулаторные',
      value: stats?.outpatient,
      icon: 'Calendar',
      color: 'var(--color-warning)',
      trend: '-3%',
      trendUp: false,
    },
    {
      id: 'discharged',
      label: 'Выписано за месяц',
      value: stats?.discharged,
      icon: 'CheckCircle',
      color: 'var(--color-muted-foreground)',
      trend: '-3%',
      trendUp: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards?.map((card) => (
        <div
          key={card?.id}
          className="bg-card border border-border rounded-lg p-4 md:p-6 elevation-sm hover:elevation-md transition-smooth"
        >
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${card?.color}15` }}
            >
              <Icon name={card?.icon} size={20} color={card?.color} />
            </div>
            <div className="flex items-center gap-1">
              <Icon
                name={card?.trendUp ? 'TrendingUp' : 'TrendingDown'}
                size={16}
                color={card?.trendUp ? 'var(--color-success)' : 'var(--color-error)'}
              />
              <span
                className="text-xs font-caption font-medium"
                style={{ color: card?.trendUp ? 'var(--color-success)' : 'var(--color-error)' }}
              >
                {card?.trend}
              </span>
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-heading font-semibold text-foreground mb-1 md:mb-2 data-text">
            {card?.value?.toLocaleString('ru-RU')}
          </h3>
          <p className="text-sm caption text-muted-foreground">{card?.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;