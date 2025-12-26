import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/navigation/Sidebar';
import Header from '../../components/navigation/Header';
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


const InpatientJournal = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userRole, setUserRole] = useState('admin');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'admissionDate', direction: 'desc' });
  const [rooms, setRooms] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(25);

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
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, sortConfig, selectedRoom, patients]);

  const loadData = async () => {
    setLoading(true);
    
    const roomsResult = await inpatientService?.getRoomCapacity();
    if (roomsResult?.success) {
      setRooms(roomsResult?.data?.map(r => ({
        number: r?.number,
        type: r?.type,
        capacity: r?.capacity,
        occupied: r?.occupied
      })));
    }

    const inpatientsResult = await inpatientService?.getInpatients();
    if (inpatientsResult?.success) {
      const formattedPatients = inpatientsResult?.data?.map(ip => ({
        id: ip?.id,
        name: ip?.patients?.name || 'Unknown',
        medicalRecordNumber: ip?.patients?.medical_record_number || '',
        roomNumber: ip?.room_number,
        roomType: ip?.room_type,
        admissionDate: ip?.admission_date,
        attendingPhysician: ip?.attending_physician,
        treatmentStatus: ip?.treatment_status,
        estimatedDischarge: ip?.estimated_discharge,
        diagnosis: ip?.patients?.diagnosis || '',
        billingStatus: ip?.billing_status
      }));
      setPatients(formattedPatients);
    }

    setLoading(false);
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
    console.log('Bulk action:', action, 'for patients:', selectedPatients, 'with data:', data);
    setSelectedPatients([]);
  };

  const handleQuickAction = (patientId, action) => {
    console.log('Quick action:', action, 'for patient:', patientId);
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
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className={`flex-1 flex flex-col transition-smooth ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
        <Header
          userRole={userRole}
          onRoleChange={setUserRole}
          onPatientSelect={(patient) => navigate('/patient-profile', { state: { patientId: patient?.id } })}
          onActionClick={(action) => {
            if (action === 'new-admission') {
              navigate('/patient-directory');
            }
          }}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="hidden lg:block w-80 xl:w-96 overflow-y-auto">
            <RoomCapacitySidebar
              rooms={rooms}
              onRoomSelect={setSelectedRoom}
              selectedRoom={selectedRoom}
            />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <FilterToolbar
              onFilterChange={setFilters}
              onSavePreset={(preset) => console.log('Save preset:', preset)}
              savedPresets={[
                { id: 1, name: 'Выписка сегодня', filters: {} },
                { id: 2, name: 'Просроченные', filters: {} }
              ]}
            />

            <div className="flex-1 overflow-y-auto">
              <div className="p-3 md:p-4 lg:p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
                  <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground">
                      Журнал стационара
                    </h1>
                    <p className="text-sm md:text-base caption text-muted-foreground mt-1 md:mt-2">
                      Управление пациентами и палатами • {filteredPatients?.length} {filteredPatients?.length === 1 ? 'пациент' : 'пациентов'}
                    </p>
                  </div>

                  <Button
                    variant="default"
                    size="default"
                    iconName="UserPlus"
                    iconPosition="left"
                    onClick={() => navigate('/patient-directory')}
                  >
                    Новое поступление
                  </Button>
                </div>

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
                          onClick={() => handleSort('name')}
                          className="col-span-3 flex items-center gap-2 text-left text-xs font-caption font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth"
                        >
                          Пациент
                          <Icon
                            name={sortConfig?.key === 'name' ? (sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'}
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
                    {paginatedData?.length > 0 ? (
                      paginatedData?.map((patient) => (
                        <PatientGridRow
                          key={patient?.id}
                          patient={patient}
                          isSelected={selectedPatients?.includes(patient?.id)}
                          onSelect={handleSelectPatient}
                          userRole={userRole}
                          onQuickAction={handleQuickAction}
                        />
                      ))
                    ) : loading ? (
                      <div className="p-12 text-center">
                        <p className="text-muted-foreground">Загрузка данных...</p>
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <Icon name="Users" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                        <p className="text-lg font-body text-muted-foreground mb-2">
                          Пациенты не найдены
                        </p>
                        <p className="text-sm caption text-muted-foreground">
                          Попробуйте изменить параметры фильтрации
                        </p>
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
          </div>
        </div>

        <BulkActionsBar
          selectedCount={selectedPatients?.length}
          onBulkAction={handleBulkAction}
          onClearSelection={() => setSelectedPatients([])}
        />
      </div>
    </div>
  );
};

export default InpatientJournal;