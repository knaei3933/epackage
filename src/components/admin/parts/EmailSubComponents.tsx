/**
 * Sub-components for EmailComposer.
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Recipient, EmailAttachment } from './emailTypes';
import { ANIMATION_VARIANTS } from './emailTypes';
import { formatFileSize, getFileIconColor } from './emailUtils';

interface RecipientChipProps {
  recipient: Recipient;
  onRemove: () => void;
  disabled?: boolean;
}

export const RecipientChip: React.FC<RecipientChipProps> = React.memo(({ recipient, onRemove, disabled }) => (
  <motion.div
    variants={ANIMATION_VARIANTS.slideIn}
    initial="hidden"
    animate="visible"
    exit="exit"
    transition={{ duration: 0.2 }}
    className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
      "bg-gradient-to-r from-blue-50 to-indigo-50",
      "border border-blue-200",
      "group shadow-sm",
      disabled && "opacity-60"
    )}
  >
    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0 shadow-sm">
      {(recipient.name || recipient.email)[0].toUpperCase()}
    </div>
    <div className="flex flex-col min-w-0">
      {recipient.name && (
        <span className="text-xs font-semibold text-gray-900 truncate">
          {recipient.name}
        </span>
      )}
      <span className="text-xs text-gray-600 truncate">
        {recipient.email}
      </span>
    </div>
    {!disabled && (
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 p-1 rounded-full hover:bg-white/70 transition-colors"
        aria-label="Remove recipient"
      >
        <X className="w-3.5 h-3.5 text-gray-500 group-hover:text-red-600" />
      </button>
    )}
  </motion.div>
));
RecipientChip.displayName = 'RecipientChip';

interface AttachmentCardProps {
  attachment: EmailAttachment;
  onRemove: () => void;
  disabled?: boolean;
}

export const AttachmentCard: React.FC<AttachmentCardProps> = React.memo(({ attachment, onRemove, disabled }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.2 }}
    className={cn(
      "relative group p-3 rounded-lg border-2",
      "bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50/30",
      "border-gray-200 hover:border-blue-300",
      "transition-all duration-200 shadow-sm hover:shadow-md",
      disabled && "opacity-60"
    )}
  >
    <div className="flex items-start gap-3">
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm",
        getFileIconColor(attachment.type)
      )}>
        <FileText className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {attachment.filename}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {formatFileSize(attachment.size)}
        </p>
      </div>
      {!disabled && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-gray-400 transition-all"
          aria-label="Remove attachment"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      )}
    </div>
  </motion.div>
));
AttachmentCard.displayName = 'AttachmentCard';
