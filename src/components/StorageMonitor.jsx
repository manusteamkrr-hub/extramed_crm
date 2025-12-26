import React, { useState, useEffect } from 'react';
import { AlertTriangle, HardDrive, Download, Upload, RefreshCw } from 'lucide-react';
import localDB, { STORAGE_KEYS } from '../lib/localDatabase';

const StorageMonitor = () => {
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 0, percentage: 0 });
  const [showDetails, setShowDetails] = useState(false);
  const [metadata, setMetadata] = useState({});

  const updateStorageInfo = () => {
    const info = localDB?.getStorageInfo();
    setStorageInfo(info);
    setMetadata(localDB?.getMetadata());
  };

  useEffect(() => {
    updateStorageInfo();
    const interval = setInterval(updateStorageInfo, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleBackup = () => {
    const backup = localDB?.createBackup();
    if (backup) {
      alert('Backup created successfully!');
      updateStorageInfo();
    } else {
      alert('Backup failed. Please check console for details.');
    }
  };

  const handleRestore = () => {
    if (confirm('This will restore data from the last backup. Continue?')) {
      try {
        localDB?.restoreFromBackup();
        alert('Data restored successfully!');
        window.location?.reload();
      } catch (e) {
        alert(`Restore failed: ${e?.message}`);
      }
    }
  };

  const handleExport = () => {
    const exportData = localDB?.exportData();
    if (exportData) {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extramed-backup-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
      document.body?.appendChild(a);
      a?.click();
      document.body?.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert('Export failed. Please check console for details.');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e?.target?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importData = JSON.parse(event?.target?.result);
            if (localDB?.importData(importData)) {
              alert('Data imported successfully!');
              window.location?.reload();
            } else {
              alert('Import failed. Please check the file format.');
            }
          } catch (e) {
            alert(`Import failed: ${e?.message}`);
          }
        };
        reader?.readAsText(file);
      }
    };
    input?.click();
  };

  const getStorageStatusColor = () => {
    if (storageInfo?.percentage > 90) return 'text-red-600 bg-red-50 border-red-200';
    if (storageInfo?.percentage > 80) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes?.[i];
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Storage Status Badge */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 shadow-lg transition-all ${getStorageStatusColor()}`}
      >
        <HardDrive className="w-5 h-5" />
        <span className="font-semibold">{storageInfo?.percentage}%</span>
        {storageInfo?.percentage > 80 && <AlertTriangle className="w-4 h-4 animate-pulse" />}
      </button>
      {/* Details Panel */}
      {showDetails && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Storage Monitor</h3>
              <button
                onClick={updateStorageInfo}
                className="p-1 hover:bg-gray-100 rounded"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Storage Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Used: {formatBytes(storageInfo?.used)}</span>
                <span>Total: {formatBytes(storageInfo?.total)}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    storageInfo?.percentage > 90
                      ? 'bg-red-500'
                      : storageInfo?.percentage > 80
                      ? 'bg-yellow-500' :'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(storageInfo?.percentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Warning Message */}
            {storageInfo?.percentage > 80 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold">Storage Warning</p>
                    <p>Your storage is {storageInfo?.percentage > 90 ? 'critically' : 'nearly'} full. Consider exporting and cleaning old data.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            {metadata?.lastBackup && (
              <div className="text-xs text-gray-500">
                Last backup: {new Date(metadata.lastBackup)?.toLocaleString()}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleBackup}
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Backup</span>
              </button>
              <button
                onClick={handleRestore}
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Restore</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={handleImport}
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </button>
            </div>

            {/* Info Text */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Automatic backups every 30 minutes</p>
              <p>• Export data before clearing browser cache</p>
              <p>• Import to restore from previous export</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageMonitor;