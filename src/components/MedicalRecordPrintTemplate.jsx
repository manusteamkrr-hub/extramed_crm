import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const MedicalRecordPrintTemplate = ({ patient, medicalHistory, admissionDate, dischargeDate }) => {
  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd.MM.yyyy', { locale: ru });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
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
      let age = today?.getFullYear() - birth?.getFullYear();
      const monthDiff = today?.getMonth() - birth?.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today?.getDate() < birth?.getDate())) {
        age--;
      }
      return age;
    } catch {
      return '';
    }
  };

  // Extract diagnosis information
  const primaryDiagnosis = medicalHistory?.diagnoses?.find(d => d?.isPrimary) || medicalHistory?.diagnoses?.[0];
  const complications = medicalHistory?.diagnoses?.filter(d => !d?.isPrimary && d?.code !== primaryDiagnosis?.code);
  const concomitantDiagnoses = medicalHistory?.diagnoses?.filter(d => 
    !d?.isPrimary && 
    d?.code !== primaryDiagnosis?.code && 
    !complications?.find(c => c?.code === d?.code)
  );

  // Safe data extraction with fallbacks
  const medicalRecordNumber = patient?.medicalRecordNumber || patient?.id || '___________';
  const fullName = patient?.fullName || '_______________________________________________';
  const gender = patient?.gender || '________';
  let age = calculateAge(patient?.dateOfBirth) || patient?.age || '________';
  const address = patient?.address || '_________________________________________________________________';
  const emergencyInfo = patient?.emergencyContact 
    ? `${patient?.emergencyContact}, тел: ${patient?.emergencyPhone}` 
    : '______________________________________';
  const occupation = patient?.occupation || '_____________________________________';
  
  // Medical history safe extraction
  const allergiesText = medicalHistory?.allergies?.length > 0
    ? medicalHistory?.allergies?.map(a => a?.allergen)?.join(', ')
    : '___________________________';
    
  const allergiesDetail = medicalHistory?.allergies?.length > 0
    ? medicalHistory?.allergies?.map(a => `${a?.allergen}: ${a?.reaction} (${a?.severity})`)?.join('; ')
    : '_________________________________________________________________';
    
  const primaryDiagnosisText = primaryDiagnosis 
    ? `${primaryDiagnosis?.code || ''} ${primaryDiagnosis?.description || ''}`
    : '________________________________________________';
    
  const complicationsText = complications?.length > 0 
    ? complications?.map(c => `${c?.code || ''} ${c?.description || ''}`)?.join('; ')
    : '___________________________________________';
    
  const concomitantText = concomitantDiagnoses?.length > 0 
    ? concomitantDiagnoses?.map(c => `${c?.code || ''} ${c?.description || ''}`)?.join('; ')
    : '___________________________________________';
    
  const medicationsText = medicalHistory?.medications?.length > 0
    ? medicalHistory?.medications?.map(m => `${m?.name} ${m?.dosage}`)?.join('; ')
    : '';

  const specialNotesText = patient?.alerts?.length > 0
    ? patient?.alerts?.join('; ')
    : '____________________________________________________';

  return (
    <div style={{ maxWidth: '210mm', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '3px' }}>ООО "Экстрамед"</div>
        <div style={{ fontSize: '10px', marginBottom: '3px' }}>наименование учреждения</div>
        <div style={{ fontSize: '10px' }}>Код формы по ОКУД _______________</div>
        <div style={{ fontSize: '10px', marginBottom: '10px' }}>Код учреждения по ОКПО __________</div>
        <div style={{ fontWeight: 'bold', marginTop: '10px' }}>Медицинская документация</div>
        <div style={{ fontSize: '11px' }}>Форма N 003/у</div>
        <div style={{ fontSize: '10px', marginBottom: '15px' }}>Утверждена Минздравом СССР 04.10.80 г. N 1030</div>
        <div style={{ fontWeight: 'bold', fontSize: '15px', marginTop: '10px' }}>
          МЕДИЦИНСКАЯ КАРТА № <span className="print-underline">{medicalRecordNumber}</span>
        </div>
        <div style={{ fontWeight: 'bold', fontSize: '13px' }}>стационарного больного</div>
      </div>

      {/* Section 1: Admission Details */}
      <div className="print-section">
        <table className="print-table">
          <tbody>
            <tr>
              <td style={{ width: '50%' }}>
                Дата и время поступления <span className="print-underline">{formatDateTime(admissionDate)}</span>
              </td>
              <td style={{ width: '50%' }}>
                Дата и время выписки <span className="print-underline">{formatDateTime(dischargeDate)}</span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div className="field-row">
          Отделение <span className="print-underline" style={{ width: '250px' }}>__________________________</span> палата № <span className="print-underline" style={{ width: '80px' }}>_______</span>
        </div>
        
        <div className="field-row">
          Переведен в отделение <span className="print-underline" style={{ width: '520px' }}>_______________________________________________</span>
        </div>
        
        <div className="field-row">
          Проведено койко-дней <span className="print-underline" style={{ width: '100px' }}>__________</span>
        </div>
        
        <div className="field-row">
          Виды транспортировки: на каталке, на кресле, может идти (подчеркнуть)
        </div>
        
        <div className="field-row">
          Группа крови <span className="print-underline" style={{ width: '100px' }}>__________</span> Резус-принадлежность <span className="print-underline" style={{ width: '100px' }}>__________</span>
        </div>
        
        <div className="field-row">
          Побочное действие лекарств (непереносимость) <span className="print-underline" style={{ width: '350px' }}>
            {allergiesText}
          </span>
        </div>
        
        <div className="field-row" style={{ paddingLeft: '20px', fontSize: '10px', fontStyle: 'italic' }}>
          название препарата, характер побочного действия
        </div>
        
        <div className="field-row">
          <span className="print-underline" style={{ width: '680px', display: 'inline-block' }}>
            {allergiesDetail}
          </span>
        </div>
      </div>

      {/* Section 2-5: Patient Demographics */}
      <div className="print-section">
        <div className="field-row">
          1. Фамилия, имя, отчество <span className="print-underline" style={{ width: '400px' }}>
            {fullName}
          </span> 2. Пол <span className="print-underline" style={{ width: '80px' }}>
            {gender}
          </span>
        </div>
        
        <div className="field-row">
          3. Возраст <span className="print-underline" style={{ width: '80px' }}>
            {age}
          </span> (полных лет, для детей: до 1 года - месяцев, до 1 месяца – дней)
        </div>
        
        <div className="field-row">
          4. Постоянное место жительства: город, село (подчеркнуть)
        </div>
        
        <div className="field-row">
          <span className="print-underline" style={{ width: '680px', display: 'inline-block' }}>
            {address}
          </span>
        </div>
        
        <div className="field-row" style={{ paddingLeft: '20px', fontSize: '10px', fontStyle: 'italic' }}>
          вписать адрес, указав для приезжих - область, район, нас.пункт
        </div>
        
        <div className="field-row">
          адрес родственников и № телефона <span className="print-underline" style={{ width: '450px' }}>
            {emergencyInfo}
          </span>
        </div>
        
        <div className="field-row">
          5. Место работы, профессия или должность <span className="print-underline" style={{ width: '420px' }}>
            {occupation}
          </span>
        </div>
        
        <div className="field-row" style={{ paddingLeft: '20px', fontSize: '10px', fontStyle: 'italic' }}>
          для учащихся - место учебы; для детей - название детского учреждения, школы
        </div>
        
        <div className="field-row" style={{ paddingLeft: '20px', fontSize: '10px', fontStyle: 'italic' }}>
          для инвалидов - род и группа инвалидности, ИОВ да, нет (подчеркнуть)
        </div>
      </div>

      {/* Section 6-9: Admission Details */}
      <div className="print-section">
        <div className="field-row">
          6. Кем направлен больной <span className="print-underline" style={{ width: '450px' }}>
            самотек____________________________________________
          </span>
        </div>
        
        <div className="field-row" style={{ paddingLeft: '20px', fontSize: '10px', fontStyle: 'italic' }}>
          название лечебного учреждения
        </div>
        
        <div className="field-row">
          7. Доставлен в стационар по экстренным показаниям: да, нет через <span className="print-underline" style={{ width: '80px' }}>
            ________
          </span> часов
        </div>
        
        <div className="field-row" style={{ paddingLeft: '20px' }}>
          после начала заболевания, получения травмы; госпитализирован в плановом порядке (подчеркнуть).
        </div>
        
        <div className="field-row">
          8. Диагноз направившего учреждения <span className="print-underline" style={{ width: '470px' }}>
            _____________________________________________
          </span>
        </div>
        
        <div className="field-row">
          9. Диагноз при поступлении <span className="print-underline" style={{ width: '520px', display: 'inline-block' }}>
            {primaryDiagnosisText}
          </span>
        </div>
      </div>

      {/* Section 10: Clinical Diagnosis */}
      <div className="print-section">
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>10. Диагноз клинический</div>
        
        <table className="print-table">
          <tbody>
            <tr>
              <td style={{ width: '25%' }}>Дата установления</td>
              <td>
                <span className="print-underline" style={{ width: '100%', display: 'inline-block' }}>
                  {formatDate(primaryDiagnosis?.diagnosedDate)}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div style={{ borderBottom: '1px solid #000', minHeight: '50px', padding: '5px 0' }}>
          {primaryDiagnosisText}
        </div>
      </div>

      {/* Section 11: Final Clinical Diagnosis */}
      <div className="print-section">
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>11. Диагноз заключительный клинический</div>
        
        <div className="field-row">
          а) основной: <span className="print-underline" style={{ width: '620px', display: 'inline-block', minHeight: '30px' }}>
            {primaryDiagnosisText}
          </span>
        </div>
        
        <div className="field-row">
          б) осложнение основного: <span className="print-underline" style={{ width: '570px', display: 'inline-block', minHeight: '30px' }}>
            {complicationsText}
          </span>
        </div>
        
        <div className="field-row">
          в) сопутствующий: <span className="print-underline" style={{ width: '590px', display: 'inline-block', minHeight: '30px' }}>
            {concomitantText}
          </span>
        </div>
      </div>

      {/* Section 12: Hospitalization History */}
      <div className="print-section">
        <div className="field-row">
          12. Госпитализирован в данном году по поводу данного заболевания: впервые, повторно (подчеркнуть), всего <span className="print-underline" style={{ width: '60px' }}>
            ______
          </span> раз.
        </div>
      </div>

      {/* Section 13: Surgical Operations */}
      <div className="print-section">
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          13. Хирургические операции, методы обезболивания и послеоперационные осложнения.
        </div>
        
        <table className="operations-table">
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Название операции</th>
              <th style={{ width: '20%' }}>Дата, час</th>
              <th style={{ width: '25%' }}>Метод обезболивания</th>
              <th style={{ width: '25%' }}>Осложнения</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ height: '35px' }}>1.</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td style={{ height: '35px' }}>2.</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td style={{ height: '35px' }}>3.</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
        
        <div style={{ marginTop: '10px' }}>
          Оперировал <span className="print-underline" style={{ width: '400px' }}>
            ___________________________________
          </span>
        </div>
      </div>

      {/* Section 14: Other Treatments */}
      <div className="print-section">
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>14. Другие виды лечения</div>
        <div>Дезинтоксикационная симптоматическая терапия</div>
        
        <div style={{ borderBottom: '1px solid #000', minHeight: '50px', padding: '5px 0' }}>
          {medicationsText}
        </div>
        
        <div style={{ fontSize: '10px', marginTop: '5px', fontStyle: 'italic' }}>указать</div>
      </div>

      {/* Section 15: Sick Leave Certificate */}
      <div className="print-section">
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
          15. Отметка о выдаче листка нетрудоспособности
        </div>
        
        <div className="field-row">
          № <span className="print-underline" style={{ width: '100px' }}>__________</span> с <span className="print-underline" style={{ width: '80px' }}>________</span> по <span className="print-underline" style={{ width: '80px' }}>________</span>
        </div>
      </div>

      {/* Section 16-19: Remaining sections */}
      <div className="print-section">
        <div className="field-row">
          <strong>16. Исход заболевания:</strong> выписан - с выздоровлением, с улучшением, без перемен, с ухудшением
        </div>
      </div>

      <div className="print-section">
        <div className="field-row">
          <strong>17. Трудоспособность</strong> восстановлена полностью, снижена, временно утрачена (подчеркнуть)
        </div>
      </div>

      <div className="print-section">
        <div className="field-row">
          19. Особые отметки <span className="print-underline" style={{ width: '590px', display: 'inline-block', minHeight: '40px' }}>
            {specialNotesText}
          </span>
        </div>
      </div>

      {/* Signatures */}
      <div className="signature-section">
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '5px' }}>Лечащий врач</div>
          <div style={{ borderBottom: '1px solid #000', width: '250px', height: '40px' }}></div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '5px' }}>Зав. отделением</div>
          <div style={{ borderBottom: '1px solid #000', width: '250px', height: '40px' }}></div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordPrintTemplate;