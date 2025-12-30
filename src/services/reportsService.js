import { supabase } from '../lib/supabase';

const ReportsService = {
  async getReportCategories() {
    const categories = [
      { id: 'financial', name: 'Финансовые отчеты', description: 'Выручка, платежи, задолженности', icon: 'DollarSign', allowedRoles: ['admin', 'accountant'], reportCount: 8 },
      { id: 'clinical', name: 'Клинические отчеты', description: 'Диагнозы, процедуры, результаты', icon: 'Activity', allowedRoles: ['admin', 'doctor'], reportCount: 12 },
      { id: 'operational', name: 'Операционные отчеты', description: 'Загруженность, койко-места, персонал', icon: 'TrendingUp', allowedRoles: ['admin'], reportCount: 6 },
      { id: 'patient', name: 'Пациенты', description: 'Демография, посещения, удовлетворенность', icon: 'Users', allowedRoles: ['admin', 'doctor'], reportCount: 5 }
    ];
    return { success: true, data: categories };
  },

  async getReportsList() {
    const reportsByCategory = {
      financial: [
        { id: 'fin-1', name: 'Ежемесячная выручка', description: 'Детализация доходов по источникам', icon: 'BarChart3', isFavorite: true, lastRun: new Date().toISOString(), frequency: 'monthly' }
      ],
      clinical: [
        { id: 'clin-1', name: 'Топ диагнозов по МКБ-10', description: 'Наиболее частые диагностические коды', icon: 'FileSearch', isFavorite: true, lastRun: new Date().toISOString(), frequency: 'monthly' }
      ],
      operational: [],
      patient: []
    };
    return { success: true, data: reportsByCategory };
  },

  async getKPIMetrics(filters) {
    try {
      const [
        { data: estimates },
        { count: activePatients },
        { count: totalPatients }
      ] = await Promise.all([
        supabase.from('estimates').select('total_amount, status'),
        supabase.from('inpatients').select('*', { count: 'exact', head: true }).eq('treatment_status', 'treatment'),
        supabase.from('patients').select('*', { count: 'exact', head: true })
      ]);

      const totalRevenue = estimates?.reduce((sum, est) => sum + Number(est.total_amount), 0) || 0;
      const paidRevenue = estimates?.filter(est => est.status === 'paid').reduce((sum, est) => sum + Number(est.total_amount), 0) || 0;

      return {
        success: true,
        data: [
          { title: 'Общая выручка', value: `${totalRevenue.toLocaleString('ru-RU')} ₽`, change: 0, trend: 'up', icon: 'DollarSign', color: 'text-green-600' },
          { title: 'Оплаченные счета', value: `${paidRevenue.toLocaleString('ru-RU')} ₽`, change: 0, trend: 'up', icon: 'CheckCircle', color: 'text-blue-600' },
          { title: 'Активные пациенты', value: (activePatients || 0).toString(), change: 0, trend: 'up', icon: 'Users', color: 'text-purple-600' },
          { title: 'Всего пациентов', value: (totalPatients || 0).toString(), change: 0, trend: 'up', icon: 'Activity', color: 'text-orange-600' }
        ]
      };
    } catch (error) {
      console.error('Error fetching KPI metrics:', error);
      return { success: false, data: [], error: error.message };
    }
  }
};

export default ReportsService;
