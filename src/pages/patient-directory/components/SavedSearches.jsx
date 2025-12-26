import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SavedSearches = ({ onSearchSelect }) => {
  const [savedSearches] = useState([
    {
      id: 'SS001',
      name: 'Активные пациенты',
      description: 'Все пациенты со статусом "Активный"',
      icon: 'Users',
      color: 'var(--color-success)',
      filterCount: 1,
    },
    {
      id: 'SS002',
      name: 'Неоплаченные счета',
      description: 'Пациенты с задолженностью',
      icon: 'AlertCircle',
      color: 'var(--color-warning)',
      filterCount: 2,
    },
    {
      id: 'SS003',
      name: 'Выписанные за месяц',
      description: 'Выписки за последние 30 дней',
      icon: 'Calendar',
      color: 'var(--color-primary)',
      filterCount: 3,
    },
    {
      id: 'SS004',
      name: 'ДМС пациенты',
      description: 'Пациенты с ДМС страхованием',
      icon: 'Shield',
      color: 'var(--color-accent)',
      filterCount: 1,
    },
  ]);

  const handleSearchClick = (search) => {
    if (onSearchSelect) {
      onSearchSelect(search);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 elevation-sm">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2">
          <Icon name="Bookmark" size={20} color="var(--color-primary)" />
          <h3 className="font-heading font-semibold text-foreground text-base md:text-lg">
            Сохраненные поиски
          </h3>
        </div>
        <Button variant="ghost" size="sm" iconName="Plus">
          Новый
        </Button>
      </div>
      <div className="space-y-2">
        {savedSearches?.map((search) => (
          <button
            key={search?.id}
            onClick={() => handleSearchClick(search)}
            className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-smooth text-left group"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${search?.color}15` }}
            >
              <Icon name={search?.icon} size={20} color={search?.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="font-body font-medium text-foreground text-sm truncate">
                  {search?.name}
                </p>
                <span className="text-xs caption text-muted-foreground flex-shrink-0">
                  {search?.filterCount} {search?.filterCount === 1 ? 'фильтр' : 'фильтра'}
                </span>
              </div>
              <p className="text-xs caption text-muted-foreground line-clamp-2">
                {search?.description}
              </p>
            </div>
            <Icon
              name="ChevronRight"
              size={16}
              color="var(--color-muted-foreground)"
              className="flex-shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition-smooth"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SavedSearches;