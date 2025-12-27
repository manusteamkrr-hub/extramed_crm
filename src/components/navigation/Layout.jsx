import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children, userRole = 'admin', onRoleChange }) => {
  const navigate = useNavigate();
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
      
      {/* Main content wrapper with proper left margin for sidebar */}
      <div 
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'
        }`}
      >
        <Header
          userRole={userRole}
          onPatientSelect={handlePatientSelect}
          onRoleChange={onRoleChange}
          onActionClick={handleActionClick}
        />
        
        <main className="flex-1 overflow-y-auto scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;