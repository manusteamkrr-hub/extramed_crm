import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Sidebar = ({ isCollapsed = false, onToggleCollapse }) => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    {
      section: 'Панель управления',
      items: [
        {
          label: 'Главная панель',
          path: '/main-dashboard',
          icon: 'LayoutDashboard'
        },
        {
          label: 'Справочник персонала',
          path: '/staff-directory',
          icon: 'UserCog'
        }
      ]
    },
    {
      section: 'Пациенты',
      items: [
        {
          label: 'Справочник пациентов',
          path: '/patient-directory',
          icon: 'Users'
        }
      ]
    },
    {
      section: 'Стационар',
      items: [
        {
          label: 'Журнал стационара',
          path: '/inpatient-journal',
          icon: 'Bed'
        }
      ]
    },
    {
      section: 'Финансы',
      items: [
        {
          label: 'Создание сметы',
          path: '/estimate-creation-and-management',
          icon: 'FileText'
        },
        {
          label: 'Отчеты',
          path: '/reports-dashboard',
          icon: 'BarChart3'
        }
      ]
    }
  ];

  const isActiveRoute = (path) => {
    return location?.pathname === path;
  };

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      <button
        onClick={handleMobileToggle}
        className="fixed top-4 left-4 z-50 lg:hidden bg-card p-2 rounded-lg elevation-md transition-smooth hover:elevation-lg"
        aria-label="Toggle mobile menu">

        <Icon name={isMobileOpen ? 'X' : 'Menu'} size={24} color="var(--color-foreground)" />
      </button>
      {isMobileOpen &&
      <div
        className="fixed inset-0 bg-background z-40 lg:hidden"
        onClick={closeMobileMenu} />

      }
      <aside
        className={`
          fixed lg:fixed top-0 left-0 h-full bg-card border-r border-border z-40
          transition-smooth elevation-md
          ${isCollapsed ? 'w-20' : 'w-60'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'sidebar-collapsed' : ''}
        `}>

        <div className="flex flex-col h-full">
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <Icon name="Activity" size={isCollapsed ? 20 : 24} color="#FFFFFF" />
            </div>
          </div>

          {!isCollapsed &&
          <div className="px-4 mb-6">
              <h2 className="text-lg font-heading font-semibold text-foreground">Ia9 Studia CRM

            </h2>
              <p className="text-sm caption text-muted-foreground mt-1">
                Система управления клиникой
              </p>
            </div>
          }

          <nav className="flex-1 overflow-y-auto px-3 pb-4">
            {navigationItems?.map((section, sectionIndex) =>
            <div key={sectionIndex} className="mb-6">
                {!isCollapsed &&
              <h3 className="px-3 mb-2 text-xs font-caption font-medium text-muted-foreground uppercase tracking-wider">
                    {section?.section}
                  </h3>
              }
                <ul className="space-y-1">
                  {section?.items?.map((item, itemIndex) => {
                  const isActive = isActiveRoute(item?.path);
                  return (
                    <li key={itemIndex}>
                        <Link
                        to={item?.path}
                        onClick={closeMobileMenu}
                        className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-lg
                            transition-smooth group
                            ${isActive ?
                        'bg-primary text-primary-foreground elevation-sm' :
                        'text-foreground hover:bg-muted hover:translate-y-[-1px]'}
                            ${
                        isCollapsed ? 'justify-center' : ''}
                          `}
                        title={isCollapsed ? item?.label : ''}>

                          <Icon
                          name={item?.icon}
                          size={20}
                          color={isActive ? 'var(--color-primary-foreground)' : 'var(--color-foreground)'}
                          className="flex-shrink-0" />

                          {!isCollapsed &&
                        <span className="font-body font-medium text-sm">
                              {item?.label}
                            </span>
                        }
                        </Link>
                      </li>);

                })}
                </ul>
              </div>
            )}
          </nav>

          {onToggleCollapse &&
          <div className="p-3 border-t border-border hidden lg:block">
              <button
              onClick={onToggleCollapse}
              className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-foreground hover:bg-muted transition-smooth
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              title={isCollapsed ? 'Развернуть' : 'Свернуть'}>

                <Icon
                name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'}
                size={20}
                color="var(--color-foreground)" />

                {!isCollapsed &&
              <span className="font-body font-medium text-sm">
                    Свернуть
                  </span>
              }
              </button>
            </div>
          }
        </div>
      </aside>
    </>);

};

export default Sidebar;