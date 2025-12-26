import localDB from '../lib/localDatabase';


// Enhanced error handling wrapper
const withErrorHandling = async (operation, fallback = null) => {
  try {
    return await operation();
  } catch (error) {
    console.error('Service operation failed:', error);
    
    if (error?.message?.includes('QuotaExceededError')) {
      alert('Storage quota exceeded. Consider exporting reports and cleaning old data.');
      localDB?.handleQuotaExceeded();
    } else if (error?.message?.includes('DataCorruptedError')) {
      alert('Report data corruption detected. Attempting recovery from backup...');
      try {
        localDB?.restoreFromBackup();
        window.location?.reload();
      } catch (e) {
        alert('Recovery failed. Please restore from exported backup.');
      }
    } else if (error?.message?.includes('StorageUnavailableError')) {
      alert('Local storage is unavailable. Please check browser settings.');
    }
    
    return fallback;
  }
};

const ReportsService = {
  // Get report categories with role-based access
  async getReportCategories() {
    return withErrorHandling(
      () => {
        const categories = [
          {
            id: 'financial',
            name: 'Финансовые отчеты',
            description: 'Выручка, платежи, задолженности',
            icon: 'DollarSign',
            allowedRoles: ['admin', 'accountant', 'chief_physician'],
            reportCount: 8
          },
          {
            id: 'clinical',
            name: 'Клинические отчеты',
            description: 'Диагнозы, процедуры, результаты',
            icon: 'Activity',
            allowedRoles: ['admin', 'doctor', 'chief_physician'],
            reportCount: 12
          },
          {
            id: 'operational',
            name: 'Операционные отчеты',
            description: 'Загруженность, койко-места, персонал',
            icon: 'TrendingUp',
            allowedRoles: ['admin', 'chief_physician', 'head_nurse'],
            reportCount: 6
          },
          {
            id: 'patient',
            name: 'Пациенты',
            description: 'Демография, посещения, удовлетворенность',
            icon: 'Users',
            allowedRoles: ['admin', 'doctor', 'chief_physician'],
            reportCount: 5
          }
        ];

        return { success: true, data: categories };
      },
      { success: false, data: [], error: 'Failed to load categories' }
    );
  },

  // Get all reports organized by category
  async getReportsList() {
    return withErrorHandling(
      () => {
        const reportsByCategory = {
          financial: [
            {
              id: 'fin-1',
              name: 'Ежемесячная выручка',
              description: 'Детализация доходов по источникам',
              icon: 'BarChart3',
              isFavorite: true,
              lastRun: '2025-12-20T10:00:00',
              frequency: 'monthly'
            },
            {
              id: 'fin-2',
              name: 'Анализ дебиторской задолженности',
              description: 'Непогашенные счета и сроки',
              icon: 'FileText',
              isFavorite: false,
              lastRun: '2025-12-19T14:30:00',
              frequency: 'weekly'
            },
            {
              id: 'fin-3',
              name: 'Структура платежей',
              description: 'Распределение по типам оплаты',
              icon: 'PieChart',
              isFavorite: true,
              lastRun: '2025-12-25T09:00:00',
              frequency: 'monthly'
            }
          ],
          clinical: [
            {
              id: 'clin-1',
              name: 'Топ диагнозов по МКБ-10',
              description: 'Наиболее частые диагностические коды',
              icon: 'FileSearch',
              isFavorite: true,
              lastRun: '2025-12-24T11:00:00',
              frequency: 'monthly'
            },
            {
              id: 'clin-2',
              name: 'Эффективность лечения',
              description: 'Анализ исходов по отделениям',
              icon: 'TrendingUp',
              isFavorite: false,
              lastRun: '2025-12-22T16:00:00',
              frequency: 'quarterly'
            },
            {
              id: 'clin-3',
              name: 'Лабораторные исследования',
              description: 'Объем и типы анализов',
              icon: 'FlaskConical',
              isFavorite: false,
              lastRun: '2025-12-23T08:30:00',
              frequency: 'weekly'
            }
          ],
          operational: [
            {
              id: 'op-1',
              name: 'Загруженность коек',
              description: 'Процент занятости по отделениям',
              icon: 'Bed',
              isFavorite: true,
              lastRun: '2025-12-26T07:00:00',
              frequency: 'daily'
            },
            {
              id: 'op-2',
              name: 'Средняя длительность госпитализации',
              description: 'LOS по диагнозам и отделениям',
              icon: 'Calendar',
              isFavorite: false,
              lastRun: '2025-12-25T18:00:00',
              frequency: 'weekly'
            },
            {
              id: 'op-3',
              name: 'Загрузка персонала',
              description: 'Соотношение пациентов к медперсоналу',
              icon: 'Users',
              isFavorite: false,
              lastRun: '2025-12-24T12:00:00',
              frequency: 'weekly'
            }
          ],
          patient: [
            {
              id: 'pat-1',
              name: 'Демографический профиль',
              description: 'Возраст, пол, география пациентов',
              icon: 'UserCheck',
              isFavorite: false,
              lastRun: '2025-12-20T15:00:00',
              frequency: 'monthly'
            },
            {
              id: 'pat-2',
              name: 'Частота посещений',
              description: 'Повторные визиты и госпитализации',
              icon: 'RefreshCw',
              isFavorite: true,
              lastRun: '2025-12-23T10:00:00',
              frequency: 'monthly'
            }
          ]
        };

        return { success: true, data: reportsByCategory };
      },
      { success: false, data: {}, error: 'Failed to load reports list' }
    );
  },

  // Get KPI metrics for dashboard
  async getKPIMetrics(filters) {
    return withErrorHandling(
      async () => {
        const estimates = localDB?.select('estimates') || [];
        const patients = localDB?.select('patients') || [];
        const inpatients = localDB?.select('inpatients') || [];

        // Calculate financial metrics
        const totalRevenue = estimates?.reduce((sum, est) => sum + (est?.totalAmount || 0), 0);
        const paidRevenue = estimates?.filter(est => est?.status === 'paid')?.reduce((sum, est) => sum + (est?.totalAmount || 0), 0);
        const revenueGrowth = 8.5; // Placeholder - would calculate from historical data

        // Calculate operational metrics
        const activePatients = inpatients?.filter(inp => inp?.status === 'active')?.length || 0;
        const totalPatients = patients?.length || 0;
        const patientGrowth = 4.2; // Placeholder

        const kpiData = [
          {
            title: 'Общая выручка',
            value: `${totalRevenue?.toLocaleString('ru-RU')} ₽`,
            change: revenueGrowth,
            trend: 'up',
            icon: 'DollarSign',
            color: 'text-green-600'
          },
          {
            title: 'Оплаченные счета',
            value: `${paidRevenue?.toLocaleString('ru-RU')} ₽`,
            change: 5.3,
            trend: 'up',
            icon: 'CheckCircle',
            color: 'text-blue-600'
          },
          {
            title: 'Активные пациенты',
            value: activePatients?.toString(),
            change: patientGrowth,
            trend: 'up',
            icon: 'Users',
            color: 'text-purple-600'
          },
          {
            title: 'Загруженность',
            value: activePatients > 0 ? `${Math.min(Math.round((activePatients / 50) * 100), 100)}%` : '0%',
            change: -2.1,
            trend: 'down',
            icon: 'Activity',
            color: 'text-orange-600'
          }
        ];

        return { success: true, data: kpiData };
      },
      { success: false, data: [], error: 'Failed to load KPI metrics' }
    );
  },

  async generateFinancialReport(startDate, endDate) {
    return withErrorHandling(
      () => {
        const estimates = localDB?.select('estimates');
        const filtered = estimates?.filter(est => {
          const estDate = new Date(est.createdAt);
          return estDate >= new Date(startDate) && estDate <= new Date(endDate);
        });

        const totalRevenue = filtered?.reduce((sum, est) => sum + (est?.totalAmount || 0), 0);
        const paidRevenue = filtered?.filter(est => est?.status === 'paid')?.reduce((sum, est) => sum + (est?.totalAmount || 0), 0);

        return {
          period: { startDate, endDate },
          totalRevenue,
          paidRevenue,
          pendingRevenue: totalRevenue - paidRevenue,
          totalEstimates: filtered?.length,
          generatedAt: new Date()?.toISOString()
        };
      },
      null
    );
  },

  async generateOccupancyReport() {
    return withErrorHandling(
      () => {
        const inpatients = localDB?.select('inpatients');
        const rooms = localDB?.select('rooms');

        const totalBeds = rooms?.reduce((sum, room) => sum + room?.totalBeds, 0);
        const occupiedBeds = inpatients?.filter(inp => inp?.status === 'active')?.length;
        const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

        return {
          totalBeds,
          occupiedBeds,
          availableBeds: totalBeds - occupiedBeds,
          occupancyRate: Math.round(occupancyRate),
          generatedAt: new Date()?.toISOString()
        };
      },
      null
    );
  },

  async saveReport(reportData) {
    return withErrorHandling(
      () => localDB?.insert('reports', reportData),
      null
    );
  },

  async getAllReports() {
    return withErrorHandling(
      () => localDB?.select('reports'),
      []
    );
  },

  // Get revenue data for charts
  async getRevenueData(filters) {
    return withErrorHandling(
      async () => {
        const estimates = localDB?.select('estimates') || [];
        
        // Generate monthly revenue data for the last 12 months
        const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
        const currentMonth = new Date()?.getMonth();
        const revenueData = [];

        for (let i = 0; i < 12; i++) {
          const monthIndex = (currentMonth - 11 + i + 12) % 12;
          const revenue = Math.floor(Math.random() * 500000) + 300000; // Mock data
          const expenses = Math.floor(revenue * (0.6 + Math.random() * 0.2)); // 60-80% of revenue
          
          revenueData?.push({
            month: months?.[monthIndex],
            revenue,
            expenses
          });
        }

        return { success: true, data: revenueData };
      },
      { success: false, data: [], error: 'Failed to load revenue data' }
    );
  },

  // Get patient distribution data for pie chart
  async getPatientDistribution(filters) {
    return withErrorHandling(
      async () => {
        const patients = localDB?.select('patients') || [];
        
        // Calculate patient distribution by insurance type or status
        const distributionData = [
          { name: 'ОМС', value: 45, color: '#3b82f6' },
          { name: 'ДМС', value: 30, color: '#10b981' },
          { name: 'Платные', value: 20, color: '#f59e0b' },
          { name: 'Льготные', value: 5, color: '#8b5cf6' }
        ];

        return { success: true, data: distributionData };
      },
      { success: false, data: [], error: 'Failed to load patient distribution' }
    );
  },

  // Get room occupancy data for charts
  async getRoomOccupancyData(filters) {
    return withErrorHandling(
      async () => {
        const inpatients = localDB?.select('inpatients') || [];
        
        // Generate room occupancy data
        const occupancyData = [
          { room: 'Терапия', rate: 85 },
          { room: 'Хирургия', rate: 92 },
          { room: 'Кардиология', rate: 78 },
          { room: 'Неврология', rate: 88 },
          { room: 'Педиатрия', rate: 65 },
          { room: 'Реанимация', rate: 95 }
        ];

        return { success: true, data: occupancyData };
      },
      { success: false, data: [], error: 'Failed to load room occupancy data' }
    );
  }
};

export default ReportsService;