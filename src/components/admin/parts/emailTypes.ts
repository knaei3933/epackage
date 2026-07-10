/**
 * Types, constants, and animation variants for EmailComposer.
 */

export interface Recipient {
  id: string;
  email: string;
  name?: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  type: string;
  size: number;
  data?: string;
  content?: string;
}

export interface EmailComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients?: Recipient[];
  defaultSubject?: string;
  defaultMessage?: string;
  onSuccess?: () => void;
}

export type EmailComposerMode = 'compose' | 'preview';

export const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024; // 25MB

export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const EMAIL_SIGNATURE = `

--
Epackage Lab (イーパックラボ)
info@epackage-lab.com | 050-1793-6500
本社：兵庫県加古郡稲美町六分一486
https://epackage-lab.com`;

export const ANIMATION_VARIANTS = {
  overlay: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  content: {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2,
      },
    },
  },
  slideIn: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
};
