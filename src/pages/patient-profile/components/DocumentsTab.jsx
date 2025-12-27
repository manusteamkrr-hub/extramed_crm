import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import MedicalRecordPrintTemplate from '../../../components/MedicalRecordPrintTemplate';

const DocumentsTab = ({ documents, onUpload, patient, medicalHistory }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const categories = [
    { value: 'all', label: 'Все документы', icon: 'Files' },
    { value: 'medical', label: 'Медицинские записи', icon: 'FileText' },
    { value: 'laboratory', label: 'Лабораторные анализы', icon: 'FlaskConical' },
    { value: 'imaging', label: 'Снимки и изображения', icon: 'Image' },
    { value: 'consent', label: 'Согласия', icon: 'FileCheck' },
    { value: 'other', label: 'Прочее', icon: 'File' },
  ];

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'pdf':
        return { name: 'FileText', color: 'var(--color-error)' };
      case 'image':
        return { name: 'Image', color: 'var(--color-primary)' };
      case 'document':
        return { name: 'FileText', color: 'var(--color-success)' };
      default:
        return { name: 'File', color: 'var(--color-muted-foreground)' };
    }
  };

  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents?.filter(doc => doc?.category === selectedCategory);

  const handleFileUpload = (e) => {
    const files = Array.from(e?.target?.files);
    if (onUpload) {
      onUpload(files);
    }
  };

  const handlePrintMedicalRecord = () => {
    setShowPrintPreview(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground">
          Документы пациента
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Printer"
            iconPosition="left"
            onClick={handlePrintMedicalRecord}
          >
            Печать по шаблону
          </Button>
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <Button
              variant="default"
              size="sm"
              iconName="Upload"
              iconPosition="left"
              asChild
            >
              Загрузить документ
            </Button>
          </label>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories?.map((category) => (
          <button
            key={category?.value}
            onClick={() => setSelectedCategory(category?.value)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-caption
              transition-smooth
              ${selectedCategory === category?.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-foreground hover:bg-muted'
              }
            `}
          >
            <Icon 
              name={category?.icon} 
              size={16} 
              color={selectedCategory === category?.value ? 'var(--color-primary-foreground)' : 'var(--color-foreground)'} 
            />
            <span>{category?.label}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments?.map((document, index) => {
          const icon = getDocumentIcon(document?.type);
          return (
            <div key={index} className="bg-card border border-border rounded-lg p-4 hover:elevation-md transition-smooth">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${icon?.color}15` }}
                >
                  <Icon name={icon?.name} size={24} color={icon?.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-body font-medium text-foreground mb-1 truncate">
                    {document?.name}
                  </p>
                  <p className="text-xs caption text-muted-foreground">
                    {document?.size}
                  </p>
                </div>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-xs caption text-muted-foreground">
                  <Icon name="Calendar" size={14} />
                  <span>{document?.uploadDate}</span>
                </div>
                <div className="flex items-center gap-2 text-xs caption text-muted-foreground">
                  <Icon name="User" size={14} />
                  <span>{document?.uploadedBy}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Eye"
                  fullWidth
                >
                  Просмотр
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Download"
                  fullWidth
                >
                  Скачать
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {filteredDocuments?.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <Icon name="FileX" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
          <p className="text-sm md:text-base caption text-muted-foreground">
            Нет документов в выбранной категории
          </p>
        </div>
      )}
      {showPrintPreview && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-card rounded-lg w-full max-w-4xl">
              <div className="flex justify-between items-center p-4 border-b border-border sticky top-0 bg-card z-10">
                <h3 className="text-lg font-heading font-semibold">Предпросмотр медицинской карты</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="primary" 
                    size="sm"
                    iconName="Printer"
                    iconPosition="left"
                    onClick={handlePrint}
                  >
                    Печать
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowPrintPreview(false)}
                  >
                    Закрыть
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-white">
                <style>{`
                  @media print {
                    body * {
                      visibility: hidden;
                    }
                    .print-content, .print-content * {
                      visibility: visible;
                    }
                    .print-content {
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: 100%;
                    }
                    @page {
                      size: A4;
                      margin: 15mm;
                    }
                  }
                `}</style>
                <div className="print-content">
                  <MedicalRecordPrintTemplate
                    patient={patient}
                    medicalHistory={medicalHistory}
                    admissionDate={new Date()?.toISOString()}
                    dischargeDate={null}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsTab;