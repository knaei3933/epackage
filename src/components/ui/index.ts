// UI Components Export

// Layout Components
export { Container } from './Container';
export type { ContainerProps } from './Container';

// Catalog Components
export { ProductFAQ } from '../catalog/ProductFAQ';
export { ProductDownloads } from '../catalog/ProductDownloads';
export { ProductRelatedCases } from '../catalog/ProductRelatedCases';
export { ProductCertifications, CertificationBadges } from '../catalog/ProductCertifications';

// Alert Components
export {
  Alert,
  alertVariants,
  AlertTitle,
  AlertDescription,
  DestructiveAlert,
  WarningAlert,
  InfoAlert,
  SuccessAlert,
} from './AlertComponent';
export type { AlertProps, AlertTitleProps, AlertDescriptionProps } from './AlertComponent';

// Animation Components
export { MotionWrapper } from './MotionWrapper';
export type { MotionWrapperProps } from './MotionWrapper';

// Form Components
export { Button, buttonVariants } from './Button';
export type { ButtonProps } from './Button';

export { Input, inputVariants } from './Input';
export type { InputProps } from './Input';

export { Textarea } from './Textarea';
export type { TextareaProps } from './Textarea';

export { Select, selectVariants } from './Select';
export type { SelectOption } from './Select';

// Typography Components
export { Badge } from './Badge';
export { CurrencyBadge } from './CurrencyBadge';
export { TagBadge } from './TagBadge';

// Loading Components
export { LoadingSpinner } from './LoadingSpinner';
export { PageSpinner } from './PageSpinner';
export { ButtonSpinner } from './ButtonSpinner';

// Loading States
export { LoadingState as PageLoading } from './LoadingState';
export type { LoadingStateProps } from './LoadingState';
