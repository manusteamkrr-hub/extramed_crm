import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AddStaffModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    role: 'doctor',
    specialty: '',
    department: '',
    phone: '',
    email: '',
    experience: '',
    licenseNumber: '',
    education: '',
    status: 'active',
    availability: 'available',
    patientLoad: 0,
    photo: "https://img.rocket.new/generatedImages/rocket_gen_img_10c48cdd0-1763299750352.png"
  });

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData?.firstName || !formData?.lastName || !formData?.specialty) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-xl font-heading font-bold text-foreground">
            Добавить сотрудника
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-3">
              Основная информация
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Фамилия *"
                name="lastName"
                value={formData?.lastName}
                onChange={handleChange}
                required
              />
              <Input
                label="Имя *"
                name="firstName"
                value={formData?.firstName}
                onChange={handleChange}
                required
              />
              <Input
                label="Отчество"
                name="middleName"
                value={formData?.middleName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-foreground mb-3">
              Профессиональная информация
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Роль *"
                name="role"
                value={formData?.role}
                onChange={handleChange}
                options={[
                  { value: 'doctor', label: 'Врач' },
                  { value: 'nurse', label: 'Медсестра' },
                  { value: 'admin', label: 'Администратор' }
                ]}
              />
              <Input
                label="Специальность *"
                name="specialty"
                value={formData?.specialty}
                onChange={handleChange}
                required
              />
              <Input
                label="Отделение"
                name="department"
                value={formData?.department}
                onChange={handleChange}
              />
              <Input
                label="Стаж (лет)"
                name="experience"
                type="number"
                value={formData?.experience}
                onChange={handleChange}
              />
              <Input
                label="Номер лицензии"
                name="licenseNumber"
                value={formData?.licenseNumber}
                onChange={handleChange}
              />
              <Input
                label="Образование"
                name="education"
                value={formData?.education}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-foreground mb-3">
              Контактная информация
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Телефон"
                name="phone"
                type="tel"
                value={formData?.phone}
                onChange={handleChange}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData?.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-foreground mb-3">
              Статус
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Статус"
                name="status"
                value={formData?.status}
                onChange={handleChange}
                options={[
                  { value: 'active', label: 'Активный' },
                  { value: 'vacation', label: 'В отпуске' },
                  { value: 'inactive', label: 'Неактивный' }
                ]}
              />
              <Select
                label="Доступность"
                name="availability"
                value={formData?.availability}
                onChange={handleChange}
                options={[
                  { value: 'available', label: 'Доступен' },
                  { value: 'busy', label: 'Занят' },
                  { value: 'off', label: 'Не работает' }
                ]}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="default"
              iconName="Plus"
              iconPosition="left"
            >
              Добавить
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;