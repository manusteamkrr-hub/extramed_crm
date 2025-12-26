import React from 'react';
import Icon from 'components/AppIcon';
import { cn } from 'utils/cn';

const RegistrationProgress = ({ steps, currentStep, totalSteps }) => {
  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps?.map((step) => {
          const isCompleted = step?.id < currentStep;
          const isCurrent = step?.id === currentStep;
          const isPending = step?.id > currentStep;

          return (
            <div key={step?.id} className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative z-10',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  isPending && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Icon name="Check" size={20} />
                ) : (
                  <Icon name={step?.icon} size={20} />
                )}
              </div>
              <p
                className={cn(
                  'mt-2 text-xs font-medium text-center max-w-[100px]',
                  (isCompleted || isCurrent) ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step?.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RegistrationProgress;