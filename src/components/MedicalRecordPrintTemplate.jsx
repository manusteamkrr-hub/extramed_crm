import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const MedicalRecordPrintTemplate = ({ patient, medicalHistory, admissionDate, dischargeDate }) => {
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

  const primaryDiagnosis = medicalHistory?.diagnoses?.find(d => d?.isPrimary);
  const complications = medicalHistory?.diagnoses?.filter(d => !d?.isPrimary && d?.code !== primaryDiagnosis?.code);

  return (
    <div className="medical-record-print" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: '1.4', padding: '20px', maxWidth: '210mm' }}>
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .medical-record-print {
              padding: 0;
            }
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          .print-table td {
            padding: 3px 5px;
            vertical-align: top;
          }
          .print-underline {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 100px;
          }
          .print-section {
            margin-bottom: 15px;
          }
          .print-header {
            text-align: center;
            margin-bottom: 20px;
          }
        `}
      </style>

      <div className="print-header">
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Министерство здравоохранения РФ</div>
        <div style={{ marginBottom: '10px' }}>ООО "Экстрамед"</div>
        <div style={{ fontSize: '10px', marginBottom: '5px' }}>наименование учреждения</div>
        <div style={{ fontSize: '10px' }}>Код формы по ОКУД _______________</div>
        <div style={{ fontSize: '10px', marginBottom: '10px' }}>Код учреждения по ОКПО __________</div>
        <div style={{ fontWeight: 'bold', marginTop: '15px' }}>Медицинская документация</div>
        <div style={{ fontSize: '10px' }}>Форма N 003/у</div>
        <div style={{ fontSize: '10px', marginBottom: '15px' }}>Утверждена Минздравом СССР 04.10.80 г. N 1030</div>
        <div style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '15px' }}>МЕДИЦИНСКАЯ КАРТА № {patient?.medicalRecordNumber || patient?.id || '_______'}</div>
        <div style={{ fontWeight: 'bold' }}>стационарного больного</div>
      </div>

      <div className="print-section">
        <table className="print-table">
          <tbody>
            <tr>
              <td style={{ width: '50%' }}>Дата и время поступления</td>
              <td style={{ width: '50%' }}><span className="print-underline">{formatDateTime(admissionDate || new Date())}</span></td>
            </tr>
            <tr>
              <td>Дата и время выписки</td>
              <td><span className="print-underline">{formatDateTime(dischargeDate || '')}</span></td>
            </tr>
            <tr>
              <td>Отделение</td>
              <td><span className="print-underline">Терапевтическое</span> палата № <span className="print-underline">____</span></td>
            </tr>
            <tr>
              <td colSpan="2">Переведен в отделение <span className="print-underline" style={{ width: '70%' }}>_______________________________</span></td>
            </tr>
            <tr>
              <td>Проведено койко-дней</td>
              <td><span className="print-underline">_______</span></td>
            </tr>
            <tr>
              <td colSpan="2">Виды транспортировки: на каталке, на кресле, может идти (подчеркнуть)</td>
            </tr>
            <tr>
              <td>Группа крови</td>
              <td><span className="print-underline">_______</span> Резус-принадлежность <span className="print-underline">_______</span></td>
            </tr>
            <tr>
              <td colSpan="2">
                Побочное действие лекарств (непереносимость) <span className="print-underline" style={{ width: '60%' }}>{medicalHistory?.allergies?.map(a => a?.allergen)?.join(', ') || '_______'}</span>
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                название препарата, характер побочного действия <span className="print-underline" style={{ width: '50%' }}>{medicalHistory?.allergies?.map(a => a?.reaction)?.join('; ') || '_______'}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="print-section">
        <table className="print-table">
          <tbody>
            <tr>
              <td style={{ width: '40%' }}>1. Фамилия, имя, отчество</td>
              <td style={{ width: '60%' }}><span className="print-underline" style={{ width: '100%' }}>{patient?.fullName || '_______'}</span></td>
            </tr>
            <tr>
              <td>2. Пол</td>
              <td><span className="print-underline">{patient?.gender || '_______'}</span></td>
            </tr>
            <tr>
              <td>3. Возраст</td>
              <td><span className="print-underline">{calculateAge(patient?.dateOfBirth) || patient?.age || '_______'}</span> (полных лет, для детей: до 1 года - месяцев, до 1 месяца – дней)</td>
            </tr>
            <tr>
              <td colSpan="2">
                4. Постоянное место жительства: город, село (подчеркнуть)
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                <span className="print-underline" style={{ width: '100%' }}>{patient?.address || '_______'}</span>
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                вписать адрес, указав для приезжих - область, район, нас.пункт
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                адрес родственников и № телефона <span className="print-underline" style={{ width: '60%' }}>{patient?.emergencyContact || '_______'}, {patient?.emergencyPhone || patient?.phone || '_______'}</span>
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                5. Место работы, профессия или должность <span className="print-underline" style={{ width: '50%' }}>{patient?.occupation || '_______'}</span>
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                для учащихся - место учебы; для детей - название детского учреждения, школы
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                для инвалидов - род и группа инвалидности, ИОВ да, нет (подчеркнуть)
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="print-section">
        <table className="print-table">
          <tbody>
            <tr>
              <td>6. Кем направлен больной</td>
              <td><span className="print-underline" style={{ width: '70%' }}>самотек</span></td>
            </tr>
            <tr>
              <td colSpan="2">название лечебного учреждения</td>
            </tr>
            <tr>
              <td colSpan="2">
                7. Доставлен в стационар по экстренным показаниям: да, нет через <span className="print-underline">______</span> часов
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                после начала заболевания, получения травмы; госпитализирован в плановом порядке (подчеркнуть).
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                8. Диагноз направившего учреждения <span className="print-underline" style={{ width: '60%' }}>_______</span>
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                9. Диагноз при поступлении <span className="print-underline" style={{ width: '60%' }}>{primaryDiagnosis?.code || '_______'} {primaryDiagnosis?.description || ''}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="print-section">
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>10. Диагноз клинический</div>
        <table className="print-table">
          <tbody>
            <tr>
              <td style={{ width: '30%' }}>Дата установления</td>
              <td><span className="print-underline" style={{ width: '100%' }}>{formatDate(primaryDiagnosis?.diagnosedDate)}</span></td>
            </tr>
            <tr>
              <td colSpan="2">
                <span className="print-underline" style={{ width: '100%', minHeight: '40px', display: 'block' }}>
                  {primaryDiagnosis?.code || '_______'} {primaryDiagnosis?.description || ''}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="print-section">
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>11. Диагноз заключительный клинический</div>
        <table className="print-table">
          <tbody>
            <tr>
              <td colSpan="2">
                а) основной: <span className="print-underline" style={{ width: '80%', display: 'block', minHeight: '30px' }}>
                  {primaryDiagnosis?.code || '_______'} {primaryDiagnosis?.description || ''}
                </span>
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                б) осложнение основного: <span className="print-underline" style={{ width: '75%', display: 'block', minHeight: '30px' }}>
                  {complications?.map(c => `${c?.code} ${c?.description}`)?.join('; ') || '_______'}
                </span>
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                в) сопутствующий: <span className="print-underline" style={{ width: '80%', display: 'block', minHeight: '30px' }}>_______</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="print-section">
        <div>12. Госпитализирован в данном году по поводу данного заболевания: впервые, повторно (подчеркнуть), всего <span className="print-underline">______</span> раз.</div>
      </div>

      <div className="print-section">
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>13. Хирургические операции, методы обезболивания и послеоперационные осложнения.</div>
        <table className="print-table" style={{ border: '1px solid #000' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #000', padding: '5px', textAlign: 'left' }}>Название операции</th>
              <th style={{ border: '1px solid #000', padding: '5px', textAlign: 'left' }}>Дата, час</th>
              <th style={{ border: '1px solid #000', padding: '5px', textAlign: 'left' }}>Метод обезболивания</th>
              <th style={{ border: '1px solid #000', padding: '5px', textAlign: 'left' }}>Осложнения</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '5px', height: '30px' }}>1.</td>
              <td style={{ border: '1px solid #000', padding: '5px' }}></td>
              <td style={{ border: '1px solid #000', padding: '5px' }}></td>
              <td style={{ border: '1px solid #000', padding: '5px' }}></td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '5px', height: '30px' }}>2.</td>
              <td style={{ border: '1px solid #000', padding: '5px' }}></td>
              <td style={{ border: '1px solid #000', padding: '5px' }}></td>
              <td style={{ border: '1px solid #000', padding: '5px' }}></td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '5px', height: '30px' }}>3.</td>
              <td style={{ border: '1px solid #000', padding: '5px' }}></td>
              <td style={{ border: '1px solid #000', padding: '5px' }}></td>
              <td style={{ border: '1px solid #000', padding: '5px' }}></td>
            </tr>
          </tbody>
        </table>
        <div style={{ marginTop: '10px' }}>Оперировал <span className="print-underline" style={{ width: '300px' }}>________________________________</span></div>
      </div>

      <div className="print-section">
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>14. Другие виды лечения</div>
        <div>Дезинтоксикационная симптоматическая терапия</div>
        <div style={{ marginTop: '5px' }}>
          <span className="print-underline" style={{ width: '100%', display: 'block', minHeight: '40px' }}>
            {medicalHistory?.medications?.map(m => `${m?.name} ${m?.dosage}`)?.join('; ') || '_______'}
          </span>
        </div>
        <div style={{ fontSize: '10px', marginTop: '5px' }}>указать</div>
        <div style={{ fontSize: '10px', marginTop: '5px' }}>
          для больных злокачественными новообразованиями - 1. Специальное лечение; хирургическое (дистанционная гамма-терапия; рентгенотерапия, быстрые электроны, контактная и дистанционная гамма-терапия, контактная гамма-терапия и глубокая рентгенотерапия); комбинированное (хирургическое и гамма-терапия, хирургическое и рентгенотерапия, хирургическое и сочетанное лучевое); химиопрепаратами, гормональными препаратами. 2. Паллиативное. 3. Симптоматическое лечение.
        </div>
      </div>

      <div className="print-section">
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>15. Отметка о выдаче листка нетрудоспособности</div>
        <div>№ <span className="print-underline">_______</span> с <span className="print-underline">_______</span> по <span className="print-underline">_______</span> № <span className="print-underline">_______</span> с <span className="print-underline">_______</span> по <span className="print-underline">_______</span></div>
        <div>№ <span className="print-underline">_______</span> с <span className="print-underline">_______</span> по <span className="print-underline">_______</span> № <span className="print-underline">_______</span> с <span className="print-underline">_______</span> по <span className="print-underline">_______</span></div>
      </div>

      <div className="print-section">
        <div>16. Исход заболевания: выписан - с выздоровлением, с улучшением, без перемен, с ухудшением; переведен в другое учреждение <span className="print-underline" style={{ width: '300px' }}>_______</span></div>
        <div style={{ fontSize: '10px' }}>название лечебного учреждения</div>
        <div style={{ marginTop: '5px' }}>Умер в приемном отделении, умерла беременная до 28 недель беременности, умерла после 28 недель беременности, роженица, родильница.</div>
      </div>

      <div className="print-section">
        <div>17. Трудоспособность восстановлена полностью, снижена, временно утрачена, стойко утрачена в связи с данным заболеванием, с другими причинами (подчеркнуть)</div>
      </div>

      <div className="print-section">
        <div>18. Для поступивших на экспертизу-заключение <span className="print-underline" style={{ width: '60%' }}>_______</span></div>
      </div>

      <div className="print-section">
        <div>19. Особые отметки <span className="print-underline" style={{ width: '70%' }}>_______</span></div>
      </div>

      <div className="print-section" style={{ marginTop: '30px' }}>
        <table className="print-table">
          <tbody>
            <tr>
              <td style={{ width: '50%' }}>Лечащий врач <span className="print-underline" style={{ width: '200px' }}>{primaryDiagnosis?.physician || '_______'}</span></td>
              <td style={{ width: '50%' }}>Зав. отделением <span className="print-underline" style={{ width: '200px' }}>_______</span></td>
            </tr>
            <tr>
              <td style={{ fontSize: '10px' }}>подпись</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: '10px', marginTop: '20px', fontStyle: 'italic' }}>
        Данные из формы N 1030 должны автоматически формироваться из профиля пациента при формировании бланка на печать
      </div>
    </div>
  );
};

export default MedicalRecordPrintTemplate;
