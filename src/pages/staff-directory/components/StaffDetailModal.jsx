import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const StaffDetailModal = ({ staff, onClose, onUpdate, onDelete, userRole }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...staff });

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const fullName = `${formData?.lastName || ''} ${formData?.firstName || ''} ${formData?.middleName || ''}`?.trim();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-xl font-heading font-bold text-foreground">
            Карточка сотрудника
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Photo and Basic Info */}
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-border flex-shrink-0">
              <Image
                src={formData?.photo || "https://img.rocket.new/generatedImages/rocket_gen_img_10c48cdd0-1763299750352.png"}
                alt={`${fullName} photo`}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Фамилия"
                    name="lastName"
                    value={formData?.lastName}
                    onChange={handleChange}
                  />
                  <Input
                    label="Имя"
                    name="firstName"
                    value={formData?.firstName}
                    onChange={handleChange}
                  />
                  <Input
                    label="Отчество"
                    name="middleName"
                    value={formData?.middleName}
                    onChange={handleChange}
                  />
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-heading font-bold text-foreground">
                    {fullName}
                  </h3>
                  <p className="text-lg text-muted-foreground mt-1">
                    {formData?.specialty || 'Специальность не указана'}
                  </p>
                  <p className="text-muted-foreground mt-1">
                    {formData?.department || 'Отделение не указано'}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-heading font-semibold text-foreground mb-3">
              Контактная информация
            </h4>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Телефон"
                  name="phone"
                  value={formData?.phone}
                  onChange={handleChange}
                />
                <Input
                  label="Email"
                  name="email"
                  value={formData?.email}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon name="Phone" size={16} color="var(--color-muted-foreground)" />
                  <span className="text-foreground">{formData?.phone || 'Не указан'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Mail" size={16} color="var(--color-muted-foreground)" />
                  <span className="text-foreground">{formData?.email || 'Не указан'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Professional Information */}
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-heading font-semibold text-foreground mb-3">
              Профессиональная информация
            </h4>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Специальность"
                  name="specialty"
                  value={formData?.specialty}
                  onChange={handleChange}
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
                  label="Лицензия"
                  name="licenseNumber"
                  value={formData?.licenseNumber}
                  onChange={handleChange}
                />
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
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Специальность</p>
                  <p className="text-foreground">{formData?.specialty || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Отделение</p>
                  <p className="text-foreground">{formData?.department || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Стаж (лет)</p>
                  <p className="text-foreground">{formData?.experience || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Лицензия</p>
                  <p className="text-foreground">{formData?.licenseNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Пациентов</p>
                  <p className="text-foreground">{formData?.patientLoad || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Образование</p>
                  <p className="text-foreground">{formData?.education || '-'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            {userRole === 'admin' && (
              <>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFormData({ ...staff });
                        setIsEditing(false);
                      }}
                    >
                      Отмена
                    </Button>
                    <Button
                      variant="default"
                      iconName="Save"
                      iconPosition="left"
                      onClick={handleSave}
                    >
                      Сохранить
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    iconName="Edit"
                    iconPosition="left"
                    onClick={() => setIsEditing(true)}
                  >
                    Редактировать
                  </Button>
                )}
                <Button
                  variant="destructive"
                  iconName="Trash2"
                  iconPosition="left"
                  onClick={() => onDelete(staff?.id)}
                >
                  Удалить
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailModal;