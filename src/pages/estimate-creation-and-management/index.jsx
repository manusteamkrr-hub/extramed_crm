import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../../components/navigation/Sidebar';
import Header from '../../components/navigation/Header';
import ServiceCatalogSidebar from './components/ServiceCatalogSidebar';
import PatientHeader from './components/PatientHeader';
import EstimateTabBar from './components/EstimateTabBar';
import EstimateLineItem from './components/EstimateLineItem';
import EstimateSummary from './components/EstimateSummary';
import EstimateToolbar from './components/EstimateToolbar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import patientService from '../../services/patientService';
import estimateService from '../../services/estimateService';

const EstimateCreationAndManagement = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentRole, setCurrentRole] = useState('admin');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [estimates, setEstimates] = useState([]);
  const [activeEstimateId, setActiveEstimateId] = useState(null);
  const [showServiceCatalog, setShowServiceCatalog] = useState(true);
  const [loading, setLoading] = useState(false);

  const patientId = location?.state?.patientId;

  useEffect(() => {
    if (patientId) {
      loadPatientAndEstimates(patientId);
    }
  }, [patientId]);

  const loadPatientAndEstimates = async (id) => {
    setLoading(true);
    
    const patientResult = await patientService?.getPatientById(id);
    if (patientResult?.success && patientResult?.data) {
      const p = patientResult?.data;
      setSelectedPatient({
        id: p?.id,
        name: p?.name,
        medicalRecordNumber: p?.medical_record_number,
        dateOfBirth: p?.date_of_birth,
        phone: p?.phone,
        diagnosis: p?.diagnosis,
        status: p?.status,
        avatar: p?.photo || "https://img.rocket.new/generatedImages/rocket_gen_img_137d2c5e0-1763293959139.png",
        avatarAlt: p?.photo_alt || 'Patient photo'
      });
    }

    const estimatesResult = await estimateService?.getEstimatesByPatient(id);
    if (estimatesResult?.success) {
      const formattedEstimates = estimatesResult?.data?.map(e => ({
        id: e?.id,
        number: e?.number,
        patientId: e?.patient_id,
        status: e?.status,
        createdAt: e?.created_at,
        updatedAt: e?.updated_at,
        paidAmount: parseFloat(e?.paid_amount) || 0,
        items: (e?.estimate_items || [])?.map(item => ({
          id: item?.id,
          name: item?.name,
          categoryName: item?.category_name,
          categoryId: item?.category_id,
          price: parseFloat(item?.price),
          unit: item?.unit,
          quantity: item?.quantity,
          discount: parseFloat(item?.discount) || 0,
          subtotal: parseFloat(item?.subtotal)
        }))
      }));
      setEstimates(formattedEstimates);
      if (formattedEstimates?.length > 0) {
        setActiveEstimateId(formattedEstimates?.[0]?.id);
      }
    }

    setLoading(false);
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const handleActionClick = (actionId) => {
    console.log('Quick action:', actionId);
  };

  const handleServiceSelect = async (service) => {
    if (!activeEstimateId) return;

    const activeEstimate = estimates?.find(e => e?.id === activeEstimateId);
    const existingItem = activeEstimate?.items?.find((item) => item?.id === service?.id);
    
    if (existingItem) {
      const updatedQuantity = existingItem?.quantity + 1;
      const updatedSubtotal = updatedQuantity * existingItem?.price * (1 - existingItem?.discount / 100);
      
      await estimateService?.updateEstimateItem(existingItem?.id, {
        quantity: updatedQuantity,
        subtotal: updatedSubtotal
      });
    } else {
      await estimateService?.addEstimateItem({
        estimate_id: activeEstimateId,
        service_id: service?.id,
        name: service?.name,
        category_name: service?.categoryName,
        category_id: service?.categoryId,
        price: service?.price,
        unit: service?.unit,
        quantity: 1,
        discount: 0,
        subtotal: service?.price
      });
    }

    if (selectedPatient?.id) {
      loadPatientAndEstimates(selectedPatient?.id);
    }
  };

  const handleUpdateLineItem = async (updatedItem) => {
    await estimateService?.updateEstimateItem(updatedItem?.id, {
      quantity: updatedItem?.quantity,
      discount: updatedItem?.discount,
      subtotal: updatedItem?.subtotal
    });
    
    if (selectedPatient?.id) {
      loadPatientAndEstimates(selectedPatient?.id);
    }
  };

  const handleRemoveLineItem = async (itemId) => {
    await estimateService?.deleteEstimateItem(itemId);
    
    if (selectedPatient?.id) {
      loadPatientAndEstimates(selectedPatient?.id);
    }
  };

  const handleNewEstimate = async () => {
    if (!selectedPatient?.id) return;

    const newEstimateNumber = `2025-${String(estimates?.length + 1)?.padStart(3, '0')}`;
    const result = await estimateService?.createEstimate({
      patient_id: selectedPatient?.id,
      number: newEstimateNumber,
      status: 'draft',
      paid_amount: 0,
      total_amount: 0
    });

    if (result?.success) {
      loadPatientAndEstimates(selectedPatient?.id);
    }
  };

  const handleSaveEstimate = async () => {
    if (!activeEstimateId) return;

    const activeEstimate = estimates?.find(e => e?.id === activeEstimateId);
    const totalAmount = activeEstimate?.items?.reduce((sum, item) => sum + item?.subtotal, 0) || 0;

    await estimateService?.updateEstimate(activeEstimateId, {
      status: activeEstimate?.status === 'draft' ? 'active' : activeEstimate?.status,
      total_amount: totalAmount,
      updated_at: new Date()?.toISOString()
    });

    if (selectedPatient?.id) {
      loadPatientAndEstimates(selectedPatient?.id);
    }
  };

  const handleExportEstimate = () => {
    const activeEstimate = estimates?.find((e) => e?.id === activeEstimateId);
    if (activeEstimate) {
      console.log('Exporting estimate:', activeEstimate);
    }
  };

  const handleApplyTemplate = (templateId) => {
    console.log('Applying template:', templateId);
  };

  const handleBulkDiscount = (discountValue) => {
    setEstimates((prev) =>
    prev?.map((estimate) => {
      if (estimate?.id === activeEstimateId) {
        return {
          ...estimate,
          items: estimate?.items?.map((item) => ({
            ...item,
            discount: discountValue,
            subtotal: item?.quantity * item?.price * (1 - discountValue / 100)
          })),
          updatedAt: new Date()?.toISOString()
        };
      }
      return estimate;
    })
    );
  };

  const activeEstimate = estimates?.find((e) => e?.id === activeEstimateId);
  const selectedServices = activeEstimate?.items || [];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={handleToggleSidebar} />
      <div
        className={`transition-smooth ${
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`
        }>

        <Header
          userRole={currentRole}
          onPatientSelect={handlePatientSelect}
          onRoleChange={handleRoleChange}
          onActionClick={handleActionClick} />


        <main className="p-4 md:p-6 lg:p-8">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-2">
                  Создание и управление сметами
                </h1>
                <p className="text-sm md:text-base caption text-muted-foreground">
                  Формирование детальных смет лечения с автоматическим расчетом стоимости
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                iconName={showServiceCatalog ? 'PanelLeftClose' : 'PanelLeftOpen'}
                iconPosition="left"
                onClick={() => setShowServiceCatalog(!showServiceCatalog)}
                className="lg:hidden">

                {showServiceCatalog ? 'Скрыть каталог' : 'Показать каталог'}
              </Button>
            </div>

            <PatientHeader patient={selectedPatient} />
          </div>

          {selectedPatient && estimates?.length > 0 &&
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
              <div
              className={`
                  ${showServiceCatalog ? 'block' : 'hidden lg:block'}
                  w-full lg:w-1/4 flex-shrink-0
                `}>

                <div className="sticky top-24 bg-card border border-border rounded-lg overflow-hidden elevation-md h-[calc(100vh-12rem)]">
                  <ServiceCatalogSidebar
                  onServiceSelect={handleServiceSelect}
                  selectedServices={selectedServices} />

                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="bg-card border border-border rounded-lg overflow-hidden elevation-md">
                  <EstimateTabBar
                  estimates={estimates}
                  activeEstimateId={activeEstimateId}
                  onTabChange={setActiveEstimateId}
                  onNewEstimate={handleNewEstimate} />


                  {activeEstimate &&
                <>
                      <EstimateToolbar
                    estimate={activeEstimate}
                    onSave={handleSaveEstimate}
                    onExport={handleExportEstimate}
                    onApplyTemplate={handleApplyTemplate}
                    onBulkDiscount={handleBulkDiscount} />


                      <div className="p-4 md:p-6">
                        {activeEstimate?.items?.length > 0 ?
                    <div className="space-y-3 md:space-y-4 mb-6">
                            {activeEstimate?.items?.map((item) =>
                      <EstimateLineItem
                        key={item?.id}
                        item={item}
                        onUpdate={handleUpdateLineItem}
                        onRemove={handleRemoveLineItem}
                        readOnly={
                        activeEstimate?.status === 'paid' ||
                        activeEstimate?.status === 'closed'
                        } />

                      )}
                          </div> :

                    <div className="text-center py-12 text-muted-foreground">
                            <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-base md:text-lg font-body mb-2">
                              Смета пуста
                            </p>
                            <p className="text-sm caption">
                              Выберите услуги из каталога для добавления в смету
                            </p>
                          </div>
                    }

                        {activeEstimate?.items?.length > 0 &&
                    <EstimateSummary estimate={activeEstimate} />
                    }
                      </div>
                    </>
                }
                </div>
              </div>
            </div>
          }

          {!selectedPatient &&
          <div className="bg-card border border-border rounded-lg p-8 md:p-12 text-center elevation-md">
              <Icon name="UserCircle" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-2">
                Выберите пациента
              </h2>
              <p className="text-sm md:text-base caption text-muted-foreground">
                Используйте поиск в верхней панели для выбора пациента и создания сметы
              </p>
            </div>
          }
        </main>
      </div>
    </div>);

};

export default EstimateCreationAndManagement;