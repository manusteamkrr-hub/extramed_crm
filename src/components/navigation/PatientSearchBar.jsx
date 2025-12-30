import React, { useState, useEffect, useRef } from 'react';
import Icon from '../AppIcon';
import Input from '../ui/Input';
import patientService from '../../services/patientService';

const PatientSearchBar = ({ onPatientSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef?.current && !searchRef?.current?.contains(event?.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery?.length >= 2) {
      setIsSearching(true);
      const timer = setTimeout(async () => {
        const result = await patientService.getPatients();
        if (result.success) {
          const query = searchQuery.toLowerCase();
          const filtered = result.data.filter(
            (patient) =>
              patient.name?.toLowerCase().includes(query) ||
              patient.medical_record_number?.toLowerCase().includes(query) ||
              patient.diagnosis?.toLowerCase().includes(query)
          );
          setSearchResults(filtered);
        }
        setIsSearching(false);
        setShowResults(true);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e?.target?.value);
  };

  const handlePatientClick = (patient) => {
    setSearchQuery('');
    setShowResults(false);
    if (onPatientSelect) {
      onPatientSelect({
        id: patient.id,
        name: patient.name,
        medicalRecordNumber: patient.medical_record_number,
        dateOfBirth: patient.date_of_birth,
        diagnosis: patient.diagnosis
      });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon name="Search" size={20} color="var(--color-muted-foreground)" />
        </div>
        <Input
          type="search"
          placeholder="Поиск пациента по имени, номеру карты или диагнозу..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
            aria-label="Clear search"
          >
            <Icon name="X" size={20} />
          </button>
        )}
      </div>
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg elevation-lg overflow-hidden z-50">
          {isSearching ? (
            <div className="p-4 text-center text-muted-foreground">
              <Icon name="Loader2" size={24} className="animate-spin mx-auto mb-2" />
              <p className="text-sm">Поиск...</p>
            </div>
          ) : searchResults?.length > 0 ? (
            <ul className="max-h-96 overflow-y-auto">
              {searchResults?.map((patient) => (
                <li key={patient?.id}>
                  <button
                    onClick={() => handlePatientClick(patient)}
                    className="w-full text-left px-4 py-3 hover:bg-muted transition-smooth border-b border-border last:border-b-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-medium text-foreground truncate">
                          {patient?.name}
                        </p>
                        <p className="text-sm caption text-muted-foreground mt-1">
                          {patient?.medical_record_number} • {patient?.date_of_birth}
                        </p>
                        <p className="text-sm caption text-muted-foreground mt-1 truncate">
                          {patient?.diagnosis}
                        </p>
                      </div>
                      <Icon name="ChevronRight" size={20} color="var(--color-muted-foreground)" className="flex-shrink-0 mt-1" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <Icon name="SearchX" size={24} className="mx-auto mb-2" />
              <p className="text-sm">Пациенты не найдены</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientSearchBar;
