import React, { useState } from 'react';

import Button from '../../../components/ui/Button';


const BulkActionsBar = ({ selectedCount, onBulkAction, onClearSelection }) => {
  const [showRoomTransfer, setShowRoomTransfer] = useState(false);
  const [showPhysicianReassign, setShowPhysicianReassign] = useState(false);
  const [targetRoom, setTargetRoom] = useState('');
  const [targetPhysician, setTargetPhysician] = useState('');

  const roomOptions = [
    { value: '101', label: 'Палата 101 (Эконом)' },
    { value: '102', label: 'Палата 102 (Эконом)' },
    { value: '201', label: 'Палата 201 (Стандарт)' },
    { value: '202', label: 'Палата 202 (Стандарт)' },
    { value: '301', label: 'Палата 301 (Комфорт)' },
    { value: '401', label: 'Палата 401 (VIP)' }
  ];

  const physicianOptions = [
    { value: 'ivanov', label: 'Иванов И.И.' },
    { value: 'petrova', label: 'Петрова М.С.' },
    { value: 'sidorov', label: 'Сидоров П.А.' },
    { value: 'kuznetsova', label: 'Кузнецова Е.В.' }
  ];

  const handleRoomTransfer = () => {
    if (targetRoom) {
      onBulkAction('transfer', { room: targetRoom });
      setShowRoomTransfer(false);
      setTargetRoom('');
    }
  };

  const handlePhysicianReassign = () => {
    if (targetPhysician) {
      onBulkAction('reassign', { physician: targetPhysician });
      setShowPhysicianReassign(false);
      setTargetPhysician('');
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-card border-t border-border elevation-lg transition-transform duration-300 ${selectedCount > 0 ? 'translate-y-0' : 'translate-y-full'} z-40`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium text-sm">
              {selectedCount} выбрано
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              iconName="X"
              iconPosition="left"
            >
              Очистить
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              iconName="DoorOpen"
              iconPosition="left"
              onClick={() => onBulkAction('assign-room')}
            >
              Назначить палату
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              iconName="ArrowRightLeft"
              iconPosition="left"
              onClick={() => onBulkAction('transfer')}
            >
              Перевести
            </Button>

            <Button
              variant="outline"
              size="sm"
              iconName="FileText"
              iconPosition="left"
              onClick={() => onBulkAction('generate-report')}
            >
              Отчет
            </Button>

            <Button
              variant="outline"
              size="sm"
              iconName="UserCog"
              iconPosition="left"
              onClick={() => setShowPhysicianReassign(!showPhysicianReassign)}
            >
              Сменить врача
            </Button>

            <Button
              variant="outline"
              size="sm"
              iconName="LogOut"
              iconPosition="left"
              onClick={() => onBulkAction('discharge')}
            >
              Выписать
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;