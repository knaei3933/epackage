/**
 * Admin Settings Type Definitions
 */

export interface SettingValue {
  value: number;
  description: string;
  unit: string;
  originalValue?: number;
  dbCategory?: string;
  isActive?: boolean;
}

export interface CategoryData {
  [key: string]: SettingValue;
}

export interface CustomerMarkupData {
  id: string;
  email: string;
  fullName?: string | null;
  companyName?: string | null;
  role: string;
  markupRate: number;
  markupRateNote?: string | null;
  createdAt: string;
}

export type TabKey =
  | 'film_material'
  | 'pouch_processing'
  | 'printing'
  | 'lamination'
  | 'slitter'
  | 'exchange_rate'
  | 'delivery'
  | 'production'
  | 'pricing'
  | 'designer'
  | 'email'
  | 'integrations';

export interface SettingGroup {
  title: string;
  description: string;
  icon: any;
  keywords: string[];
  settingKeys?: string[];
}
