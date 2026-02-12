// UI Components Export

// Layout Components
export { Container } from './Container';
export type { ContainerProps } from './Container';
export { Flex } from './Flex';

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

// Card Component
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
export type { CardProps, CardHeaderProps, CardTitleProps, CardDescriptionProps, CardContentProps, CardFooterProps } from './Card';

// Grid Component
export { Grid, GridItem } from './Grid';
export type { GridProps } from './Grid';
export type { GridItemProps } from './Grid';

export { Input, inputVariants } from './Input';
export type { InputProps } from './Input';

export { Textarea } from './Textarea';
export type { TextareaProps } from './Textarea';

export { Select, selectVariants } from './Select';
export type { SelectOption } from './Select';

// Typography Components
export { Badge } from './Badge';
export { StatusBadge } from './Badge';
export { CurrencyBadge } from './Badge';
export { TagBadge } from './Badge';

// Loading States
export { LoadingSpinner } from './LoadingSpinner';
export { FullPageSpinner } from './LoadingSpinner';

// Loading States
export { LoadingState as PageLoading } from './LoadingState';
export { PageLoadingState } from './LoadingState';
export { CardLoadingState } from './LoadingState';
export { InlineLoadingState } from './LoadingState';
export type { LoadingStateProps } from './LoadingState';

// Empty State
export { EmptyState } from './EmptyState';
