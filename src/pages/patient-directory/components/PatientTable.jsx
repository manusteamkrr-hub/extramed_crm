import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

import { Checkbox } from '../../../components/ui/Checkbox';

const PatientTable = ({ patients, onBulkAction, selectedPatients, onSelectionChange }) => {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectAll = (e) => {
    if (e?.target?.checked) {
      onSelectionChange(patients?.map((p) => p?.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectPatient = (patientId) => {
    if (selectedPatients?.includes(patientId)) {
      onSelectionChange(selectedPatients?.filter((id) => id !== patientId));
    } else {
      onSelectionChange([...selectedPatients, patientId]);
    }
  };

  const handlePatientClick = (patientId) => {
    navigate(`/patient-profile/${patientId}`, { state: { patientId } });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Активный', color: 'var(--color-success)', bg: 'bg-success/10' },
      discharged: { label: 'Выписан', color: 'var(--color-muted-foreground)', bg: 'bg-muted' },
      outpatient: { label: 'Амбулаторный', color: 'var(--color-primary)', bg: 'bg-primary/10' },
      archived: { label: 'Архив', color: 'var(--color-muted-foreground)', bg: 'bg-muted' },
    };
    const config = statusConfig?.[status] || statusConfig?.active;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-caption font-medium ${config?.bg}`}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config?.color }} />
        {config?.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date?.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

  // Build full name from patient data
  const getPatientFullName = (patient) => {
    const firstName = patient?.firstName || '';
    const middleName = patient?.middleName || '';
    const lastName = patient?.lastName || '';
    return `${lastName} ${firstName} ${middleName}`?.trim() || patient?.name || 'Без имени';
  };

  const sortedPatients = [...patients]?.sort((a, b) => {
    let aValue, bValue;
    
    // Handle special sorting for name field
    if (sortConfig?.key === 'name') {
      aValue = getPatientFullName(a);
      bValue = getPatientFullName(b);
    } else {
      aValue = a?.[sortConfig?.key];
      bValue = b?.[sortConfig?.key];
    }
    
    if (aValue < bValue) return sortConfig?.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig?.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const allSelected = patients?.length > 0 && selectedPatients?.length === patients?.length;
  const someSelected = selectedPatients?.length > 0 && selectedPatients?.length < patients?.length;

  return (
    <div className="bg-card border border-border rounded-lg elevation-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left w-12">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('medicalRecordNumber')}
                  className="flex items-center gap-2 font-heading font-semibold text-foreground text-sm hover:text-primary transition-smooth"
                >
                  Номер карты
                  <Icon
                    name={sortConfig?.key === 'medicalRecordNumber' && sortConfig?.direction === 'desc' ? 'ChevronDown' : 'ChevronUp'}
                    size={16}
                    color="var(--color-muted-foreground)"
                  />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 font-heading font-semibold text-foreground text-sm hover:text-primary transition-smooth"
                >
                  ФИО пациента
                  <Icon
                    name={sortConfig?.key === 'name' && sortConfig?.direction === 'desc' ? 'ChevronDown' : 'ChevronUp'}
                    size={16}
                    color="var(--color-muted-foreground)"
                  />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('dateOfBirth')}
                  className="flex items-center gap-2 font-heading font-semibold text-foreground text-sm hover:text-primary transition-smooth"
                >
                  Дата рождения
                  <Icon
                    name={sortConfig?.key === 'dateOfBirth' && sortConfig?.direction === 'desc' ? 'ChevronDown' : 'ChevronUp'}
                    size={16}
                    color="var(--color-muted-foreground)"
                  />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="font-heading font-semibold text-foreground text-sm">Контакты</span>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('lastVisit')}
                  className="flex items-center gap-2 font-heading font-semibold text-foreground text-sm hover:text-primary transition-smooth"
                >
                  Последний визит
                  <Icon
                    name={sortConfig?.key === 'lastVisit' && sortConfig?.direction === 'desc' ? 'ChevronDown' : 'ChevronUp'}
                    size={16}
                    color="var(--color-muted-foreground)"
                  />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="font-heading font-semibold text-foreground text-sm">Статус</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="font-heading font-semibold text-foreground text-sm">Диагноз</span>
              </th>
              <th className="px-4 py-3 text-center w-32">
                <span className="font-heading font-semibold text-foreground text-sm">Действия</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedPatients?.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                  Нет данных для отображения
                </td>
              </tr>
            ) : (
              sortedPatients?.map((patient) => (
                <tr
                  key={patient?.id}
                  className="hover:bg-muted/30 transition-smooth cursor-pointer"
                  onClick={() => handlePatientClick(patient?.id)}
                >
                  <td className="px-4 py-3" onClick={(e) => e?.stopPropagation()}>
                    <Checkbox
                      checked={selectedPatients?.includes(patient?.id)}
                      onChange={() => handleSelectPatient(patient?.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-body font-medium text-foreground text-sm data-text">
                      {patient?.medicalRecordNumber || patient?.mrn || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon name="User" size={20} color="var(--color-primary)" />
                      </div>
                      <div>
                        <p className="font-body font-medium text-foreground text-sm">
                          {getPatientFullName(patient)}
                        </p>
                        <p className="text-xs caption text-muted-foreground">
                          {patient?.gender === 'male' ? 'М' : patient?.gender === 'female' ? 'Ж' : '-'}, {calculateAge(patient?.dateOfBirth)} лет
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm caption text-foreground">{formatDate(patient?.dateOfBirth)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Icon name="Phone" size={14} color="var(--color-muted-foreground)" />
                        <span className="text-sm caption text-foreground">{patient?.phone || '-'}</span>
                      </div>
                      {patient?.email && (
                        <div className="flex items-center gap-2">
                          <Icon name="Mail" size={14} color="var(--color-muted-foreground)" />
                          <span className="text-sm caption text-muted-foreground truncate max-w-[200px]">
                            {patient?.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm caption text-foreground">
                      {formatDate(patient?.lastVisit || patient?.admissionDate || patient?.createdAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(patient?.status || 'active')}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm caption text-foreground line-clamp-2 max-w-[250px]">
                      {patient?.diagnosis || '-'}
                    </p>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e?.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handlePatientClick(patient?.id)}
                        className="p-2 rounded-lg hover:bg-primary/10 transition-smooth"
                        title="Просмотр профиля"
                      >
                        <Icon name="Eye" size={18} color="var(--color-primary)" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-success/10 transition-smooth"
                        title="Редактировать"
                      >
                        <Icon name="Edit" size={18} color="var(--color-success)" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-warning/10 transition-smooth"
                        title="История"
                      >
                        <Icon name="History" size={18} color="var(--color-warning)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientTable;