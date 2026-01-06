/**
 * Dashboard Components Export
 */

export { SidebarNavigation } from './SidebarNavigation';
export type { SidebarNavigationProps, MenuItem } from './SidebarNavigation';

export { menuItems, addBadgesToMenu } from './menuItems';

export { DashboardHeader } from './DashboardHeader';
export type { DashboardHeaderProps } from './DashboardHeader';

export {
  DashboardStatsCard,
  AnnouncementCard,
  RecentOrdersCard,
  RecentQuotationsCard,
  RecentSamplesCard,
} from './DashboardCards';
export type {
  DashboardStatsCardProps,
  AnnouncementCardProps,
  RecentOrdersCardProps,
  RecentQuotationsCardProps,
  RecentSamplesCardProps,
} from './DashboardCards';

export { OrderList } from './OrderList';
export type { OrderListProps } from './OrderList';

export { DeliveryAddressForm } from './DeliveryAddressForm';
export type { DeliveryAddressFormProps } from './DeliveryAddressForm';

export { BillingAddressForm } from './BillingAddressForm';
export type { BillingAddressFormProps } from './BillingAddressForm';

// Re-export commonly used UI components
export { EmptyState } from '../ui/EmptyState';
export type { EmptyStateProps } from '../ui/EmptyState';
export { FullPageSpinner } from '../ui/LoadingSpinner';
