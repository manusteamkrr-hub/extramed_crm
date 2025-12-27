import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';


import Icon from '../../components/AppIcon';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ReportCategoryCard from './components/ReportCategoryCard';
import ReportListItem from './components/ReportListItem';
import ReportFilterPanel from './components/ReportFilterPanel';
import ReportViewer from './components/ReportViewer';
import KPIWidget from './components/KPIWidget';
import reportsService from '../../services/reportsService';
import { pageVariants, pageTransition } from '../../config/animations';
import Layout from '../../components/navigation/Layout';

const ReportsDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentRole, setCurrentRole] = useState('admin');
  const [selectedCategory, setSelectedCategory] = useState('financial');
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    period: 'month',
    startDate: '',
    endDate: '',
    department: 'all',
    physician: 'all',
  });

  // State for actual data
  const [reportCategories, setReportCategories] = useState([]);
  const [allReports, setAllReports] = useState({});
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    loadReportsData();
  }, [filters?.period, filters?.startDate, filters?.endDate]);

  const loadReportsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load categories
      const categoriesResult = await reportsService?.getReportCategories();
      if (categoriesResult?.success) {
        setReportCategories(categoriesResult?.data);
      }

      // Load reports list
      const reportsResult = await reportsService?.getReportsList();
      if (reportsResult?.success) {
        setAllReports(reportsResult?.data);
      }

      // Load KPI data
      const kpiResult = await reportsService?.getKPIMetrics(filters);
      if (kpiResult?.success) {
        setKpiData(kpiResult?.data);
      } else {
        throw new Error(kpiResult?.error || 'Failed to load KPI data');
      }

    } catch (err) {
      console.error('Error loading reports data:', err);
      setError(err?.message || 'Ошибка загрузки данных отчетов');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedReport(null);
  };

  const handleReportSelect = (report) => {
    setSelectedReport(report);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    loadReportsData();
  };

  const handleResetFilters = () => {
    setFilters({
      period: 'month',
      startDate: '',
      endDate: '',
      department: 'all',
      physician: 'all',
    });
  };

  const handleExport = (format) => {
    console.log(`Exporting report in ${format} format`);
  };

  const handleSchedule = () => {
    console.log('Opening schedule dialog');
  };

  const handleToggleFavorite = (reportId) => {
    console.log(`Toggling favorite for report ${reportId}`);
  };

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
  };

  const filteredCategories = reportCategories?.filter((cat) =>
    cat?.allowedRoles?.includes(currentRole)
  );

  const currentReports = allReports?.[selectedCategory] || [];
  const filteredReports = currentReports?.filter((report) =>
    report?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader" size={48} color="var(--color-primary)" className="animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка данных отчетов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <Icon name="AlertCircle" size={48} color="var(--color-error)" className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Ошибка загрузки</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadReportsData}>Попробовать снова</Button>
        </div>
      </div>
    );
  }

  return (
    <Layout userRole={currentRole} onRoleChange={handleRoleChange}>
      <motion.div
        className="p-4 md:p-6 lg:p-8"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-2">
            Отчеты и аналитика
          </h1>
          <p className="text-sm md:text-base caption text-muted-foreground">
            Комплексная аналитика и финансовая отчетность для принятия решений
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {kpiData?.map((kpi, index) => (
            <KPIWidget key={index} {...kpi} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-card border border-border rounded-lg p-4 elevation-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-foreground text-base md:text-lg">
                  Категории отчетов
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Settings"
                  onClick={() => console.log('Settings')}
                />
              </div>
              <div className="space-y-2">
                {filteredCategories?.map((category) => (
                  <ReportCategoryCard
                    key={category?.id}
                    category={category}
                    isActive={selectedCategory === category?.id}
                    onClick={() => handleCategorySelect(category?.id)}
                  />
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 elevation-sm">
              <h3 className="font-heading font-semibold text-foreground mb-3 text-sm md:text-base">
                Избранные отчеты
              </h3>
              <div className="space-y-2">
                {currentReports?.filter((r) => r?.isFavorite)?.slice(0, 3)?.map((report) => (
                    <button
                      key={report?.id}
                      onClick={() => handleReportSelect(report)}
                      className="w-full text-left p-2 rounded-lg hover:bg-muted transition-smooth"
                    >
                      <div className="flex items-center gap-2">
                        <Icon name="Star" size={14} color="var(--color-warning)" className="fill-current flex-shrink-0" />
                        <span className="text-xs md:text-sm font-body text-foreground truncate">
                          {report?.name}
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="bg-card border border-border rounded-lg p-4 elevation-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-foreground text-base md:text-lg">
                  Список отчетов
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName={showFilters ? 'X' : 'Filter'}
                  onClick={() => setShowFilters(!showFilters)}
                />
              </div>

              <Input
                type="search"
                placeholder="Поиск отчетов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                className="mb-4"
              />

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredReports?.length > 0 ? (
                  filteredReports?.map((report) => (
                    <ReportListItem
                      key={report?.id}
                      report={report}
                      onSelect={handleReportSelect}
                      isActive={selectedReport?.id === report?.id}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Icon name="SearchX" size={32} color="var(--color-muted-foreground)" className="mx-auto mb-2" />
                    <p className="text-sm caption text-muted-foreground">
                      Отчеты не найдены
                    </p>
                  </div>
                )}
              </div>
            </div>

            {showFilters && (
              <ReportFilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
              />
            )}
          </div>

          <div className="lg:col-span-6">
            <div className="bg-card border border-border rounded-lg p-4 md:p-6 elevation-sm min-h-[600px]">
              <ReportViewer
                report={selectedReport}
                filters={filters}
                onExport={handleExport}
                onSchedule={handleSchedule}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default ReportsDashboard;