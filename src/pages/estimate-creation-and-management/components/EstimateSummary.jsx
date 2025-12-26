import React from 'react';
import Icon from '../../../components/AppIcon';

const EstimateSummary = ({ estimate }) => {
  const calculateTotals = () => {
    const subtotal = estimate?.items?.reduce((sum, item) => sum + item?.subtotal, 0);
    const totalDiscount = estimate?.items?.reduce(
      (sum, item) => sum + item?.quantity * item?.price * (item?.discount / 100),
      0
    );
    const tax = subtotal * 0; // No tax in this system
    const total = subtotal + tax;

    return { subtotal, totalDiscount, tax, total };
  };

  const totals = calculateTotals();

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 elevation-sm">
      <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-4">
        Итоговая сумма
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Icon name="FileText" size={16} color="var(--color-muted-foreground)" />
            <span className="text-sm caption text-muted-foreground">Позиций в смете</span>
          </div>
          <span className="text-sm font-body font-semibold text-foreground">
            {estimate?.items?.length}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm caption text-muted-foreground">Сумма без скидки</span>
          <span className="text-sm font-body font-medium text-foreground whitespace-nowrap">
            {(totals?.subtotal + totals?.totalDiscount)?.toLocaleString('ru-RU')} ₽
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm caption text-muted-foreground">Скидка</span>
          <span className="text-sm font-body font-medium text-error whitespace-nowrap">
            -{totals?.totalDiscount?.toLocaleString('ru-RU')} ₽
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-base md:text-lg font-heading font-semibold text-foreground">
            Итого к оплате
          </span>
          <span className="text-lg md:text-xl font-heading font-bold text-primary whitespace-nowrap">
            {totals?.total?.toLocaleString('ru-RU')} ₽
          </span>
        </div>

        {estimate?.paidAmount > 0 && (
          <>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-sm caption text-muted-foreground">Оплачено</span>
              <span className="text-sm font-body font-semibold text-success whitespace-nowrap">
                {estimate?.paidAmount?.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-base font-body font-semibold text-foreground">
                Остаток к оплате
              </span>
              <span className="text-base font-body font-bold text-warning whitespace-nowrap">
                {(totals?.total - estimate?.paidAmount)?.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs caption text-muted-foreground">
          <Icon name="Info" size={14} />
          <span>Создано: {new Date(estimate.createdAt)?.toLocaleDateString('ru-RU')}</span>
        </div>
        {estimate?.updatedAt && (
          <div className="flex items-center gap-2 text-xs caption text-muted-foreground mt-1">
            <Icon name="Clock" size={14} />
            <span>Обновлено: {new Date(estimate.updatedAt)?.toLocaleDateString('ru-RU')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstimateSummary;