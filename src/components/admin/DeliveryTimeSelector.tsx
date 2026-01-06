/**
 * Delivery Time Selector Component
 * Picker for delivery date and time slot
 */

'use client';

import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DeliveryTimeSlot, TIME_SLOT_NAMES } from '@/types/shipment';

interface DeliveryTimeSelectorProps {
  value: {
    date?: string; // YYYY-MM-DD
    timeSlot: DeliveryTimeSlot;
  };
  onChange: (value: { date?: string; timeSlot: DeliveryTimeSlot }) => void;
  minDate?: string;
  disabled?: boolean;
}

export function DeliveryTimeSelector({
  value,
  onChange,
  minDate,
  disabled = false,
}: DeliveryTimeSelectorProps) {
  const [selectedDate, setSelectedDate] = useState(value.date || '');

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    onChange({ ...value, date: date || undefined });
  };

  const handleTimeSlotChange = (timeSlot: DeliveryTimeSlot) => {
    onChange({ ...value, timeSlot });
  };

  return (
    <div className="space-y-3">
      {/* Date Selector */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-gray-700" />
          <label className="text-sm font-medium text-gray-700">配達希望日</label>
        </div>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          min={minDate}
          disabled={disabled}
        />
        <p className="text-xs text-gray-500 mt-1">
          指定なしの場合、最短でお届けします
        </p>
      </div>

      {/* Time Slot Selector */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-gray-700" />
          <label className="text-sm font-medium text-gray-700">配達時間帯</label>
        </div>
        <Select
          value={value.timeSlot}
          onChange={(value) => handleTimeSlotChange(value as DeliveryTimeSlot)}
          disabled={disabled}
          options={Object.values(DeliveryTimeSlot).map((slot) => ({
            value: slot,
            label: TIME_SLOT_NAMES[slot].ja,
          }))}
        />
      </div>

      {/* Preview */}
      {(selectedDate || value.timeSlot !== DeliveryTimeSlot.NONE) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <p className="font-medium text-blue-900 mb-1">配達指定</p>
          {selectedDate && (
            <p className="text-blue-800">
              日付: {new Date(selectedDate).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </p>
          )}
          {value.timeSlot !== DeliveryTimeSlot.NONE && (
            <p className="text-blue-800">
              時間帯: {TIME_SLOT_NAMES[value.timeSlot].ja}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
