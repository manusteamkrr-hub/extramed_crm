import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import reportsService from '../../../services/reportsService';

const ReportViewer = ({ report, filters, onExport, onSchedule }) => {
  const [revenueData, setRevenueData] = useState([]);
  const [patientData, setPatientData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [kpiMetrics, setKpiMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (report) {
      loadReportData();
    }
  }, [report, filters]);

  const loadReportData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load revenue data
      const revenueResult = await reportsService?.getRevenueData(filters);
      if (revenueResult?.success) {
        setRevenueData(revenueResult?.data);
      }

      // Load patient distribution
      const patientResult = await reportsService?.getPatientDistribution(filters);
      if (patientResult?.success) {
        setPatientData(patientResult?.data);
      }

      // Load room occupancy
      const occupancyResult = await reportsService?.getRoomOccupancyData(filters);
      if (occupancyResult?.success) {
        setOccupancyData(occupancyResult?.data);
      }

      // Load KPI metrics
      const kpiResult = await reportsService?.getKPIMetrics(filters);
      if (kpiResult?.success) {
        setKpiMetrics(kpiResult?.data);
      }

    } catch (err) {
      console.error('Error loading report data:', err);
      setError(err?.message || 'Ошибка загрузки данных отчета');
    } finally {
      setLoading(false);
    }
  };

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
        <Icon name="FileText" size={64} color="var(--color-muted-foreground)" className="mb-4" />
        <h3 className="font-heading font-semibold text-foreground text-lg md:text-xl mb-2">
          Выберите отчет
        </h3>
        <p className="text-sm md:text-base caption text-muted-foreground max-w-md">
          Выберите отчет из списка слева для просмотра данных и аналитики
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Icon name="Loader" size={48} color="var(--color-primary)" className="animate-spin mb-4" />
        <p className="text-muted-foreground">Загрузка данных отчета...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <Icon name="AlertCircle" size={48} color="var(--color-error)" className="mb-4" />
        <h3 className="font-heading font-semibold text-foreground text-lg mb-2">Ошибка загрузки</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={loadReportData}>Попробовать снова</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-lg p-4 md:p-6 elevation-sm">
        <div className="flex-1 min-w-0">
          <h2 className="font-heading font-semibold text-foreground text-lg md:text-xl mb-2">
            {report?.name}
          </h2>
          <p className="text-sm md:text-base caption text-muted-foreground">
            {report?.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center gap-2">
              <Icon name="Calendar" size={16} color="var(--color-muted-foreground)" />
              <span className="text-xs md:text-sm caption text-muted-foreground">
                Обновлено: {report?.lastUpdated}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Database" size={16} color="var(--color-muted-foreground)" />
              <span className="text-xs md:text-sm caption text-muted-foreground">
                Источник: Supabase БД
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
            onClick={() => onExport('pdf')}
          >
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="FileSpreadsheet"
            iconPosition="left"
            onClick={() => onExport('excel')}
          >
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="Clock"
            iconPosition="left"
            onClick={onSchedule}
          >
            Расписание
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-card border border-border rounded-lg p-4 md:p-6 elevation-sm">
          <h3 className="font-heading font-semibold text-foreground mb-4 text-base md:text-lg">
            Доходы и расходы
          </h3>
          {revenueData?.length > 0 ? (
            <div className="w-full h-64 md:h-80" aria-label="Revenue and Expenses Bar Chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-popover)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="var(--color-primary)" name="Доходы" />
                  <Bar dataKey="expenses" fill="var(--color-error)" name="Расходы" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Нет данных для отображения
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-4 md:p-6 elevation-sm">
          <h3 className="font-heading font-semibold text-foreground mb-4 text-base md:text-lg">
            Распределение пациентов
          </h3>
          {patientData?.length > 0 ? (
            <div className="w-full h-64 md:h-80" aria-label="Patient Distribution Pie Chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={patientData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100)?.toFixed(0)}%`}
                    outerRadius={80}
                    fill="var(--color-primary)"
                    dataKey="value"
                  >
                    {patientData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry?.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-popover)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Нет данных для отображения
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-4 md:p-6 elevation-sm lg:col-span-2">
          <h3 className="font-heading font-semibold text-foreground mb-4 text-base md:text-lg">
            Загруженность палат
          </h3>
          {occupancyData?.length > 0 ? (
            <div className="w-full h-64 md:h-80" aria-label="Room Occupancy Bar Chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" stroke="var(--color-muted-foreground)" />
                  <YAxis dataKey="room" type="category" stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-popover)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="rate" fill="var(--color-success)" name="Загруженность %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Нет данных для отображения
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 md:p-6 elevation-sm">
        <h3 className="font-heading font-semibold text-foreground mb-4 text-base md:text-lg">
          Ключевые показатели
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiMetrics?.map((kpi, index) => (
            <div key={index} className={`p-4 bg-${kpi?.trend === 'up' ? 'success' : 'error'}/5 border border-${kpi?.trend === 'up' ? 'success' : 'error'}/20 rounded-lg`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg bg-${kpi?.trend === 'up' ? 'success' : 'error'}/10 flex items-center justify-center`}>
                  <Icon name={kpi?.icon} size={20} color={`var(--color-${kpi?.trend === 'up' ? 'success' : 'error'})`} />
                </div>
                <p className="text-xs md:text-sm caption text-muted-foreground">{kpi?.title}</p>
              </div>
              <p className="text-xl md:text-2xl font-heading font-semibold text-foreground data-text">
                {kpi?.value}
              </p>
              <p className={`text-xs md:text-sm caption text-${kpi?.trend === 'up' ? 'success' : 'error'} mt-1`}>
                {kpi?.change} к прошлому периоду
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportViewer;