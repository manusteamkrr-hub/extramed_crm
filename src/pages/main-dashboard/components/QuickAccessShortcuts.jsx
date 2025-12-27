import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { Activity } from 'lucide-react';

const QuickAccessShortcuts = () => {
  const navigate = useNavigate();

  const shortcuts = [
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Аналитика в реальном времени',
      icon: Activity,
      color: 'var(--color-teal)',
      path: '/analytics-dashboard',
      shortcut: 'Alt+A',
    },
    {
      id: 'new-admission',
      title: 'Новое поступление',
      description: 'Зарегистрировать пациента',
      icon: 'UserPlus',
      color: 'var(--color-primary)',
      path: '/inpatient-journal',
      shortcut: 'Alt+N',
    },
    {
      id: 'create-estimate',
      title: 'Создать смету',
      description: 'Новая финансовая смета',
      icon: 'FileText',
      color: 'var(--color-success)',
      path: '/estimate-creation-and-management',
      shortcut: 'Alt+E',
    },
    {
      id: 'patient-search',
      title: 'Поиск пациента',
      description: 'Найти в справочнике',
      icon: 'Search',
      color: 'var(--color-warning)',
      path: '/patient-directory',
      shortcut: 'Alt+S',
    },
    {
      id: 'reports',
      title: 'Отчеты',
      description: 'Финансовая аналитика',
      icon: 'BarChart3',
      color: 'var(--color-accent)',
      path: '/reports-dashboard',
      shortcut: 'Alt+R',
    },
    {
      id: 'inpatient-journal',
      title: 'Журнал стационара',
      description: 'Текущие пациенты',
      icon: 'Bed',
      color: 'var(--color-secondary)',
      path: '/inpatient-journal',
      shortcut: 'Alt+J',
    },
    {
      id: 'patient-profile',
      title: 'Профиль пациента',
      description: 'Медицинская карта',
      icon: 'UserCircle',
      color: 'var(--color-primary)',
      path: '/patient-profile',
      shortcut: 'Alt+P',
    },
  ];

  const roleShortcuts = shortcuts;

  const handleShortcutClick = (path) => {
    navigate(path);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 elevation-sm h-full">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-heading font-semibold text-foreground">
          Быстрый доступ
        </h3>
        <Icon name="Zap" size={20} color="var(--color-primary)" className="md:w-6 md:h-6" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {roleShortcuts?.map((shortcut) => (
          <button
            key={shortcut?.id}
            onClick={() => handleShortcutClick(shortcut?.path)}
            className="flex items-start gap-3 p-3 md:p-4 border border-border rounded-lg hover:bg-muted hover:border-primary transition-smooth text-left group"
            title={`${shortcut?.title} (${shortcut?.shortcut})`}
          >
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-smooth"
              style={{ backgroundColor: `${shortcut?.color}15` }}
            >
              <Icon name={shortcut?.icon} size={20} color={shortcut?.color} className="md:w-6 md:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-base font-body font-medium text-foreground mb-1 truncate">
                {shortcut?.title}
              </p>
              <p className="text-xs md:text-sm caption text-muted-foreground line-clamp-2">
                {shortcut?.description}
              </p>
              <p className="text-xs caption text-muted-foreground mt-1 md:mt-2">
                {shortcut?.shortcut}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickAccessShortcuts;