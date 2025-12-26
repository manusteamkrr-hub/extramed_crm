import React, { useState } from 'react';
import { X, User, Phone, AlertCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import patientService from '../../../services/patientService';

export default function PatientRegistrationModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    region: '',
    postalCode: '',
    passportSeries: '',
    passportNumber: '',
    passportIssuedBy: '',
    passportIssueDate: '',
    snils: '',
    insurancePolicy: '',
    insuranceCompany: '',
    bloodType: '',
    allergies: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData?.lastName?.trim()) newErrors.lastName = 'Фамилия обязательна';
    if (!formData?.firstName?.trim()) newErrors.firstName = 'Имя обязательно';
    if (!formData?.dateOfBirth) newErrors.dateOfBirth = 'Дата рождения обязательна';
    if (!formData?.gender) newErrors.gender = 'Пол обязателен';
    if (!formData?.phone?.trim()) newErrors.phone = 'Телефон обязателен';

    // Phone validation
    if (formData?.phone && !/^\+?[0-9]{10,15}$/?.test(formData?.phone?.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Некорректный формат телефона';
    }

    // Email validation
    if (formData?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    // Date of birth validation (should be in the past)
    if (formData?.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      if (dob > today) {
        newErrors.dateOfBirth = 'Дата рождения не может быть в будущем';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await patientService?.createPatient(formData);

      if (result?.success) {
        // ✅ ADD: Trigger dashboard refresh event
        window.dispatchEvent(new CustomEvent('dashboardRefresh'));
        
        alert('Пациент успешно зарегистрирован!');
        onClose();
        onSuccess?.();
      } else {
        alert(`Ошибка при регистрации пациента: ${result?.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      alert('Произошла ошибка при регистрации пациента');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Регистрация нового пациента</h2>
              <p className="text-sm text-gray-500">Заполните все обязательные поля</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="patient-registration-form" onSubmit={handleSubmit}>
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Ошибка</p>
                  <p className="text-sm text-red-700 mt-1">{submitError}</p>
                </div>
              </div>
            )}

            {/* Personal Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Персональные данные</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Фамилия <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData?.lastName}
                    onChange={handleChange}
                    placeholder="Иванов"
                    error={errors?.lastName}
                  />
                  {errors?.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors?.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Имя <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData?.firstName}
                    onChange={handleChange}
                    placeholder="Иван"
                    error={errors?.firstName}
                  />
                  {errors?.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors?.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Отчество
                  </label>
                  <Input
                    type="text"
                    name="middleName"
                    value={formData?.middleName}
                    onChange={handleChange}
                    placeholder="Иванович"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата рождения <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={formData?.dateOfBirth}
                    onChange={handleChange}
                    error={errors?.dateOfBirth}
                    max={new Date()?.toISOString()?.split('T')?.[0]}
                  />
                  {errors?.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-600">{errors?.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Пол <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData?.gender}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors?.gender ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Выберите пол</option>
                    <option value="male">Мужской</option>
                    <option value="female">Женский</option>
                  </select>
                  {errors?.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors?.gender}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Группа крови
                  </label>
                  <select
                    name="bloodType"
                    value={formData?.bloodType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Не указана</option>
                    <option value="O+">O(I) Rh+</option>
                    <option value="O-">O(I) Rh-</option>
                    <option value="A+">A(II) Rh+</option>
                    <option value="A-">A(II) Rh-</option>
                    <option value="B+">B(III) Rh+</option>
                    <option value="B-">B(III) Rh-</option>
                    <option value="AB+">AB(IV) Rh+</option>
                    <option value="AB-">AB(IV) Rh-</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Контактная информация</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData?.phone}
                    onChange={handleChange}
                    placeholder="+7 (999) 123-45-67"
                    error={errors?.phone}
                  />
                  {errors?.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors?.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData?.email}
                    onChange={handleChange}
                    placeholder="patient@example.com"
                    error={errors?.email}
                  />
                  {errors?.email && (
                    <p className="mt-1 text-sm text-red-600">{errors?.email}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Адрес
                  </label>
                  <Input
                    type="text"
                    name="address"
                    value={formData?.address}
                    onChange={handleChange}
                    placeholder="Улица, дом, квартира"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Город
                  </label>
                  <Input
                    type="text"
                    name="city"
                    value={formData?.city}
                    onChange={handleChange}
                    placeholder="Москва"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Регион/Область
                  </label>
                  <Input
                    type="text"
                    name="region"
                    value={formData?.region}
                    onChange={handleChange}
                    placeholder="Московская область"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Почтовый индекс
                  </label>
                  <Input
                    type="text"
                    name="postalCode"
                    value={formData?.postalCode}
                    onChange={handleChange}
                    placeholder="123456"
                  />
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Документы</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Серия паспорта
                  </label>
                  <Input
                    type="text"
                    name="passportSeries"
                    value={formData?.passportSeries}
                    onChange={handleChange}
                    placeholder="1234"
                    maxLength="4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Номер паспорта
                  </label>
                  <Input
                    type="text"
                    name="passportNumber"
                    value={formData?.passportNumber}
                    onChange={handleChange}
                    placeholder="567890"
                    maxLength="6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Кем выдан
                  </label>
                  <Input
                    type="text"
                    name="passportIssuedBy"
                    value={formData?.passportIssuedBy}
                    onChange={handleChange}
                    placeholder="Отделением УФМС"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата выдачи
                  </label>
                  <Input
                    type="date"
                    name="passportIssueDate"
                    value={formData?.passportIssueDate}
                    onChange={handleChange}
                    max={new Date()?.toISOString()?.split('T')?.[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    СНИЛС
                  </label>
                  <Input
                    type="text"
                    name="snils"
                    value={formData?.snils}
                    onChange={handleChange}
                    placeholder="123-456-789 01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Полис ОМС
                  </label>
                  <Input
                    type="text"
                    name="insurancePolicy"
                    value={formData?.insurancePolicy}
                    onChange={handleChange}
                    placeholder="1234567890123456"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Страховая компания
                  </label>
                  <Input
                    type="text"
                    name="insuranceCompany"
                    value={formData?.insuranceCompany}
                    onChange={handleChange}
                    placeholder="Название страховой компании"
                  />
                </div>
              </div>
            </div>

            {/* Medical Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Медицинская информация</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Аллергии
                </label>
                <textarea
                  name="allergies"
                  value={formData?.allergies}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Укажите известные аллергии (на лекарства, продукты и т.д.)"
                />
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Контактное лицо для экстренных случаев</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ФИО контактного лица
                  </label>
                  <Input
                    type="text"
                    name="emergencyContactName"
                    value={formData?.emergencyContactName}
                    onChange={handleChange}
                    placeholder="Иванова Мария Петровна"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон
                  </label>
                  <Input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData?.emergencyContactPhone}
                    onChange={handleChange}
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Степень родства
                  </label>
                  <Input
                    type="text"
                    name="emergencyContactRelation"
                    value={formData?.emergencyContactRelation}
                    onChange={handleChange}
                    placeholder="Супруг(а), родитель и т.д."
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            form="patient-registration-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить пациента'}
          </Button>
        </div>
      </div>
    </div>
  );
}