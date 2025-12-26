import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Sidebar from '../../components/navigation/Sidebar';
import Header from '../../components/navigation/Header';
import PatientHeader from './components/PatientHeader';
import DemographicsTab from './components/DemographicsTab';
import MedicalHistoryTab from './components/MedicalHistoryTab';
import TreatmentTimelineTab from './components/TreatmentTimelineTab';
import FinancialSummaryTab from './components/FinancialSummaryTab';
import DocumentsTab from './components/DocumentsTab';
import Icon from '../../components/AppIcon';
import patientService from '../../services/patientService';
import medicalHistoryService from '../../services/medicalHistoryService';
import estimateService from '../../services/estimateService';

const PatientProfile = () => {
  const location = useLocation();
  const { patientId: urlPatientId } = useParams();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentRole, setCurrentRole] = useState('admin');
  const [activeTab, setActiveTab] = useState('demographics');
  const [patient, setPatient] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingDemographics, setIsEditingDemographics] = useState(false);

  // Get patient ID from URL params first, then fall back to location state
  const patientId = urlPatientId || location?.state?.patientId || 'default-patient-id';

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    setLoading(true);
    
    const patientResult = await patientService?.getPatientById(patientId);
    if (patientResult?.success && patientResult?.data) {
      const p = patientResult?.data;
      setPatient({
        id: p?.id,
        fullName: p?.name,
        photo: p?.photo || "https://img.rocket.new/generatedImages/rocket_gen_img_10c48cdd0-1763299750352.png",
        photoAlt: p?.photo_alt || 'Patient photo',
        dateOfBirth: p?.date_of_birth,
        age: p?.age,
        gender: p?.gender,
        phone: p?.phone,
        email: p?.email,
        address: p?.address,
        medicalRecordNumber: p?.medical_record_number,
        status: p?.status,
        insuranceStatus: p?.insurance_company ? `${p?.insurance_company} активен` : 'Не указан',
        hasAlerts: p?.has_alerts,
        alerts: p?.alerts || [],
        emergencyContact: p?.emergency_contact,
        emergencyPhone: p?.emergency_phone,
        passportSeries: p?.passport_series,
        passportNumber: p?.passport_number,
        insuranceCompany: p?.insurance_company,
        insurancePolicy: p?.insurance_policy
      });
    }

    const historyResult = await medicalHistoryService?.getMedicalHistory(patientId);
    if (historyResult?.success) {
      setMedicalHistory({
        diagnoses: historyResult?.data?.diagnoses?.map(d => ({
          code: d?.code,
          description: d?.description,
          diagnosedDate: d?.diagnosed_date,
          physician: d?.physician,
          isPrimary: d?.is_primary
        })),
        medications: historyResult?.data?.medications?.map(m => ({
          name: m?.name,
          dosage: m?.dosage,
          startDate: m?.start_date,
          endDate: m?.end_date,
          prescribedBy: m?.prescribed_by,
          isActive: m?.is_active
        })),
        allergies: historyResult?.data?.allergies?.map(a => ({
          allergen: a?.allergen,
          reaction: a?.reaction,
          severity: a?.severity
        })),
        labResults: historyResult?.data?.labResults,
        procedures: historyResult?.data?.procedures
      });
    }

    const estimatesResult = await estimateService?.getEstimatesByPatient(patientId);
    if (estimatesResult?.success) {
      const estimates = estimatesResult?.data;
      const totalPaid = estimates?.reduce((sum, e) => sum + (parseFloat(e?.paidAmount || e?.paid_amount) || 0), 0);
      const totalOutstanding = estimates?.reduce((sum, e) => {
        const total = parseFloat(e?.totalAmount || e?.total_amount) || 0;
        const paid = parseFloat(e?.paidAmount || e?.paid_amount) || 0;
        return sum + (total - paid);
      }, 0);
      
      setFinancialData({
        totalEstimates: estimates?.length,
        totalPaid,
        totalOutstanding,
        estimates: estimates?.map(e => {
          // Use services field if available, otherwise fall back to estimate_items
          const servicesList = e?.services || e?.estimate_items || [];
          
          return {
            id: e?.id,
            number: e?.number,
            status: e?.status,
            paymentMethod: e?.paymentMethod || e?.payment_method,
            insuranceType: e?.insuranceType || e?.insurance_type,
            createdDate: e?.createdAt || e?.created_at,
            createdBy: 'Администратор',
            totalAmount: parseFloat(e?.totalAmount || e?.total_amount) || 0,
            paidAmount: parseFloat(e?.paidAmount || e?.paid_amount) || 0,
            outstandingAmount: (parseFloat(e?.totalAmount || e?.total_amount) || 0) - (parseFloat(e?.paidAmount || e?.paid_amount) || 0),
            services: servicesList?.map(s => ({
              id: s?.id || s?.service_id,
              code: s?.code || s?.service_code,
              name: s?.name,
              category: s?.category,
              price: parseFloat(s?.price) || 0,
              quantity: parseInt(s?.quantity) || 1,
              days: parseInt(s?.days) || 1,
              isDailyRate: s?.isDailyRate || s?.is_daily_rate || false,
              unit: s?.unit || 'услуга',
              total: parseFloat(s?.total) || 0
            }))
          };
        }),
        paymentHistory: []
      });
    }

    setLoading(false);
  };

  const handleEstimateCreated = async (estimateData) => {
    const result = await estimateService?.createEstimate(estimateData);
    if (result?.success) {
      await loadPatientData();
      alert('Смета успешно создана');
    } else {
      alert('Ошибка при создании сметы: ' + result?.error);
    }
  };

  const mockPatient = {
    id: 'P001',
    fullName: 'Иванов Иван Иванович',
    photo: "https://img.rocket.new/generatedImages/rocket_gen_img_10c48cdd0-1763299750352.png",
    photoAlt: 'Professional headshot of middle-aged man with short dark hair wearing blue medical scrubs in clinical setting',
    dateOfBirth: '1985-03-15',
    age: 39,
    gender: 'Мужской',
    phone: '+7 (999) 123-45-67',
    email: 'ivanov@example.com',
    address: 'г. Москва, ул. Ленина, д. 10, кв. 25',
    medicalRecordNumber: 'MRN-2025-001',
    status: 'active',
    insuranceStatus: 'ДМС активен',
    hasAlerts: true,
    alerts: [
    'Аллергия на пенициллин',
    'Повышенное артериальное давление'],

    emergencyContact: 'Иванова Мария Петровна',
    emergencyPhone: '+7 (999) 765-43-21',
    passportSeries: '4512',
    passportNumber: '123456',
    insuranceCompany: 'АльфаСтрахование',
    insurancePolicy: 'ДМС-2025-001234'
  };

  const mockMedicalHistory = {
    diagnoses: [],
    medications: [],
    allergies: [],
    labResults: [],
    procedures: []
  };

  const mockTimeline = [];

  const mockFinancialData = {
    totalEstimates: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    estimates: [],
    paymentHistory: []
  };

  const mockDocuments = [];

  const tabs = [
    { id: 'demographics', label: 'Демография', icon: 'user' },
    { id: 'medical', label: 'Медицинская история', icon: 'heart' },
    { id: 'timeline', label: 'График лечения', icon: 'clock' },
    { id: 'financial', label: 'Финансы', icon: 'dollar-sign' },
    { id: 'documents', label: 'Документы', icon: 'file-text' }
  ];

  const displayPatient = patient || mockPatient;
  const displayMedicalHistory = medicalHistory || mockMedicalHistory;
  const displayFinancialData = financialData || mockFinancialData;

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
  };

  const handlePatientEdit = () => {
    setActiveTab('demographics');
    setIsEditingDemographics(true);
  };

  const handleDemographicsSave = async (data) => {
    if (patient?.id) {
      const result = await patientService?.updatePatient(patient?.id, {
        name: data?.fullName,
        phone: data?.phone,
        email: data?.email,
        address: data?.address,
        emergency_contact: data?.emergencyContact,
        emergency_phone: data?.emergencyPhone
      });
      if (result?.success) {
        loadPatientData();
      }
    }
  };

  const handlePhotoUpdate = async (photoData) => {
    if (patient?.id) {
      const result = await patientService?.updatePatient(patient?.id, {
        photo: photoData,
        photo_alt: `${patient?.fullName} patient photo`
      });
      if (result?.success) {
        loadPatientData();
      }
    }
  };

  const handleAddDiagnosis = async (diagnosis) => {
    if (patient?.id) {
      const result = await medicalHistoryService?.addDiagnosis({
        patient_id: patient?.id,
        code: diagnosis?.code,
        description: diagnosis?.description,
        diagnosed_date: diagnosis?.diagnosedDate,
        physician: diagnosis?.physician,
        is_primary: diagnosis?.isPrimary
      });
      if (result?.success) {
        loadPatientData();
      }
    }
  };

  const handleAddMedication = async (medication) => {
    if (patient?.id) {
      const result = await medicalHistoryService?.addMedication({
        patient_id: patient?.id,
        name: medication?.name,
        dosage: medication?.dosage,
        start_date: medication?.startDate,
        end_date: medication?.endDate,
        prescribed_by: medication?.prescribedBy,
        is_active: medication?.isActive
      });
      if (result?.success) {
        loadPatientData();
      }
    }
  };

  const handleAddAllergy = async (allergy) => {
    if (patient?.id) {
      const result = await medicalHistoryService?.addAllergy({
        patient_id: patient?.id,
        allergen: allergy?.allergen,
        reaction: allergy?.reaction,
        severity: allergy?.severity
      });
      if (result?.success) {
        loadPatientData();
      }
    }
  };

  const handleDocumentUpload = (files) => {
    console.log('Upload documents:', files);
  };

  // Add these handlers
  const handlePatientSelect = (patient) => {
    console.log('Patient selected:', patient);
  };

  const handleActionClick = (action) => {
    console.log('Action clicked:', action);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={handleToggleSidebar} />
      <div className={`flex-1 flex flex-col transition-smooth ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
        <Header
          userRole={currentRole}
          onRoleChange={handleRoleChange}
          onPatientSelect={handlePatientSelect}
          onActionClick={handleActionClick} />


        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
            <PatientHeader patient={displayPatient} onEdit={handlePatientEdit} />

            <div className="bg-card border border-border rounded-lg overflow-hidden elevation-sm">
              <div className="border-b border-border overflow-x-auto">
                <div className="flex min-w-max">
                  {tabs?.map((tab) =>
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`
                        flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-body font-medium
                        transition-smooth border-b-2 whitespace-nowrap
                        ${activeTab === tab?.id ?
                    'text-primary border-primary bg-primary/5' : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted'}
                      `
                    }>

                      <Icon
                      name={tab?.icon}
                      size={18}
                      color={activeTab === tab?.id ? 'var(--color-primary)' : 'var(--color-muted-foreground)'} />

                      <span>{tab?.label}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 md:p-6 lg:p-8">
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Загрузка данных...</p>
                  </div>
                ) : (
                  <>
                    {activeTab === 'demographics' &&
                    <DemographicsTab 
                      patient={displayPatient} 
                      onSave={handleDemographicsSave}
                      onPhotoUpdate={handlePhotoUpdate}
                      isEditingFromHeader={isEditingDemographics}
                      onEditComplete={() => setIsEditingDemographics(false)}
                    />
                    }
                    {activeTab === 'medical' &&
                    <MedicalHistoryTab
                      medicalHistory={displayMedicalHistory}
                      onAddDiagnosis={handleAddDiagnosis}
                      onAddMedication={handleAddMedication}
                      onAddAllergy={handleAddAllergy} />

                    }
                    {activeTab === 'timeline' &&
                    <TreatmentTimelineTab timeline={mockTimeline} />
                    }
                    {activeTab === 'financial' &&
                    <FinancialSummaryTab 
                      financialData={displayFinancialData} 
                      userRole={currentRole} 
                      patientId={patientId}
                      onEstimateCreated={handleEstimateCreated}
                    />
                    }
                    {activeTab === 'documents' &&
                    <DocumentsTab 
                      documents={mockDocuments} 
                      onUpload={handleDocumentUpload}
                      patient={displayPatient}
                      medicalHistory={displayMedicalHistory}
                    />
                    }
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>);

};

export default PatientProfile;