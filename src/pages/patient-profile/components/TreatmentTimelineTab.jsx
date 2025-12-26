import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const TreatmentTimelineTab = ({ timeline }) => {
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const serviceTypeOptions = [
    { value: 'all', label: 'Все типы' },
    { value: 'consultation', label: 'Консультация' },
    { value: 'procedure', label: 'Процедура' },
    { value: 'laboratory', label: 'Лабораторные исследования' },
    { value: 'admission', label: 'Поступление' },
    { value: 'discharge', label: 'Выписка' },
  ];

  const getEventIcon = (type) => {
    switch (type) {
      case 'admission':
        return { name: 'UserPlus', color: 'var(--color-primary)' };
      case 'consultation':
        return { name: 'Stethoscope', color: 'var(--color-success)' };
      case 'procedure':
        return { name: 'Activity', color: 'var(--color-warning)' };
      case 'laboratory':
        return { name: 'FlaskConical', color: 'var(--color-accent)' };
      case 'discharge':
        return { name: 'UserMinus', color: 'var(--color-error)' };
      default:
        return { name: 'Circle', color: 'var(--color-muted-foreground)' };
    }
  };

  const filteredTimeline = timeline?.filter(event => {
    if (filterType !== 'all' && event?.type !== filterType) return false;
    if (dateRange?.start && event?.date < dateRange?.start) return false;
    if (dateRange?.end && event?.date > dateRange?.end) return false;
    return true;
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-4">
          Фильтры
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Тип события"
            options={serviceTypeOptions}
            value={filterType}
            onChange={setFilterType}
          />
          <Input
            label="Дата начала"
            type="date"
            value={dateRange?.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e?.target?.value }))}
          />
          <Input
            label="Дата окончания"
            type="date"
            value={dateRange?.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e?.target?.value }))}
          />
        </div>
      </div>
      <div className="relative">
        <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-4 md:space-y-6">
          {filteredTimeline?.map((event, index) => {
            const icon = getEventIcon(event?.type);
            return (
              <div key={index} className="relative pl-12 md:pl-16">
                <div
                  className="absolute left-0 w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${icon?.color}15` }}
                >
                  <Icon name={icon?.name} size={16} color={icon?.color} className="md:w-5 md:h-5" />
                </div>
                <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <h3 className="text-base md:text-lg font-heading font-semibold text-foreground">
                      {event?.title}
                    </h3>
                    <span className="text-xs md:text-sm caption text-muted-foreground whitespace-nowrap">
                      {event?.date} {event?.time}
                    </span>
                  </div>

                  <p className="text-sm md:text-base caption text-muted-foreground mb-3">
                    {event?.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm caption text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="User" size={14} />
                      {event?.provider}
                    </span>
                    {event?.location && (
                      <span className="flex items-center gap-1">
                        <Icon name="MapPin" size={14} />
                        {event?.location}
                      </span>
                    )}
                    {event?.cost && (
                      <span className="flex items-center gap-1 data-text">
                        <Icon name="Ruble" size={14} />
                        {event?.cost}
                      </span>
                    )}
                  </div>

                  {event?.notes && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-xs md:text-sm caption text-foreground">{event?.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {filteredTimeline?.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <Icon name="Calendar" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
          <p className="text-sm md:text-base caption text-muted-foreground">
            Нет событий, соответствующих выбранным фильтрам
          </p>
        </div>
      )}
    </div>
  );
};

export default TreatmentTimelineTab;