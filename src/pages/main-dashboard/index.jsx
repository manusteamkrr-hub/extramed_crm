import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/navigation/Sidebar';
import Header from '../../components/navigation/Header';
import MetricCard from './components/MetricCard';
import CapacityOverview from './components/CapacityOverview';
import UrgentNotificationsList from './components/UrgentNotificationsList';
import QuickAccessShortcuts from './components/QuickAccessShortcuts';
import SystemHealthIndicator from './components/SystemHealthIndicator';
import { useNavigate } from 'react-router-dom';
import patientServiceInstance from '../../services/patientService';
import inpatientService from '../../services/inpatientService';
import estimateService from '../../services/estimateService';
import notificationService from '../../services/notificationService';
import { RefreshCw } from 'lucide-react';

const MainDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentRole, setCurrentRole] = useState('admin');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metricsData, setMetricsData] = useState({
    occupancy: { value: 0, trend: 'up', trendValue: '+0%' },
    revenue: { value: '0 ₽', trend: 'up', trendValue: '+0%' },
    pendingDischarges: { value: 0, trend: 'down', trendValue: '0' },
    newAdmissions: { value: 0, trend: 'up', trendValue: '+0' },
  });
  const [capacityData, setCapacityData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [systemStatus, setSystemStatus] = useState([]);

  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(() => {
      loadDashboardData();
    }, 10000);

    const handlePatientUpdate = () => {
      loadDashboardData();
    };

    const handleFinancialUpdate = () => {
      loadDashboardData();
    };

    window.addEventListener('patientUpdated', handlePatientUpdate);
    window.addEventListener('financialUpdate', handleFinancialUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('patientUpdated', handlePatientUpdate);
      window.removeEventListener('financialUpdate', handleFinancialUpdate);
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const loadDashboardData = async () => {
    if (!isRefreshing && loading === true) {
      setLoading(true);
    }

    try {
      console.log('📊 Connecting to database...');

      // Fetch all data in parallel
      const [statsResult, revenueResult, roomsResult, notificationsResult, systemResult] = await Promise.all([
        patientServiceInstance?.getDashboardStatistics(),
        estimateService?.getRevenueStatistics(),
        inpatientService?.getRoomCapacity(),
        notificationService?.getUrgentNotifications(),
        notificationService?.getSystemHealth()
      ]);

      // Process metrics based on role
      if (statsResult?.success && revenueResult?.success) {
        const stats = statsResult?.data;
        const revenue = revenueResult?.data;
        
        if (currentRole === 'admin') {
          setMetricsData({
            occupancy: { 
              value: stats?.activePatients || 0, 
              trend: stats?.activePatients > 0 ? 'up' : 'neutral', 
              trendValue: `${stats?.activePatients} активных` 
            },
            revenue: { 
              value: `${new Intl.NumberFormat('ru-RU')?.format(revenue?.todayRevenue || 0)} ₽`, 
              trend: revenue?.todayRevenue > 0 ? 'up' : 'neutral', 
              trendValue: 'За сегодня' 
            },
            pendingDischarges: { 
              value: stats?.pendingDischarges || 0, 
              trend: stats?.pendingDischarges > 0 ? 'up' : 'down', 
              trendValue: `${stats?.pendingDischarges} ожидают` 
            },
            newAdmissions: { 
              value: stats?.newAdmissions || 0, 
              trend: stats?.newAdmissions > 0 ? 'up' : 'neutral', 
              trendValue: 'За сегодня' 
            },
          });
        } else if (currentRole === 'doctor') {
          setMetricsData({
            occupancy: { 
              value: stats?.activePatients || 0, 
              trend: stats?.activePatients > 0 ? 'up' : 'neutral', 
              trendValue: 'В стационаре' 
            },
            myPatients: { 
              value: stats?.activePatients || 0, 
              trend: 'up', 
              trendValue: 'Под наблюдением' 
            },
            pendingDischarges: { 
              value: stats?.pendingDischarges || 0, 
              trend: stats?.pendingDischarges > 0 ? 'up' : 'down', 
              trendValue: 'Готовы к выписке' 
            },
            criticalCases: { 
              value: stats?.alertPatients || 0, 
              trend: stats?.alertPatients > 0 ? 'up' : 'down', 
              trendValue: 'Требуют внимания' 
            },
          });
        } else if (currentRole === 'accountant') {
          setMetricsData({
            revenue: { 
              value: `${new Intl.NumberFormat('ru-RU')?.format(revenue?.todayRevenue || 0)} ₽`, 
              trend: revenue?.todayRevenue > 0 ? 'up' : 'neutral', 
              trendValue: 'За сегодня' 
            },
            pendingPayments: { 
              value: revenue?.pendingPaymentsCount || 0, 
              trend: revenue?.pendingPaymentsCount > 0 ? 'up' : 'down', 
              trendValue: 'Неоплачено' 
            },
            estimates: { 
              value: revenue?.activeEstimatesCount || 0, 
              trend: 'up', 
              trendValue: 'В работе' 
            },
            collections: { 
              value: `${new Intl.NumberFormat('ru-RU')?.format(revenue?.monthCollections || 0)} ₽`, 
              trend: revenue?.monthCollections > 0 ? 'up' : 'neutral', 
              trendValue: 'За месяц' 
            },
          });
        }
      }

      // Process capacity data
      if (roomsResult?.success) {
        const capacityMap = {
          'economy': { type: 'Эконом', icon: 'Home', color: 'var(--color-primary)' },
          'standard': { type: 'Стандарт', icon: 'Building', color: 'var(--color-success)' },
          'comfort': { type: 'Комфорт', icon: 'Star', color: 'var(--color-warning)' },
          'vip': { type: 'VIP', icon: 'Crown', color: 'var(--color-accent)' }
        };

        const formattedCapacity = roomsResult?.data?.map(room => ({
          type: capacityMap?.[room?.type]?.type || room?.type,
          occupied: room?.occupied || 0,
          total: room?.capacity || 0,
          available: (room?.capacity || 0) - (room?.occupied || 0),
          icon: capacityMap?.[room?.type]?.icon || 'Home',
          color: capacityMap?.[room?.type]?.color || 'var(--color-primary)'
        })) || [];

        setCapacityData(formattedCapacity);
      }

      // Set notifications
      if (Array.isArray(notificationsResult)) {
        setNotifications(notificationsResult || []);
      }

      // Set system status
      if (Array.isArray(systemResult)) {
        setSystemStatus(systemResult || []);
      }

      console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
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

  const handleClearNotification = (notificationId) => {
    setNotifications((prevNotifications) =>
      prevNotifications?.filter((notification) => notification?.id !== notificationId)
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleViewAllNotifications = () => {
    navigate('/patient-directory');
  };

  const renderMetricCards = () => {
    const roleMetrics = {
      admin: [
        {
          title: 'Текущая загрузка',
          value: metricsData?.occupancy?.value || 0,
          subtitle: 'пациентов в стационаре',
          icon: 'Users',
          iconColor: 'var(--color-primary)',
          trend: metricsData?.occupancy?.trend,
          trendValue: metricsData?.occupancy?.trendValue,
        },
        {
          title: 'Выручка за сегодня',
          value: metricsData?.revenue?.value || '0 ₽',
          subtitle: 'общая сумма поступлений',
          icon: 'TrendingUp',
          iconColor: 'var(--color-success)',
          trend: metricsData?.revenue?.trend,
          trendValue: metricsData?.revenue?.trendValue,
        },
        {
          title: 'Ожидают выписки',
          value: metricsData?.pendingDischarges?.value || 0,
          subtitle: 'пациентов готовы к выписке',
          icon: 'UserCheck',
          iconColor: 'var(--color-warning)',
          trend: metricsData?.pendingDischarges?.trend,
          trendValue: metricsData?.pendingDischarges?.trendValue,
        },
        {
          title: 'Новые поступления',
          value: metricsData?.newAdmissions?.value || 0,
          subtitle: 'пациентов за сегодня',
          icon: 'UserPlus',
          iconColor: 'var(--color-accent)',
          trend: metricsData?.newAdmissions?.trend,
          trendValue: metricsData?.newAdmissions?.trendValue,
        },
      ],
      doctor: [
        {
          title: 'Текущая загрузка',
          value: metricsData?.occupancy?.value || 0,
          subtitle: 'пациентов в стационаре',
          icon: 'Users',
          iconColor: 'var(--color-primary)',
          trend: metricsData?.occupancy?.trend,
          trendValue: metricsData?.occupancy?.trendValue,
        },
        {
          title: 'Мои пациенты',
          value: metricsData?.myPatients?.value || 0,
          subtitle: 'под моим наблюдением',
          icon: 'Stethoscope',
          iconColor: 'var(--color-success)',
          trend: metricsData?.myPatients?.trend,
          trendValue: metricsData?.myPatients?.trendValue,
        },
        {
          title: 'Ожидают выписки',
          value: metricsData?.pendingDischarges?.value || 0,
          subtitle: 'пациентов готовы к выписке',
          icon: 'UserCheck',
          iconColor: 'var(--color-warning)',
          trend: metricsData?.pendingDischarges?.trend,
          trendValue: metricsData?.pendingDischarges?.trendValue,
        },
        {
          title: 'Критические случаи',
          value: metricsData?.criticalCases?.value || 0,
          subtitle: 'требуют внимания',
          icon: 'AlertCircle',
          iconColor: 'var(--color-error)',
          trend: metricsData?.criticalCases?.trend,
          trendValue: metricsData?.criticalCases?.trendValue,
        },
      ],
      accountant: [
        {
          title: 'Выручка за сегодня',
          value: metricsData?.revenue?.value || '0 ₽',
          subtitle: 'общая сумма поступлений',
          icon: 'TrendingUp',
          iconColor: 'var(--color-success)',
          trend: metricsData?.revenue?.trend,
          trendValue: metricsData?.revenue?.trendValue,
        },
        {
          title: 'Ожидают оплаты',
          value: metricsData?.pendingPayments?.value || 0,
          subtitle: 'неоплаченных счетов',
          icon: 'Clock',
          iconColor: 'var(--color-warning)',
          trend: metricsData?.pendingPayments?.trend,
          trendValue: metricsData?.pendingPayments?.trendValue,
        },
        {
          title: 'Активные сметы',
          value: metricsData?.estimates?.value || 0,
          subtitle: 'в работе',
          icon: 'FileText',
          iconColor: 'var(--color-primary)',
          trend: metricsData?.estimates?.trend,
          trendValue: metricsData?.estimates?.trendValue,
        },
        {
          title: 'Собрано средств',
          value: metricsData?.collections?.value || '0 ₽',
          subtitle: 'за текущий месяц',
          icon: 'Wallet',
          iconColor: 'var(--color-accent)',
          trend: metricsData?.collections?.trend,
          trendValue: metricsData?.collections?.trendValue,
        },
      ],
    };

    return roleMetrics?.[currentRole] || roleMetrics?.admin;
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={handleToggleSidebar} />
      <div
        className={`flex-1 flex flex-col transition-smooth ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'
        }`}
      >
        <Header
          userRole={currentRole}
          onPatientSelect={handlePatientSelect}
          onRoleChange={handleRoleChange}
          onActionClick={handleActionClick}
        />

        <main className="flex-1 overflow-y-auto scroll-smooth p-4 md:p-6 lg:p-8">
          <div className="max-w-[1920px] mx-auto space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col gap-2 md:gap-3">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground">
                  Главная панель
                </h1>
                <p className="text-sm md:text-base caption text-muted-foreground">
                  Обзор текущего состояния клиники и ключевых показателей
                </p>
              </div>
              
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors ${
                  isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="Обновить данные"
              >
                <RefreshCw 
                  className={`w-5 h-5 text-foreground ${isRefreshing ? 'animate-spin' : ''}`} 
                />
                <span className="text-sm font-medium text-foreground hidden md:inline">
                  {isRefreshing ? 'Обновление...' : 'Обновить'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {renderMetricCards()?.map((metric, index) => (
                <MetricCard key={index} {...metric} loading={loading} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <CapacityOverview capacityData={capacityData} loading={loading} />
              <UrgentNotificationsList
                notifications={notifications}
                loading={loading}
                onViewAll={handleViewAllNotifications}
                onClearNotification={handleClearNotification}
                onClearAll={handleClearAllNotifications}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="lg:col-span-2">
                <QuickAccessShortcuts userRole={currentRole} />
              </div>
              <div className="lg:col-span-1">
                <SystemHealthIndicator systemStatus={systemStatus} loading={loading} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainDashboard;