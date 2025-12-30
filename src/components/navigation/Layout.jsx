import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Layout = ({ children, onRoleChange }) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const userRole = userProfile?.role || 'admin';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handlePatientSelect = (patient) => {
    if (patient?.id) {
      navigate(`/patient-profile?id=${patient?.id}`);
    }
  };

  const handleActionClick = (actionId) => {
    switch (actionId) {
      case 'new-admission': navigate('/patient-directory');
        break;
      case 'create-estimate': navigate('/estimate-creation-and-management');
        break;
      case 'process-payment': navigate('/estimate-creation-and-management');
        break;
      case 'view-schedule': navigate('/inpatient-journal');
        break;
      case 'generate-report': navigate('/reports-dashboard');
        break;
      default:
        console.warn('Unknown action:', actionId);
        break;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />
      
      {/* Enhanced main content wrapper with better mobile responsiveness */}
      <div 
        className={`
          flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}
          ml-0
        `}
      >
        <Header
          userRole={userRole}
          onPatientSelect={handlePatientSelect}
          onRoleChange={onRoleChange}
          onActionClick={handleActionClick}
        />
        
        {/* Enhanced main with proper mobile padding */}
        <main className="flex-1 overflow-y-auto scroll-smooth px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;