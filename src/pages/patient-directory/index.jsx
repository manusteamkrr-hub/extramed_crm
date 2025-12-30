import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Plus, AlertCircle } from 'lucide-react';
import patientService from '../../services/patientService';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/ui/Pagination';
import StatisticsCards from './components/StatisticsCards';
import SearchFilters from './components/SearchFilters';
import SavedSearches from './components/SavedSearches';
import PatientTable from './components/PatientTable';
import BulkActionsBar from './components/BulkActionsBar';
import ExportModal from './components/ExportModal';
import PatientRegistrationModal from './components/PatientRegistrationModal';
import Layout from '../../components/navigation/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { pageVariants, pageTransition } from '../../config/animations';
import realtimeSyncService from '../../services/realtimeSync';

export default function PatientDirectory() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const currentRole = userProfile?.role || 'admin';
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [databaseStatus, setDatabaseStatus] = useState('checking');
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Initialize pagination
  const {
    paginatedData,
    pageInfo,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    getPageNumbers
  } = usePagination(filteredPatients, {
    pageSize,
    onPageChange: (page) => {
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // ✅ NEW: Set up real-time sync listeners
  useEffect(() => {
    console.log('🔄 Setting up real-time sync listeners for patient directory');
    
    // Subscribe to patient changes
    const unsubscribePatients = realtimeSyncService?.subscribe('patients', (event) => {
      console.log('📡 Patients sync event:', event);
      loadPatients();
    });

    // Subscribe to force refresh events
    const unsubscribeRefresh = realtimeSyncService?.subscribe('force_refresh', () => {
      console.log('🔄 Force refresh triggered');
      loadPatients();
    });

    // Cleanup subscriptions
    return () => {
      unsubscribePatients();
      unsubscribeRefresh();
    };
  }, [currentPage, filters, searchQuery, sortConfig]);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [patients, filters, searchQuery]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      let result = await patientService?.getPatients();
      
      if (result?.success) {
        const patientsData = result?.data || [];
        setPatients(patientsData);
        setFilteredPatients(patientsData);
        
        if (result?.isDemo) {
          setDatabaseStatus('needs_setup');
        } else {
          setDatabaseStatus('connected');
        }
      } else {
        setError(result?.error || 'Failed to load patients');
        setDatabaseStatus('needs_setup');
        setPatients([]);
        setFilteredPatients([]);
      }
    } catch (err) {
      console.error('Error loading patients:', err);
      setError(err?.message || 'An unexpected error occurred');
      setDatabaseStatus('needs_setup');
      setPatients([]);
      setFilteredPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...patients];

    // Apply search query
    if (searchQuery) {
      const query = String(searchQuery || '')?.toLowerCase();
      result = result?.filter(patient => {
        const fullName = `${patient?.firstName || ''} ${patient?.middleName || ''} ${patient?.lastName || ''}`?.toLowerCase();
        const mrn = String(patient?.medicalRecordNumber || patient?.mrn || '')?.toLowerCase();
        const diagnosis = String(patient?.diagnosis || '')?.toLowerCase();
        const phone = String(patient?.phone || '')?.toLowerCase();
        
        return fullName?.includes(query) || 
               mrn?.includes(query) || 
               diagnosis?.includes(query) ||
               phone?.includes(query);
      });
    }

    // Apply filters
    if (filters?.name) {
      const nameQuery = String(filters?.name || '')?.toLowerCase();
      result = result?.filter(patient => {
        const fullName = `${patient?.firstName || ''} ${patient?.middleName || ''} ${patient?.lastName || ''}`?.toLowerCase();
        return fullName?.includes(nameQuery);
      });
    }

    if (filters?.patientId) {
      const idQuery = String(filters?.patientId || '')?.toLowerCase();
      result = result?.filter(patient => 
        String(patient?.medicalRecordNumber || patient?.mrn || '')?.toLowerCase()?.includes(idQuery)
      );
    }

    if (filters?.phone) {
      const phoneQuery = String(filters?.phone || '')?.toLowerCase();
      result = result?.filter(patient => 
        String(patient?.phone || '')?.toLowerCase()?.includes(phoneQuery)
      );
    }

    if (filters?.insurance) {
      const insuranceQuery = String(filters?.insurance || '')?.toLowerCase();
      result = result?.filter(patient => 
        String(patient?.insurance || '')?.toLowerCase() === insuranceQuery
      );
    }

    if (filters?.admissionDateFrom) {
      const fromDate = new Date(filters?.admissionDateFrom);
      result = result?.filter(patient => {
        const admissionDate = new Date(patient?.admissionDate || patient?.createdAt);
        return admissionDate >= fromDate;
      });
    }

    if (filters?.admissionDateTo) {
      const toDate = new Date(filters?.admissionDateTo);
      toDate?.setHours(23, 59, 59, 999);
      result = result?.filter(patient => {
        const admissionDate = new Date(patient?.admissionDate || patient?.createdAt);
        return admissionDate <= toDate;
      });
    }

    if (filters?.status) {
      const statusQuery = String(filters?.status || '')?.toLowerCase();
      result = result?.filter(patient => 
        String(patient?.status || '')?.toLowerCase() === statusQuery
      );
    }

    if (filters?.diagnosis) {
      const diagnosisQuery = String(filters?.diagnosis || '')?.toLowerCase();
      result = result?.filter(patient => 
        String(patient?.diagnosis || '')?.toLowerCase()?.includes(diagnosisQuery)
      );
    }

    if (filters?.ageFrom) {
      result = result?.filter(patient => {
        let age = calculateAge(patient?.dateOfBirth);
        return age >= parseInt(filters?.ageFrom);
      });
    }

    if (filters?.ageTo) {
      result = result?.filter(patient => {
        let age = calculateAge(patient?.dateOfBirth);
        return age <= parseInt(filters?.ageTo);
      });
    }

    if (filters?.gender) {
      const genderQuery = String(filters?.gender || '')?.toLowerCase();
      result = result?.filter(patient => 
        String(patient?.gender || '')?.toLowerCase() === genderQuery
      );
    }

    if (filters?.hasActiveEstimate) {
      result = result?.filter(patient => patient?.hasActiveEstimate === true);
    }

    if (filters?.hasUnpaidBalance) {
      result = result?.filter(patient => patient?.hasUnpaidBalance === true);
    }

    setFilteredPatients(result);
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today?.getFullYear() - birth?.getFullYear();
    const monthDiff = today?.getMonth() - birth?.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today?.getDate() < birth?.getDate())) {
      age--;
    }
    return age;
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const handleSearchSelect = (search) => {
    setSearchQuery(search);
  };

  const handleBulkAction = (action) => {
    console.log('Bulk action:', action, selectedPatients);
  };

  const handleSelectPatient = (patientId) => {
    setSelectedPatients(prev =>
      prev?.includes(patientId)
        ? prev?.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPatients?.length === paginatedData?.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(paginatedData?.map(p => p?.id));
    }
  };

  const handlePatientClick = (patient) => {
    navigate(`/patient-profile/${patient?.id}`, { state: { patient } });
  };

  const handleRegistrationSuccess = async (newPatient) => {
    await loadPatients();
    setSelectedPatients([]);
    alert(`Пациент ${newPatient?.lastName || ''} ${newPatient?.firstName || ''} успешно зарегистрирован!`);
  };

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
  };

  if (loading) {
    return (
      <Layout userRole={currentRole} onRoleChange={handleRoleChange}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка данных пациентов...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole={currentRole} onRoleChange={handleRoleChange}>
      <motion.div
        className="max-w-full"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        {/* Database Setup Banner */}
        {databaseStatus === 'needs_setup' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">
                  Требуется настройка базы данных
                </h3>
                <div className="text-sm text-yellow-700 space-y-2">
                  <p>Учетные данные Supabase настроены, но необходимо инициализировать схему базы данных.</p>
                  <div className="bg-yellow-100 border border-yellow-200 rounded p-3 mt-2">
                    <p className="font-semibold mb-2">Быстрая настройка (2 минуты):</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Откройте <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">Панель Supabase</a></li>
                      <li>Перейдите в <strong>SQL Editor</strong> → Нажмите <strong>New Query</strong></li>
                      <li>Скопируйте весь код из файла <code className="bg-yellow-200 px-1 rounded">DATABASE_SCHEMA.sql</code></li>
                      <li>Вставьте в SQL Editor и нажмите <strong>Run</strong></li>
                      <li>Обновите эту страницу, чтобы увидеть ваши данные!</li>
                    </ol>
                  </div>
                  <p className="text-xs mt-2">
                    📖 Подробные инструкции см. в <code className="bg-yellow-200 px-1 rounded">SUPABASE_SETUP_GUIDE.md</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Success Banner */}
        {databaseStatus === 'connected' && patients?.length > 0 && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  ✅ <strong>База данных подключена!</strong> Интеграция Supabase работает корректно. Все данные пациентов сохранены.
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 mb-1">Ошибка подключения к базе данных</h3>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={loadPatients}
                  className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Попробовать снова
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Справочник пациентов</h1>
              <p className="text-sm text-gray-600 mt-1">
                Управление и поиск записей пациентов
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Экспорт
              </button>
              <button
                onClick={() => setIsRegistrationModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Новый пациент</span>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <StatisticsCards 
            stats={{ 
              total: filteredPatients?.length || 0, 
              active: filteredPatients?.filter(p => p?.status === 'active')?.length || 0, 
              new: filteredPatients?.filter(p => {
                const createdDate = new Date(p?.createdAt);
                const weekAgo = new Date();
                weekAgo?.setDate(weekAgo?.getDate() - 7);
                return createdDate >= weekAgo;
              })?.length || 0, 
              critical: filteredPatients?.filter(p => p?.isCritical === true)?.length || 0 
            }} 
          />

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Поиск по имени, МРН или диагнозу..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Фильтры
              </button>
            </div>

            {showFilters && (
              <div className="mt-4">
                <SearchFilters 
                  onFilterChange={handleFilterChange} 
                  onReset={handleResetFilters}
                  currentFilters={filters}
                />
              </div>
            )}
          </div>

          {/* Page Size Selector */}
          <div className="flex justify-between items-center mb-4">
            <SavedSearches onSearchSelect={(search) => setSearchQuery(search)} />
            
            <div className="flex items-center gap-2">
              <label htmlFor="pageSize" className="text-sm text-gray-700">
                Показывать по:
              </label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e?.target?.value))}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedPatients?.length > 0 && (
            <BulkActionsBar
              selectedCount={selectedPatients?.length}
              onClearSelection={() => setSelectedPatients([])}
              onAction={handleBulkAction}
            />
          )}

          {/* Patients Table - Use paginatedData */}
          <PatientTable
            patients={paginatedData}
            selectedPatients={selectedPatients}
            onSelectPatient={handleSelectPatient}
            onSelectAll={handleSelectAll}
            onPatientClick={handlePatientClick}
            onBulkAction={handleBulkAction}
            onSelectionChange={setSelectedPatients}
          />

          {/* Pagination Controls */}
          {filteredPatients?.length > 0 && (
            <Pagination
              pageInfo={pageInfo}
              onPageChange={goToPage}
              onFirstPage={firstPage}
              onLastPage={lastPage}
              onNextPage={nextPage}
              onPreviousPage={previousPage}
              pageNumbers={getPageNumbers(7)}
              showFirstLast={true}
            />
          )}

          {/* No Results Message */}
          {!loading && filteredPatients?.length === 0 && patients?.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Пациенты не найдены</h3>
              <p className="text-gray-600 mb-4">
                По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска или фильтры.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Сбросить все фильтры
              </button>
            </div>
          )}

          {/* No Patients at All Message */}
          {!loading && patients?.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет зарегистрированных пациентов</h3>
              <p className="text-gray-600 mb-4">
                Начните с регистрации первого пациента в системе.
              </p>
              <button
                onClick={() => setIsRegistrationModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Зарегистрировать пациента
              </button>
            </div>
          )}
        </div>
        {/* Export Modal */}
        {showExportModal && (
          <ExportModal 
            isOpen={showExportModal} 
            onClose={() => setShowExportModal(false)} 
            selectedCount={selectedPatients?.length}
          />
        )}
        {/* Patient Registration Modal */}
        <PatientRegistrationModal
          isOpen={isRegistrationModalOpen}
          onClose={() => setIsRegistrationModalOpen(false)}
          onSuccess={handleRegistrationSuccess}
        />
      </motion.div>
    </Layout>
  );
}