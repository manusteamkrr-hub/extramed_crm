import React from 'react';
import PatientSearchBar from './PatientSearchBar';
import NotificationCenter from './NotificationCenter';
import RoleIndicator from './RoleIndicator';
import QuickActionToolbar from './QuickActionToolbar';
import Icon from '../AppIcon';

const Header = ({ userRole = 'admin', onPatientSelect, onRoleChange, onActionClick }) => {
  const handleThemeToggle = () => {
    const isDark = document.documentElement?.classList?.contains('dark');
    if (isDark) {
      document.documentElement?.classList?.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement?.classList?.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border elevation-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 sm:px-6 md:gap-4">
        <div className="flex-1 w-full sm:max-w-md lg:max-w-2xl">
          <PatientSearchBar onPatientSelect={onPatientSelect} />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-wrap">
          <QuickActionToolbar userRole={userRole} onActionClick={onActionClick} />

          <div className="h-8 w-px bg-border hidden sm:block" />

          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-lg hover:bg-muted transition-smooth hidden sm:flex active:scale-95"
            aria-label="Toggle theme"
          >
            <Icon name="Moon" size={20} color="var(--color-foreground)" />
          </button>

          <NotificationCenter userRole={userRole} />

          <RoleIndicator currentRole={userRole} onRoleChange={onRoleChange} />
        </div>
      </div>
    </header>
  );
};

export default Header;