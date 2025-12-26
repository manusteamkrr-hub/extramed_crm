import React from 'react';
import Icon from '../../../components/AppIcon';

const ReportListItem = ({ report, onSelect, isActive }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'ready':
        return 'text-success';
      case 'processing':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return 'CheckCircle';
      case 'processing':
        return 'Loader2';
      case 'error':
        return 'AlertCircle';
      default:
        return 'Clock';
    }
  };

  return (
    <button
      onClick={() => onSelect(report)}
      className={`
        w-full text-left p-3 rounded-lg border transition-smooth
        ${isActive 
          ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted'
        }
      `}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-body font-medium text-foreground text-sm truncate">
            {report?.name}
          </p>
          <p className="text-xs caption text-muted-foreground mt-1">
            {report?.description}
          </p>
        </div>
        {report?.isFavorite && (
          <Icon name="Star" size={16} color="var(--color-warning)" className="flex-shrink-0 fill-current" />
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon
            name={getStatusIcon(report?.status)}
            size={14}
            color={`var(--color-${report?.status === 'ready' ? 'success' : report?.status === 'processing' ? 'warning' : 'error'})`}
            className={report?.status === 'processing' ? 'animate-spin' : ''}
          />
          <span className={`text-xs caption ${getStatusColor(report?.status)}`}>
            {report?.statusText}
          </span>
        </div>
        <span className="text-xs caption text-muted-foreground">
          {report?.lastUpdated}
        </span>
      </div>
    </button>
  );
};

export default ReportListItem;