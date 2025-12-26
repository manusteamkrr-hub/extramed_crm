import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const DemographicsTab = ({ patient, onSave, onPhotoUpdate, isEditingFromHeader = false, onEditComplete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPhotoEditing, setIsPhotoEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: patient?.fullName,
    dateOfBirth: patient?.dateOfBirth,
    gender: patient?.gender,
    phone: patient?.phone,
    email: patient?.email,
    address: patient?.address,
    emergencyContact: patient?.emergencyContact,
    emergencyPhone: patient?.emergencyPhone,
    passportSeries: patient?.passportSeries,
    passportNumber: patient?.passportNumber,
    insuranceCompany: patient?.insuranceCompany,
    insurancePolicy: patient?.insurancePolicy,
  });
  const [photoPreview, setPhotoPreview] = useState(patient?.photo);

  // Handle external edit activation from header button
  useEffect(() => {
    if (isEditingFromHeader) {
      setIsEditing(true);
    }
  }, [isEditingFromHeader]);

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader?.result);
        if (onPhotoUpdate) {
          onPhotoUpdate(reader?.result);
        }
      };
      reader?.readAsDataURL(file);
    }
  };

  const handlePhotoRemove = () => {
    const defaultPhoto = "https://img.rocket.new/generatedImages/rocket_gen_img_10c48cdd0-1763299750352.png";
    setPhotoPreview(defaultPhoto);
    if (onPhotoUpdate) {
      onPhotoUpdate(defaultPhoto);
    }
    if (fileInputRef?.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
    if (onEditComplete) {
      onEditComplete();
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: patient?.fullName,
      dateOfBirth: patient?.dateOfBirth,
      gender: patient?.gender,
      phone: patient?.phone,
      email: patient?.email,
      address: patient?.address,
      emergencyContact: patient?.emergencyContact,
      emergencyPhone: patient?.emergencyPhone,
      passportSeries: patient?.passportSeries,
      passportNumber: patient?.passportNumber,
      insuranceCompany: patient?.insuranceCompany,
      insurancePolicy: patient?.insurancePolicy,
    });
    setIsEditing(false);
    if (onEditComplete) {
      onEditComplete();
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground">
          Демографические данные
        </h2>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            iconName="Edit"
            iconPosition="left"
            onClick={() => setIsEditing(true)}
          >
            Редактировать
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              Отмена
            </Button>
            <Button
              variant="default"
              size="sm"
              iconName="Save"
              iconPosition="left"
              onClick={handleSave}
            >
              Сохранить
            </Button>
          </div>
        )}
      </div>
      <div className="bg-card border border-border rounded-lg p-4 md:p-6">
        <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-3 md:mb-4">
          Фото пациента
        </h3>
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden border-2 border-border">
              <Image
                src={photoPreview}
                alt={patient?.photoAlt || 'Patient photo'}
                className="w-full h-full object-cover"
              />
            </div>
            {isPhotoEditing && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <Icon name="Camera" size={32} color="white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-3">
            <p className="text-sm caption text-muted-foreground">
              Загрузите фотографию пациента в формате JPG, PNG или GIF. Максимальный размер файла: 5 МБ
            </p>
            
            <div className="flex flex-wrap gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/gif"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                iconName="Upload"
                iconPosition="left"
                onClick={() => fileInputRef?.current?.click()}
              >
                Загрузить фото
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="Trash2"
                iconPosition="left"
                onClick={handlePhotoRemove}
              >
                Удалить фото
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg p-4 md:p-6">
        <div className="space-y-4 md:space-y-6">
          <div>
            <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-3 md:mb-4">
              Основная информация
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="ФИО"
                name="fullName"
                value={formData?.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
              <Input
                label="Дата рождения"
                name="dateOfBirth"
                type="date"
                value={formData?.dateOfBirth}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
              <Input
                label="Пол"
                name="gender"
                value={formData?.gender}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
              <Input
                label="Телефон"
                name="phone"
                type="tel"
                value={formData?.phone}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData?.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <Input
                label="Адрес"
                name="address"
                value={formData?.address}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="border-t border-border pt-4 md:pt-6">
            <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-3 md:mb-4">
              Экстренный контакт
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Контактное лицо"
                name="emergencyContact"
                value={formData?.emergencyContact}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <Input
                label="Телефон контакта"
                name="emergencyPhone"
                type="tel"
                value={formData?.emergencyPhone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="border-t border-border pt-4 md:pt-6">
            <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-3 md:mb-4">
              Документы
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Серия паспорта"
                name="passportSeries"
                value={formData?.passportSeries}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <Input
                label="Номер паспорта"
                name="passportNumber"
                value={formData?.passportNumber}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <Input
                label="Страховая компания"
                name="insuranceCompany"
                value={formData?.insuranceCompany}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <Input
                label="Номер полиса"
                name="insurancePolicy"
                value={formData?.insurancePolicy}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemographicsTab;