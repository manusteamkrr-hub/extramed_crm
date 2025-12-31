import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const MedicalRecordPrintTemplate = ({ patient, medicalHistory, admissionDate, dischargeDate }) => {
  const formatDate = (dateString) => {
    if (!dateString) return format(new Date(), 'dd.MM.yyyy', { locale: ru });
    try {
      return format(new Date(dateString), 'dd.MM.yyyy', { locale: ru });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return format(new Date(), 'dd.MM.yyyy HH:mm', { locale: ru });
    try {
      return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: ru });
    } catch {
      return dateString;
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    } catch {
      return '';
    }
  };

  const medicalRecordNumber = patient?.medical_record_number || patient?.medicalRecordNumber || '___________';
  const fullName = patient?.name || patient?.fullName || '_______________________________________________';
  const gender = patient?.gender === 'male' ? 'Муж.' : patient?.gender === 'female' ? 'Жен.' : '________';
  const age = calculateAge(patient?.date_of_birth || patient?.dateOfBirth) || patient?.age || '________';
  const address = patient?.address || '_________________________________________________________________';
  const todayDate = format(new Date(), 'dd.MM.yyyy', { locale: ru });

  return (
    <div style={{ maxWidth: '210mm', margin: '0 auto', padding: '20px', backgroundColor: 'white', color: 'black', fontFamily: 'serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>ООО "Экстрамед"</div>
        <div style={{ fontSize: '12px' }}>Медицинская карта № {medicalRecordNumber}</div>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '10px' }}>ЛИСТОК НАЗНАЧЕНИЙ / МЕДИЦИНСКАЯ КАРТА</div>
        <div style={{ fontSize: '12px', marginTop: '5px' }}>Дата формирования: {todayDate}</div>
      </div>

      <div style={{ marginBottom: '20px', border: '1px solid black', padding: '10px' }}>
        <div style={{ marginBottom: '5px' }}><strong>Пациент:</strong> {fullName}</div>
        <div style={{ marginBottom: '5px' }}><strong>Пол:</strong> {gender} &nbsp;&nbsp; <strong>Возраст:</strong> {age}</div>
        <div style={{ marginBottom: '5px' }}><strong>Дата рождения:</strong> {formatDate(patient?.date_of_birth || patient?.dateOfBirth)}</div>
        <div style={{ marginBottom: '5px' }}><strong>Адрес:</strong> {address}</div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid black', padding: '5px' }}>Дата</th>
              <th style={{ border: '1px solid black', padding: '5px' }}>Назначение / Услуга</th>
              <th style={{ border: '1px solid black', padding: '5px' }}>Врач</th>
              <th style={{ border: '1px solid black', padding: '5px' }}>Подпись</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid black', padding: '15px', textAlign: 'center' }}>{todayDate}</td>
              <td style={{ border: '1px solid black', padding: '15px' }}>Первичный осмотр и консультация</td>
              <td style={{ border: '1px solid black', padding: '15px' }}></td>
              <td style={{ border: '1px solid black', padding: '15px' }}></td>
            </tr>
            {[1,2,3,4,5].map(i => (
              <tr key={i}>
                <td style={{ border: '1px solid black', padding: '15px' }}></td>
                <td style={{ border: '1px solid black', padding: '15px' }}></td>
                <td style={{ border: '1px solid black', padding: '15px' }}></td>
                <td style={{ border: '1px solid black', padding: '15px' }}></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '40px', textAlign: 'right' }}>
        <div>Врач: _________________________</div>
        <div style={{ fontSize: '10px', marginRight: '40px' }}>(подпись)</div>
      </div>
    </div>
  );
};

export default MedicalRecordPrintTemplate;
