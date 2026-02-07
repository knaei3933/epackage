// UI Components Export

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

// Layout Components
export { Container, containerVariants } from './Container';
export type { ContainerProps } from './Container';

export { Grid, GridItem, gridVariants, gridItemVariants } from './Grid';
export type { GridProps, GridItemProps } from './Grid';

export { Flex, FlexItem, flexVariants, flexItemVariants } from './Flex';
export type { FlexProps, FlexItemProps } from './Flex';

// Card Components
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants
} from './Card';
export type {
  CardProps,
  CardHeaderProps,
  CardFooterProps
} from './Card';

// Badge Components
export {
  Badge,
  badgeVariants,
  StatusBadge,
  CurrencyBadge,
  TagBadge
} from './Badge';
export type { BadgeProps } from './Badge';

// Avatar Components
export {
  Avatar,
  AvatarFallback,
  AvatarImage
} from './Avatar';

// Empty State Component
export { EmptyState } from './EmptyState';

// Loading Component
export {
  LoadingSpinner,
  PageSpinner,
  ButtonSpinner,
  CardSpinner,
  FullPageSpinner,
} from './LoadingSpinner';
export type { LoadingSpinnerProps } from './LoadingSpinner';

// Loading State Component
export {
  LoadingState,
  PageLoadingState,
  CardLoadingState,
  InlineLoadingState,
} from './LoadingState';
export type { LoadingStateProps } from './LoadingState';

// Wizard Component
export { Wizard } from './Wizard';
export type { WizardProps, WizardStep } from './Wizard';

// Accordion Component
export { AccordionItem, AccordionSection } from './Accordion';
export type { AccordionItemProps, AccordionSectionProps } from './Accordion';

// Dialog Component
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';

// Confirm Modal Component
export {
  ConfirmModal,
  useConfirmModal,
} from './ConfirmModal';
export type { ConfirmModalProps, ConfirmVariant, UseConfirmModalResult } from './ConfirmModal';

// Tabs Component
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from './tabs';