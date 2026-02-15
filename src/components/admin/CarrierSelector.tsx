/**
 * Carrier Selector Component
 * Dropdown for selecting shipping carrier
 */

'use client';

import { Truck } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { CarrierType, CARRIER_NAMES } from '@/types/shipment';

interface CarrierSelectorProps {
  value: CarrierType;
  onChange: (carrier: CarrierType) => void;
  disabled?: boolean;
  className?: string;
}

export function CarrierSelector({ value, onChange, disabled, className }: CarrierSelectorProps) {
  const options = Object.values(CarrierType).map((carrier) => ({
    value: carrier,
    label: `${CARRIER_NAMES[carrier].ja} (${CARRIER_NAMES[carrier].en})`,
  }));

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <Truck className="w-4 h-4 text-gray-700" />
        <label className="text-sm font-medium text-gray-700">配送業者</label>
      </div>
      <Select
        value={value}
        onChange={(value) => onChange(value as CarrierType)}
        disabled={disabled}
        className="w-full"
        options={options}
      />
    </div>
  );
}
