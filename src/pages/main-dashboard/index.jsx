import React, { useState, useEffect } from 'react';
import MetricCard from './components/MetricCard';
import CapacityOverview from './components/CapacityOverview';
import UrgentNotificationsList from './components/UrgentNotificationsList';
import QuickAccessShortcuts from './components/QuickAccessShortcuts';
import SystemHealthIndicator from './components/SystemHealthIndicator';
import Layout from '../../components/navigation/Layout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import patientServiceInstance from '../../services/patientService';
import inpatientService from '../../services/inpatientService';
import estimateService from '../../services/estimateService';
import notificationService from '../../services/notificationService';
import { RefreshCw, AlertCircle } from 'lucide-react';
import realtimeSyncService from '../../services/realtimeSync';

export default function Dashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const currentRole = userProfile?.role || 'admin';
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [metricsData, setMetricsData] = useState({
    occupancy: { value: 0, trend: 'up', trendValue: '+0%' },
    revenue: { value: '0 ₽', trend: 'up', trendValue: '+0%' },
    pendingDischarges: { value: 0, trend: 'down', trendValue: '0' },
    newAdmissions: { value: 0, trend: 'up', trendValue: '+0' },
  });
  const [capacityData, setCapacityData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [systemStatus, setSystemStatus] = useState([]);

  // ✅ Real-time sync listeners
  useEffect(() => {
    console.log('🔄 Setting up real-time sync listeners for dashboard');
    
    const unsubscribePatients = realtimeSyncService?.subscribe('patients', (event) => {
      console.log('📡 Patients sync event:', event);
      loadDashboardData();
    });

    const unsubscribeInpatient = realtimeSyncService?.subscribe('inpatient_records', (event) => {
      console.log('📡 Inpatient records sync event:', event);
      loadDashboardData();
    });

    const unsubscribeDashboard = realtimeSyncService?.subscribe('dashboard', (event) => {
      console.log('📡 Dashboard sync event:', event);
      if (event?.action === 'patient_stats_changed' || event?.action === 'capacity_changed') {
        loadDashboardData();
      }
    });

    return () => {
      unsubscribePatients();
      unsubscribeInpatient();
      unsubscribeDashboard();
    };
  }, []);

  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(() => {
      loadDashboardData();
    }, 10000);

    const handlePatientUpdate = () => {
      console.log('📢 Patient data updated, syncing dashboard...');
      loadDashboardData();
    };

    const handleFinancialUpdate = () => {
      console.log('📢 Financial data updated, syncing dashboard...');
      loadDashboardData();
    };

    const handleInpatientUpdate = () => {
      console.log('📢 Inpatient data updated, syncing dashboard...');
      loadDashboardData();
    };

    const handleNotificationSync = () => {
      console.log('📢 Notification sync requested, refreshing dashboard...');
      loadDashboardData();
    };

    window.addEventListener('patientUpdated', handlePatientUpdate);
    window.addEventListener('financialUpdate', handleFinancialUpdate);
    window.addEventListener('inpatientDataUpdated', handleInpatientUpdate);
    window.addEventListener('notificationSync', handleNotificationSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener('patientUpdated', handlePatientUpdate);
      window.removeEventListener('financialUpdate', handleFinancialUpdate);
      window.removeEventListener('inpatientDataUpdated', handleInpatientUpdate);
      window.removeEventListener('notificationSync', handleNotificationSync);
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const loadDashboardData = async () => {
    if (!isRefreshing && loading === true) {
      setLoading(true);
    }

    try {
      console.log('📊 Connecting to database...');

      // ✅ Enhanced error handling with individual fallbacks
      const [statsResult, revenueResult, roomsResult, notificationsResult, systemResult] = await Promise.allSettled([
        patientServiceInstance?.getDashboardStatistics(),
        estimateService?.getRevenueStatistics(),
        inpatientService?.getRoomCapacity(),
        notificationService?.getUrgentNotifications(),
        notificationService?.getSystemHealth()
      ]);

      // ✅ Process results with fallback handling
      const stats = statsResult?.status === 'fulfilled' && statsResult?.value?.success 
        ? statsResult?.value?.data 
        : { activePatients: 0, pendingDischarges: 0, newAdmissions: 0, alertPatients: 0 };
        
      const revenue = revenueResult?.status === 'fulfilled' && revenueResult?.value?.success
        ? revenueResult?.value?.data
        : { todayRevenue: 0, pendingPaymentsCount: 0, activeEstimatesCount: 0, monthCollections: 0 };

      // Process metrics based on role
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

      // Process capacity data with fallback
      if (roomsResult?.status === 'fulfilled' && roomsResult?.value?.success) {
        const capacityMap = {
          'economy': { type: 'Эконом', icon: 'Home', color: 'var(--color-primary)' },
          'standard': { type: 'Стандарт', icon: 'Building', color: 'var(--color-success)' },
          'comfort': { type: 'Комфорт', icon: 'Star', color: 'var(--color-warning)' },
          'vip': { type: 'VIP', icon: 'Crown', color: 'var(--color-accent)' }
        };

        const formattedCapacity = roomsResult?.value?.data?.map(room => ({
          type: capacityMap?.[room?.type]?.type || room?.type,
          occupied: room?.occupied || 0,
          total: room?.capacity || 0,
          available: (room?.capacity || 0) - (room?.occupied || 0),
          icon: capacityMap?.[room?.type]?.icon || 'Home',
          color: capacityMap?.[room?.type]?.color || 'var(--color-primary)'
        })) || [];

        setCapacityData(formattedCapacity);
      } else {
        setCapacityData([]);
      }

      // Set notifications with fallback
      if (notificationsResult?.status === 'fulfilled' && Array.isArray(notificationsResult?.value)) {
        setNotifications(notificationsResult?.value || []);
      } else {
        setNotifications([]);
      }

      // Set system status with fallback
      if (systemResult?.status === 'fulfilled' && Array.isArray(systemResult?.value)) {
        setSystemStatus(systemResult?.value || []);
      } else {
        setSystemStatus([]);
      }

      console.log('✅ Dashboard data loaded successfully');
      setError(null);
      setRetryCount(0);
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      
      // ✅ Enhanced error handling with retry logic
      setError({
        message: error?.message || 'Ошибка подключения к базе данных',
        details: error?.toString()
      });
      
      // Auto-retry with exponential backoff (max 3 retries)
      if (retryCount < 3) {
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 8000);
        console.log(`🔄 Retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/3)`);
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadDashboardData();
        }, retryDelay);
      }
    } finally {
      setLoading(false);
    }
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
    <Layout userRole={currentRole} onRoleChange={handleRoleChange}>
      <div className="min-h-screen bg-background">
        <div className="max-w-[1920px] mx-auto w-full space-y-4 sm:space-y-6 md:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground">
                Главная панель
              </h1>
              <p className="text-xs sm:text-sm md:text-base caption text-muted-foreground">
                Обзор текущего состояния клиники и ключевых показателей
              </p>
            </div>
            
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className={`
                flex items-center justify-center gap-2 px-3 py-2 sm:px-4 rounded-lg 
                border border-border bg-background hover:bg-muted transition-colors
                self-start sm:self-auto touch-manipulation
                ${isRefreshing ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
              `}
              title="Обновить данные"
            >
              <RefreshCw 
                className={`w-4 h-4 sm:w-5 sm:h-5 text-foreground ${isRefreshing ? 'animate-spin' : ''}`} 
              />
              <span className="text-xs sm:text-sm font-medium text-foreground">
                {isRefreshing ? 'Обновление...' : 'Обновить'}
              </span>
            </button>
          </div>

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xs sm:text-sm font-semibold text-red-900 mb-1">
                  Ошибка подключения к базе данных
                </h3>
                <p className="text-xs sm:text-sm text-red-700 mb-2">
                  {error?.message || 'Не удалось загрузить данные. Проверьте подключение к интернету и настройки Supabase.'}
                </p>
                {retryCount >= 3 && (
                  <button
                    onClick={() => {
                      setRetryCount(0);
                      setError(null);
                      loadDashboardData();
                    }}
                    className="text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 underline active:text-red-800"
                  >
                    Попробовать снова
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {renderMetricCards()?.map((metric, index) => (
              <MetricCard key={index} {...metric} loading={loading} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <CapacityOverview capacityData={capacityData} loading={loading} />
            <UrgentNotificationsList
              notifications={notifications}
              loading={loading}
              onViewAll={handleViewAllNotifications}
              onClearNotification={handleClearNotification}
              onClearAll={handleClearAllNotifications}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <div className="lg:col-span-2">
              <QuickAccessShortcuts userRole={currentRole} />
            </div>
            <div className="lg:col-span-1">
              <SystemHealthIndicator systemStatus={systemStatus} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}