import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isCollapsed = false, onToggleCollapse }) => {
  const location = useLocation();
  const { userProfile } = useAuth();
  const userRole = userProfile?.role || 'admin';
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    {
      section: 'Панель управления',
      items: [
        { label: 'Главная панель', path: '/main-dashboard', icon: 'LayoutDashboard' },
        { label: 'Справочник персонала', path: '/staff-directory', icon: 'UserCog', roles: ['admin'] }
      ]
    },
    {
      section: 'Пациенты',
      items: [
        { label: 'Справочник пациентов', path: '/patient-directory', icon: 'Users', roles: ['admin', 'doctor'] }
      ]
    },
    {
      section: 'Стационар',
      items: [
        { label: 'Журнал стационара', path: '/inpatient-journal', icon: 'Bed', roles: ['admin', 'doctor'] }
      ]
    },
    {
      section: 'Финансы',
      items: [
        { label: 'Создание сметы', path: '/estimate-creation-and-management', icon: 'FileText', roles: ['admin', 'accountant'] },
        { label: 'Отчеты', path: '/reports-dashboard', icon: 'BarChart3', roles: ['admin', 'accountant'] }
      ]
    }
  ];

  const isActiveRoute = (path) => location?.pathname === path;
  const handleMobileToggle = () => setIsMobileOpen(!isMobileOpen);
  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <>
      <button
        onClick={handleMobileToggle}
        className="fixed top-4 left-4 z-[60] lg:hidden bg-card p-3 rounded-lg elevation-md"
      >
        <Icon name={isMobileOpen ? 'X' : 'Menu'} size={24} color="var(--color-foreground)" />
      </button>

      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[45] lg:hidden" onClick={closeMobileMenu} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-card border-r border-border z-[50] transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-60'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          <div className="sidebar-header py-6 px-4">
            <div className="sidebar-logo flex items-center justify-center">
              <Icon name="Activity" size={isCollapsed ? 20 : 24} color="var(--color-primary)" />
            </div>
          </div>

          {!isCollapsed && (
            <div className="px-4 mb-6">
              <h2 className="text-lg font-heading font-semibold text-foreground">Extramed CRM</h2>
              <p className="text-sm text-muted-foreground mt-1">Система управления клиникой</p>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto px-3 pb-4">
            {navigationItems.map((section, sectionIndex) => {
              const visibleItems = section.items.filter(item => !item.roles || item.roles.includes(userRole));
              if (visibleItems.length === 0) return null;

              return (
                <div key={sectionIndex} className="mb-6">
                  {!isCollapsed && (
                    <h3 className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {section.section}
                    </h3>
                  )}
                  <ul className="space-y-1">
                    {visibleItems.map((item, itemIndex) => {
                      const isActive = isActiveRoute(item.path);
                      return (
                        <li key={itemIndex}>
                          <Link
                            to={item.path}
                            onClick={closeMobileMenu}
                            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'} ${isCollapsed ? 'justify-center' : ''}`}
                            title={isCollapsed ? item.label : ''}
                          >
                            <Icon name={item.icon} size={20} color={isActive ? 'white' : 'currentColor'} />
                            {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
