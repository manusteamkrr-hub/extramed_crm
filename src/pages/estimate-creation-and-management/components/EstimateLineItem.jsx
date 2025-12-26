import React, { useState } from 'react';

import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const EstimateLineItem = ({ item, onUpdate, onRemove, readOnly = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(item);

  const handleQuantityChange = (value) => {
    const quantity = Math.max(1, parseInt(value) || 1);
    const updatedItem = {
      ...editedItem,
      quantity,
      subtotal: quantity * editedItem?.price * (1 - editedItem?.discount / 100),
    };
    setEditedItem(updatedItem);
  };

  const handleDiscountChange = (value) => {
    const discount = Math.max(0, Math.min(100, parseFloat(value) || 0));
    const updatedItem = {
      ...editedItem,
      discount,
      subtotal: editedItem?.quantity * editedItem?.price * (1 - discount / 100),
    };
    setEditedItem(updatedItem);
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editedItem);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedItem(item);
    setIsEditing(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-3 md:p-4 hover:elevation-sm transition-smooth">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-base font-body font-medium text-foreground mb-1">
                {item?.name}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs caption text-muted-foreground">
                <span>{item?.id}</span>
                <span>•</span>
                <span>{item?.categoryName}</span>
              </div>
            </div>
            {!readOnly && (
              <Button
                variant="ghost"
                size="icon"
                iconName="Trash2"
                onClick={() => onRemove(item?.id)}
                className="flex-shrink-0"
              />
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            <div>
              <p className="text-xs caption text-muted-foreground mb-1">Цена за {item?.unit}</p>
              <p className="text-sm font-body font-semibold text-foreground whitespace-nowrap">
                {item?.price?.toLocaleString('ru-RU')} ₽
              </p>
            </div>

            <div>
              <p className="text-xs caption text-muted-foreground mb-1">Количество</p>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedItem?.quantity}
                  onChange={(e) => handleQuantityChange(e?.target?.value)}
                  min="1"
                  className="w-20"
                />
              ) : (
                <p className="text-sm font-body font-semibold text-foreground">
                  {item?.quantity}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs caption text-muted-foreground mb-1">Скидка</p>
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={editedItem?.discount}
                    onChange={(e) => handleDiscountChange(e?.target?.value)}
                    min="0"
                    max="100"
                    className="w-16"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              ) : (
                <p className="text-sm font-body font-semibold text-foreground">
                  {item?.discount}%
                </p>
              )}
            </div>

            <div>
              <p className="text-xs caption text-muted-foreground mb-1">Итого</p>
              <p className="text-sm md:text-base font-body font-bold text-primary whitespace-nowrap">
                {(isEditing ? editedItem?.subtotal : item?.subtotal)?.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2 lg:flex-col lg:gap-2">
            {isEditing ? (
              <>
                <Button variant="default" size="sm" iconName="Check" onClick={handleSave}>
                  Сохранить
                </Button>
                <Button variant="outline" size="sm" iconName="X" onClick={handleCancel}>
                  Отмена
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                iconName="Edit"
                onClick={() => setIsEditing(true)}
              >
                Изменить
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EstimateLineItem;