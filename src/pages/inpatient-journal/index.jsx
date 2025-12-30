import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';


import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import RoomCapacitySidebar from './components/RoomCapacitySidebar';
import FilterToolbar from './components/FilterToolbar';
import PatientGridRow from './components/PatientGridRow';
import BulkActionsBar from './components/BulkActionsBar';
import inpatientService from '../../services/inpatientService';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/ui/Pagination';
import realtimeSyncService from '../../services/realtimeSync';
import Layout from '../../components/navigation/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { pageVariants, pageTransition } from '../../config/animations';


export default function InpatientJournal() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const currentRole = userProfile?.role || 'admin';
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'admissionDate', direction: 'desc' });
  const [rooms, setRooms] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(25);
  const [showRoomAssignmentModal, setShowRoomAssignmentModal] = useState(false);
  const [selectedPatientForRoom, setSelectedPatientForRoom] = useState(null);

  // ✅ NEW: Set up real-time sync listeners
  useEffect(() => {
    console.log('🔄 Setting up real-time sync listeners for inpatient journal');
    
    // Subscribe to inpatient records changes
    const unsubscribeInpatient = realtimeSyncService?.subscribe('inpatient_records', (event) => {
      console.log('📡 Inpatient records sync event:', event);
      loadInpatients();
    });

    // Subscribe to estimate changes (for placement services)
    const unsubscribeEstimates = realtimeSyncService?.subscribe('estimates', (event) => {
      console.log('📡 Estimates sync event:', event);
      if (event?.action === 'create' || event?.action === 'update') {
        loadInpatients();
      }
    });

    // Subscribe to patient changes
    const unsubscribePatients = realtimeSyncService?.subscribe('patients', (event) => {
      console.log('📡 Patients sync event:', event);
      loadInpatients();
    });

    // Subscribe to force refresh events
    const unsubscribeRefresh = realtimeSyncService?.subscribe('force_refresh', () => {
      console.log('🔄 Force refresh triggered');
      loadInpatients();
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeInpatient();
      unsubscribeEstimates();
      unsubscribePatients();
      unsubscribeRefresh();
    };
  }, []);

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

  useEffect(() => {
    loadInpatients();

    // Listen for external updates from other modules
    const handleEstimateUpdate = () => {
      console.log('📢 Estimate update detected, refreshing inpatient journal...');
      loadInpatients();
    };

    const handlePatientUpdate = () => {
      console.log('📢 Patient update detected, refreshing inpatient journal...');
      loadInpatients();
    };

    const handleNotificationSync = () => {
      console.log('📢 Notification sync requested, refreshing inpatient journal...');
      loadInpatients();
    };

    window.addEventListener('estimateCreated', handleEstimateUpdate);
    window.addEventListener('estimateUpdated', handleEstimateUpdate);
    window.addEventListener('patientUpdated', handlePatientUpdate);
    window.addEventListener('notificationSync', handleNotificationSync);

    return () => {
      window.removeEventListener('estimateCreated', handleEstimateUpdate);
      window.removeEventListener('estimateUpdated', handleEstimateUpdate);
      window.removeEventListener('patientUpdated', handlePatientUpdate);
      window.removeEventListener('notificationSync', handleNotificationSync);
    };
  }, []);

  const loadInpatients = async () => {
    console.log('🔄 [InpatientJournal] Starting data load...');
    setLoading(true);
    setError(null);
    
    try {
      const roomsResult = await inpatientService?.getRoomCapacity();
      console.log('🏥 [InpatientJournal] Rooms result:', roomsResult);
      
      if (roomsResult?.success) {
        const formattedRooms = roomsResult?.data?.map(r => ({
          number: r?.number || r?.type,
          type: r?.type,
          capacity: r?.capacity,
          occupied: r?.occupied
        }));
        setRooms(formattedRooms);
        console.log('✅ [InpatientJournal] Rooms loaded:', formattedRooms?.length);
      }

      const inpatientsResult = await inpatientService?.getInpatients();
      console.log('👥 [InpatientJournal] Inpatients result:', inpatientsResult);
      
      if (inpatientsResult?.success) {
        console.log('📊 [InpatientJournal] Raw inpatients data:', inpatientsResult?.data);
        
        const formattedPatients = inpatientsResult?.data?.map(ip => {
          // 🔧 FIXED: Better name resolution with multiple fallbacks
          const patientName = ip?.patients?.name || 
                             ip?.name || 
                             'Неизвестный пациент';
          
          const physicianName = ip?.attending_physician || 
                               ip?.attendingPhysician || 
                               ip?.patients?.attendingPhysician || 
                               'Не назначен';
          
          const patientData = {
            id: ip?.id,
            name: patientName,
            medicalRecordNumber: ip?.patients?.medical_record_number || ip?.medicalRecordNumber || '',
            roomNumber: ip?.room_number || ip?.roomNumber,
            roomType: ip?.room_type || ip?.roomType,
            admissionDate: ip?.admission_date || ip?.admissionDate,
            attendingPhysician: physicianName,
            treatmentStatus: ip?.treatment_status || ip?.treatmentStatus,
            estimatedDischarge: ip?.estimated_discharge || ip?.estimatedDischarge,
            diagnosis: ip?.patients?.diagnosis || ip?.diagnosis || '',
            billingStatus: ip?.billing_status || ip?.billingStatus,
            source: ip?.source,
            patients: ip?.patients || {}
          };
          
          console.log('✨ [InpatientJournal] Formatted patient:', patientData?.name, patientData);
          return patientData;
        });
        
        console.log('✅ [InpatientJournal] Setting patients state:', formattedPatients?.length, 'patients');
        setPatients(formattedPatients);
        
        // Immediate state verification
        console.log('🔍 [InpatientJournal] Patients state after set should be:', formattedPatients?.length);
      } else {
        console.warn('⚠️ [InpatientJournal] Failed to load inpatients:', inpatientsResult?.error);
        setError(inpatientsResult?.error || 'Failed to load patient data');
      }
    } catch (err) {
      console.error('❌ [InpatientJournal] Error loading data:', err);
      setError(err?.message || 'An error occurred while loading data');
    } finally {
      setLoading(false);
      console.log('✅ [InpatientJournal] Data load complete');
    }
    
    // After loading, dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('inpatientDataUpdated', { 
      detail: { timestamp: new Date().toISOString() } 
    }));
  };

  useEffect(() => {
    applyFilters();
  }, [filters, sortConfig, selectedRoom, patients]);

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
  };

  const applyFilters = () => {
    let filtered = [...patients];

    if (selectedRoom) {
      filtered = filtered?.filter(p => p?.roomNumber === selectedRoom);
    }

    if (filters?.searchQuery) {
      const query = filters?.searchQuery?.toLowerCase();
      filtered = filtered?.filter(p =>
        p?.name?.toLowerCase()?.includes(query) ||
        p?.roomNumber?.includes(query) ||
        p?.medicalRecordNumber?.toLowerCase()?.includes(query)
      );
    }

    if (filters?.roomTypes && filters?.roomTypes?.length > 0) {
      filtered = filtered?.filter(p => filters?.roomTypes?.includes(p?.roomType));
    }

    if (filters?.physician) {
      filtered = filtered?.filter(p => p?.attendingPhysician === filters?.physician);
    }

    if (filters?.treatmentStatus && filters?.treatmentStatus?.length > 0) {
      filtered = filtered?.filter(p => filters?.treatmentStatus?.includes(p?.treatmentStatus));
    }

    if (filters?.admissionDateFrom) {
      filtered = filtered?.filter(p => new Date(p.admissionDate) >= new Date(filters.admissionDateFrom));
    }

    if (filters?.admissionDateTo) {
      filtered = filtered?.filter(p => new Date(p.admissionDate) <= new Date(filters.admissionDateTo));
    }

    filtered?.sort((a, b) => {
      const aValue = a?.[sortConfig?.key];
      const bValue = b?.[sortConfig?.key];
      
      if (sortConfig?.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredPatients(filtered);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedPatients(paginatedData?.map(p => p?.id));
    } else {
      setSelectedPatients([]);
    }
  };

  const handleSelectPatient = (patientId, checked) => {
    if (checked) {
      setSelectedPatients([...selectedPatients, patientId]);
    } else {
      setSelectedPatients(selectedPatients?.filter(id => id !== patientId));
    }
  };

  const handleBulkAction = (action, data) => {
    if (action === 'assign-room' && selectedPatients?.length > 0) {
      // For bulk assignment, open modal with first patient
      const firstPatient = patients?.find(p => p?.id === selectedPatients?.[0]);
      if (firstPatient) {
        setSelectedPatientForRoom(firstPatient);
        setShowRoomAssignmentModal(true);
      }
    } else {
      console.log('Bulk action:', action, 'for patients:', selectedPatients, 'with data:', data);
    }
    setSelectedPatients([]);
  };

  const handleQuickAction = (patientId, action) => {
    if (action === 'assign-room') {
      const patient = patients?.find(p => p?.id === patientId);
      if (patient) {
        setSelectedPatientForRoom(patient);
        setShowRoomAssignmentModal(true);
      }
    } else if (action === 'refresh-data') {
      // Refresh data after edit
      loadInpatients();
    } else {
      console.log('Quick action:', action, 'for patient:', patientId);
    }
  };

  const handleRoomAssignmentSuccess = () => {
    loadInpatients();
    setSelectedPatientForRoom(null);
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig?.key === key && sortConfig?.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const allSelected = paginatedData?.length > 0 && selectedPatients?.length === paginatedData?.length;
  const someSelected = selectedPatients?.length > 0 && selectedPatients?.length < paginatedData?.length;

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
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <Icon name="AlertCircle" size={20} />
              <div>
                <p className="font-medium">Error loading data</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <RoomCapacitySidebar
                rooms={rooms}
                onRoomSelect={setSelectedRoom}
                selectedRoom={selectedRoom}
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-2">
                Журнал стационара
              </h1>
              <p className="text-sm md:text-base caption text-muted-foreground">
                Управление пациентами и палатами • {filteredPatients?.length || 0} {filteredPatients?.length === 1 ? 'пациент' : 'пациентов'}
              </p>
              {loading && (
                <p className="text-xs text-blue-600 mt-1">Загрузка данных...</p>
              )}
            </div>

            <FilterToolbar
              onFilterChange={setFilters}
              onSavePreset={(preset) => console.log('Save preset:', preset)}
              savedPresets={[
                { id: 1, name: 'Выписка сегодня', filters: {} },
                { id: 2, name: 'Просроченные', filters: {} }
              ]}
            />

            <div className="flex justify-end items-center mb-4">
              <div className="flex items-center gap-2">
                <label htmlFor="pageSize" className="text-sm text-muted-foreground">
                  Показывать по:
                </label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e?.target?.value))}
                  className="px-3 py-1 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg elevation-sm overflow-hidden">
              <div className="hidden lg:block border-b border-border bg-muted/30">
                <div className="flex items-center gap-4 p-4">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={(e) => handleSelectAll(e?.target?.checked)}
                  />

                  <div className="grid grid-cols-12 gap-4 flex-1">
                    <button
                      onClick={() => handleSort('medicalRecordNumber')}
                      className="col-span-3 flex items-center gap-2 text-left text-xs font-caption font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth"
                    >
                      ID пациента (MRN)
                      <Icon
                        name={sortConfig?.key === 'medicalRecordNumber' ? (sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'}
                        size={14}
                      />
                    </button>

                    <button
                      onClick={() => handleSort('roomNumber')}
                      className="col-span-2 flex items-center gap-2 text-left text-xs font-caption font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth"
                    >
                      Палата
                      <Icon
                        name={sortConfig?.key === 'roomNumber' ? (sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'}
                        size={14}
                      />
                    </button>

                    <button
                      onClick={() => handleSort('admissionDate')}
                      className="col-span-2 flex items-center gap-2 text-left text-xs font-caption font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth"
                    >
                      Поступление
                      <Icon
                        name={sortConfig?.key === 'admissionDate' ? (sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'}
                        size={14}
                      />
                    </button>

                    <div className="col-span-2 text-xs font-caption font-medium text-muted-foreground uppercase tracking-wider">
                      Врач
                    </div>

                    <div className="col-span-2 text-xs font-caption font-medium text-muted-foreground uppercase tracking-wider">
                      Статус
                    </div>

                    <div className="col-span-1 text-xs font-caption font-medium text-muted-foreground uppercase tracking-wider text-right">
                      Действия
                    </div>
                  </div>
                </div>
              </div>

              <div>
                {loading ? (
                  <div className="p-12 text-center">
                    <Icon name="Loader2" size={48} color="var(--color-primary)" className="mx-auto mb-4 animate-spin" />
                    <p className="text-muted-foreground">Загрузка пациентов...</p>
                  </div>
                ) : error ? (
                  <div className="p-12 text-center">
                    <Icon name="AlertCircle" size={48} color="var(--color-red-500)" className="mx-auto mb-4" />
                    <p className="text-lg font-body text-red-600 mb-2">
                      Ошибка загрузки данных
                    </p>
                    <p className="text-sm caption text-muted-foreground mb-4">
                      {error}
                    </p>
                    <Button
                      variant="outline"
                      size="default"
                      iconName="RefreshCw"
                      iconPosition="left"
                      onClick={loadInpatients}
                    >
                      Повторить попытку
                    </Button>
                  </div>
                ) : paginatedData?.length > 0 ? (
                  paginatedData?.map((patient) => (
                    <PatientGridRow
                      key={patient?.id}
                      patient={patient}
                      isSelected={selectedPatients?.includes(patient?.id)}
                      onSelect={handleSelectPatient}
                      userRole={currentRole}
                      onQuickAction={handleQuickAction}
                    />
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <Icon name="Users" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                    <p className="text-lg font-body text-muted-foreground mb-2">
                      Пациенты не найдены
                    </p>
                    <p className="text-sm caption text-muted-foreground mb-4">
                      {filters?.searchQuery || selectedRoom || Object.keys(filters)?.length > 0
                        ? 'Попробуйте изменить параметры фильтрации' :'Нет активных пациентов в стационаре. Добавьте нового пациента для начала работы.'}
                    </p>
                    {(!filters?.searchQuery && !selectedRoom && Object.keys(filters)?.length === 0) && (
                      <Button
                        variant="default"
                        size="default"
                        iconName="UserPlus"
                        iconPosition="left"
                        onClick={() => navigate('/patient-directory')}
                      >
                        Добавить пациента
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

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
                className="mt-4"
              />
            )}
          </div>
        </div>

        <BulkActionsBar
          selectedCount={selectedPatients?.length}
          onBulkAction={handleBulkAction}
          onClearSelection={() => setSelectedPatients([])}
        />
      </motion.div>
    </Layout>
  );
}