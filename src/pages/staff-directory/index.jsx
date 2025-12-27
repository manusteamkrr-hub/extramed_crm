import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/navigation/Layout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { pageVariants, pageTransition } from '../../config/animations';
import StaffCard from './components/StaffCard';
import StaffDetailModal from './components/StaffDetailModal';
import AddStaffModal from './components/AddStaffModal';
import realtimeSyncService from '../../services/realtimeSync';

const StaffDirectory = () => {
  const [currentRole, setCurrentRole] = useState('admin');
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    specialty: '',
    status: '',
    availability: ''
  });
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ NEW: Set up real-time sync listeners
  useEffect(() => {
    console.log('🔄 Setting up real-time sync listeners for staff directory');
    
    // Subscribe to staff changes
    const unsubscribeStaff = realtimeSyncService?.subscribe('staff', (event) => {
      console.log('📡 Staff sync event:', event);
      loadStaffData(); // Fixed: changed from loadStaff() to loadStaffData()
    });

    // Subscribe to staff directory specific events
    const unsubscribeDirectory = realtimeSyncService?.subscribe('staff_directory', (event) => {
      console.log('📡 Staff directory sync event:', event);
      loadStaffData(); // Fixed: changed from loadStaff() to loadStaffData()
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeStaff();
      unsubscribeDirectory();
    };
  }, []);

  // Load staff data
  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = () => {
    try {
      const staffData = JSON.parse(localStorage.getItem('extramed_staff') || '[]');
      setStaff(staffData);
      setFilteredStaff(staffData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading staff data:', error);
      setLoading(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let result = [...staff];

    // Search filter
    if (searchQuery) {
      const query = searchQuery?.toLowerCase();
      result = result?.filter(s => {
        const fullName = `${s?.firstName} ${s?.middleName || ''} ${s?.lastName}`?.toLowerCase();
        const specialty = (s?.specialty || '')?.toLowerCase();
        return fullName?.includes(query) || specialty?.includes(query);
      });
    }

    // Department filter
    if (filters?.department) {
      result = result?.filter(s => s?.department === filters?.department);
    }

    // Specialty filter
    if (filters?.specialty) {
      result = result?.filter(s => s?.specialty === filters?.specialty);
    }

    // Status filter
    if (filters?.status) {
      result = result?.filter(s => s?.status === filters?.status);
    }

    // Availability filter
    if (filters?.availability) {
      result = result?.filter(s => s?.availability === filters?.availability);
    }

    setFilteredStaff(result);
  }, [searchQuery, filters, staff]);

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
  };

  const handleStaffClick = (staffMember) => {
    setSelectedStaff(staffMember);
    setIsDetailModalOpen(true);
  };

  const handleAddStaff = (staffData) => {
    const newStaff = {
      id: `STAFF-${Date.now()}`,
      ...staffData,
      createdAt: new Date()?.toISOString(),
      updatedAt: new Date()?.toISOString()
    };

    const updatedStaff = [...staff, newStaff];
    localStorage.setItem('extramed_staff', JSON.stringify(updatedStaff));
    setStaff(updatedStaff);
    setIsAddModalOpen(false);
  };

  const handleUpdateStaff = (updatedData) => {
    const updatedStaff = staff?.map(s => 
      s?.id === updatedData?.id 
        ? { ...s, ...updatedData, updatedAt: new Date()?.toISOString() }
        : s
    );
    localStorage.setItem('extramed_staff', JSON.stringify(updatedStaff));
    setStaff(updatedStaff);
    setIsDetailModalOpen(false);
  };

  const handleDeleteStaff = (staffId) => {
    if (confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      const updatedStaff = staff?.filter(s => s?.id !== staffId);
      localStorage.setItem('extramed_staff', JSON.stringify(updatedStaff));
      setStaff(updatedStaff);
      setIsDetailModalOpen(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      department: '',
      specialty: '',
      status: '',
      availability: ''
    });
  };

  // Get unique values for filters
  const departments = [...new Set(staff?.map(s => s?.department)?.filter(Boolean))];
  const specialties = [...new Set(staff?.map(s => s?.specialty)?.filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50">
      <Layout userRole={currentRole} onRoleChange={handleRoleChange}>
        <motion.div
          className="p-4 md:p-6 lg:p-8"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={pageTransition}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                  Справочник персонала
                </h1>
                <p className="text-muted-foreground mt-1">
                  Управление медицинским персоналом и врачами
                </p>
              </div>
              {currentRole === 'admin' && (
                <Button
                  variant="default"
                  iconName="Plus"
                  iconPosition="left"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Добавить сотрудника
                </Button>
              )}
            </div>

            {/* Search and Filters */}
            <div className="bg-card border border-border rounded-lg p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Поиск по ФИО, специальности..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e?.target?.value)}
                    iconName="Search"
                  />
                </div>
                <Select
                  placeholder="Отделение"
                  value={filters?.department}
                  onChange={(e) => handleFilterChange('department', e?.target?.value)}
                  options={[
                    { value: '', label: 'Все отделения' },
                    ...departments?.map(d => ({ value: d, label: d }))
                  ]}
                />
                <Select
                  placeholder="Специальность"
                  value={filters?.specialty}
                  onChange={(e) => handleFilterChange('specialty', e?.target?.value)}
                  options={[
                    { value: '', label: 'Все специальности' },
                    ...specialties?.map(s => ({ value: s, label: s }))
                  ]}
                />
                <Select
                  placeholder="Статус"
                  value={filters?.status}
                  onChange={(e) => handleFilterChange('status', e?.target?.value)}
                  options={[
                    { value: '', label: 'Все статусы' },
                    { value: 'active', label: 'Активный' },
                    { value: 'vacation', label: 'В отпуске' },
                    { value: 'inactive', label: 'Неактивный' }
                  ]}
                />
                <Select
                  placeholder="Доступность"
                  value={filters?.availability}
                  onChange={(e) => handleFilterChange('availability', e?.target?.value)}
                  options={[
                    { value: '', label: 'Вся доступность' },
                    { value: 'available', label: 'Доступен' },
                    { value: 'busy', label: 'Занят' },
                    { value: 'off', label: 'Не работает' }
                  ]}
                />
                <div className="md:col-span-2">
                  <Button
                    variant="outline"
                    iconName="X"
                    iconPosition="left"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Очистить фильтры
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Всего врачей</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {staff?.filter(s => s?.role === 'doctor')?.length}
                    </p>
                  </div>
                  <Icon name="Users" size={32} color="var(--color-primary)" />
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Активных</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {staff?.filter(s => s?.status === 'active')?.length}
                    </p>
                  </div>
                  <Icon name="UserCheck" size={32} color="var(--color-success)" />
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Доступно</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {staff?.filter(s => s?.availability === 'available')?.length}
                    </p>
                  </div>
                  <Icon name="Clock" size={32} color="var(--color-info)" />
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Пациентов</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {staff?.reduce((sum, s) => sum + (s?.patientLoad || 0), 0)}
                    </p>
                  </div>
                  <Icon name="Activity" size={32} color="var(--color-warning)" />
                </div>
              </div>
            </div>

            {/* Staff Grid */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Загрузка данных...</p>
              </div>
            ) : filteredStaff?.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <Icon name="Users" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                <p className="text-muted-foreground">Сотрудники не найдены</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStaff?.map((staffMember) => (
                  <StaffCard
                    key={staffMember?.id}
                    staff={staffMember}
                    onClick={() => handleStaffClick(staffMember)}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
        {/* Modals */}
        {isDetailModalOpen && selectedStaff && (
          <StaffDetailModal
            staff={selectedStaff}
            onClose={() => setIsDetailModalOpen(false)}
            onUpdate={handleUpdateStaff}
            onDelete={handleDeleteStaff}
            userRole={currentRole}
          />
        )}
        {isAddModalOpen && (
          <AddStaffModal
            onClose={() => setIsAddModalOpen(false)}
            onSave={handleAddStaff}
          />
        )}
      </Layout>
    </div>
  );
};

export default StaffDirectory;