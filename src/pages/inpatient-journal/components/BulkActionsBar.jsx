import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

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

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:left-60 bg-card border-t-2 border-primary elevation-xl z-40 transition-smooth">
      <div className="p-3 md:p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 md:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="CheckSquare" size={24} color="var(--color-primary)" />
            </div>
            <div>
              <p className="font-body font-semibold text-foreground text-sm md:text-base">
                Выбрано пациентов: {selectedCount}
              </p>
              <p className="text-xs md:text-sm caption text-muted-foreground">
                Доступны групповые операции
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <Button
              variant="outline"
              size="sm"
              iconName="ArrowRightLeft"
              iconPosition="left"
              onClick={() => setShowRoomTransfer(!showRoomTransfer)}
            >
              Перевести в палату
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

            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              onClick={onClearSelection}
            >
              Отменить
            </Button>
          </div>
        </div>

        {showRoomTransfer && (
          <div className="mt-4 p-3 md:p-4 bg-muted/50 rounded-lg">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-3">
              <div className="flex-1 w-full">
                <Select
                  label="Выберите палату для перевода"
                  options={roomOptions}
                  value={targetRoom}
                  onChange={setTargetRoom}
                  placeholder="Выберите палату"
                  searchable
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant="default"
                  size="sm"
                  iconName="Check"
                  iconPosition="left"
                  onClick={handleRoomTransfer}
                  disabled={!targetRoom}
                  className="flex-1 md:flex-initial"
                >
                  Перевести
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowRoomTransfer(false);
                    setTargetRoom('');
                  }}
                >
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        )}

        {showPhysicianReassign && (
          <div className="mt-4 p-3 md:p-4 bg-muted/50 rounded-lg">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-3">
              <div className="flex-1 w-full">
                <Select
                  label="Выберите нового лечащего врача"
                  options={physicianOptions}
                  value={targetPhysician}
                  onChange={setTargetPhysician}
                  placeholder="Выберите врача"
                  searchable
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant="default"
                  size="sm"
                  iconName="Check"
                  iconPosition="left"
                  onClick={handlePhysicianReassign}
                  disabled={!targetPhysician}
                  className="flex-1 md:flex-initial"
                >
                  Назначить
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowPhysicianReassign(false);
                    setTargetPhysician('');
                  }}
                >
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkActionsBar;