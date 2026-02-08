'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  X,
  Send,
  Paperclip,
  Eye,
  Trash2,
  AlertCircle,
  Check,
  Loader2,
  Users,
  FileText,
  Download,
  Maximize2,
  Minimize2,
  Plus,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

// ============================================================
// Types
// ============================================================

export interface Recipient {
  id: string;
  email: string;
  name?: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  content: string; // Base64
  type: string;
  size: number;
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

// ============================================================
// Constants
// ============================================================

const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024; // 25MB
const ACCEPTED_FILE_TYPES = [
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

// Email signature that will be automatically appended to emails
const EMAIL_SIGNATURE = `

--
Epackage Lab (イーパックラボ)
info@epackage-lab.com | 050-1793-6500
本社：兵庫県明石市上ノ丸2-11-21
https://epackage-lab.com`;

const ANIMATION_VARIANTS = {
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
        type: 'spring',
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

// ============================================================
// Helper Functions
// ============================================================

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getFileIconColor(type: string): string {
  if (type.startsWith('image/')) return 'text-purple-600 bg-purple-100';
  if (type.includes('pdf')) return 'text-red-600 bg-red-100';
  if (type.includes('word') || type.includes('document')) return 'text-blue-600 bg-blue-100';
  if (type.includes('excel') || type.includes('spreadsheet')) return 'text-green-600 bg-green-100';
  return 'text-gray-600 bg-gray-100';
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================================
// Sub-Components
// ============================================================

// Recipient Chip Component
interface RecipientChipProps {
  recipient: Recipient;
  onRemove: () => void;
  disabled?: boolean;
}

const RecipientChip: React.FC<RecipientChipProps> = React.memo(({ recipient, onRemove, disabled }) => (
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

// Attachment Card Component
interface AttachmentCardProps {
  attachment: EmailAttachment;
  onRemove: () => void;
  disabled?: boolean;
}

const AttachmentCard: React.FC<AttachmentCardProps> = React.memo(({ attachment, onRemove, disabled }) => (
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

// ============================================================
// Main EmailComposer Component
// ============================================================

export const EmailComposer: React.FC<EmailComposerProps> = ({
  open,
  onOpenChange,
  recipients: initialRecipients = [],
  defaultSubject = '',
  defaultMessage = '',
  onSuccess,
}) => {
  // State
  const [mode, setMode] = useState<EmailComposerMode>('compose');
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>(initialRecipients);
  const [ccRecipients, setCcRecipients] = useState<Recipient[]>([]);
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultMessage);
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showManualInput, setShowManualInput] = useState<'to' | 'cc' | null>(null);
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync recipients when prop changes
  React.useEffect(() => {
    setSelectedRecipients(initialRecipients);
  }, [initialRecipients]);

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  };

  // Add recipient
  const addRecipient = useCallback((recipient: Recipient) => {
    setSelectedRecipients(prev => {
      if (prev.find(r => r.email === recipient.email)) {
        return prev;
      }
      return [...prev, recipient];
    });
  }, []);

  // Remove recipient
  const removeRecipient = useCallback((email: string) => {
    setSelectedRecipients(prev => prev.filter(r => r.email !== email));
  }, []);

  // Add CC recipient
  const addCcRecipient = useCallback((recipient: Recipient) => {
    setCcRecipients(prev => {
      if (prev.find(r => r.email === recipient.email)) {
        return prev;
      }
      return [...prev, recipient];
    });
  }, []);

  // Remove CC recipient
  const removeCcRecipient = useCallback((email: string) => {
    setCcRecipients(prev => prev.filter(r => r.email !== email));
  }, []);

  // Handle manual email input
  const handleManualEmailAdd = useCallback(() => {
    const email = manualEmail.trim();
    const name = manualName.trim();

    if (!email) {
      setErrorMessage('メールアドレスを入力してください');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('有効なメールアドレスを入力してください');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const recipient: Recipient = {
      id: `${showManualInput}-${Date.now()}`,
      email,
      name: name || undefined,
    };

    if (showManualInput === 'to') {
      addRecipient(recipient);
    } else if (showManualInput === 'cc') {
      addCcRecipient(recipient);
    }

    // Reset and close modal
    setManualEmail('');
    setManualName('');
    setShowManualInput(null);
  }, [manualEmail, manualName, showManualInput, addRecipient, addCcRecipient]);

  // Open manual input modal
  const openManualInput = useCallback((type: 'to' | 'cc') => {
    setShowManualInput(type);
    setManualEmail('');
    setManualName('');
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newAttachments: EmailAttachment[] = [];

    for (const file of files) {
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        setErrorMessage(`対応していないファイル形式: ${file.name}`);
        setTimeout(() => setErrorMessage(''), 3000);
        continue;
      }

      if (file.size > MAX_ATTACHMENT_SIZE) {
        setErrorMessage(`ファイルサイズが大きすぎます: ${file.name} (最大25MB)`);
        setTimeout(() => setErrorMessage(''), 3000);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        newAttachments.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          filename: file.name,
          content: base64,
          type: file.type,
          size: file.size,
        });
      } catch (error) {
        console.error('Failed to process file:', error);
        setErrorMessage(`ファイルの処理に失敗しました: ${file.name}`);
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Remove attachment
  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }, []);

  // Send email
  const handleSend = useCallback(async () => {
    if (selectedRecipients.length === 0) {
      setErrorMessage('宛先を選択してください');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (!subject.trim()) {
      setErrorMessage('件名を入力してください');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (!message.trim()) {
      setErrorMessage('本文を入力してください');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setSending(true);
    setSendStatus('idle');

    // Append email signature to the message
    const messageWithSignature = message.trim() + EMAIL_SIGNATURE;

    try {
      const response = await fetch('/api/admin/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'custom',
          to: selectedRecipients.map(r => ({
            email: r.email,
            name: r.name,
          })),
          cc: ccRecipients.map(r => ({
            email: r.email,
            name: r.name,
          })),
          subject: subject.trim(),
          text: messageWithSignature,
          attachments: attachments.map(a => ({
            filename: a.filename,
            content: a.content,
            type: a.type,
          })),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSendStatus('success');

        setTimeout(() => {
          setSelectedRecipients([]);
          setCcRecipients([]);
          setSubject('');
          setMessage('');
          setAttachments([]);
          setSendStatus('idle');
          onOpenChange(false);
          onSuccess?.();
        }, 2000);
      } else {
        setSendStatus('error');
        setErrorMessage(result.message || result.error || 'メールの送信に失敗しました');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      setSendStatus('error');
      setErrorMessage('メールの送信に失敗しました。しばらく待ってから再試行してください');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setSending(false);
    }
  }, [selectedRecipients, ccRecipients, subject, message, attachments, onOpenChange, onSuccess]);

  // Reset form
  const handleReset = useCallback(() => {
    setSelectedRecipients(initialRecipients);
    setCcRecipients([]);
    setSubject(defaultSubject);
    setMessage(defaultMessage);
    setAttachments([]);
    setSendStatus('idle');
    setErrorMessage('');
  }, [initialRecipients, defaultSubject, defaultMessage]);

  // Close dialog
  const handleClose = useCallback(() => {
    if (!sending) {
      onOpenChange(false);
      handleReset();
    }
  }, [sending, onOpenChange, handleReset]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    for (const file of files) {
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        setErrorMessage(`対応していないファイル形式: ${file.name}`);
        setTimeout(() => setErrorMessage(''), 3000);
        continue;
      }

      if (file.size > MAX_ATTACHMENT_SIZE) {
        setErrorMessage(`ファイルサイズが大きすぎます: ${file.name} (最大25MB)`);
        setTimeout(() => setErrorMessage(''), 3000);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        setAttachments(prev => [...prev, {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          filename: file.name,
          content: base64,
          type: file.type,
          size: file.size,
        }]);
      } catch (error) {
        console.error('Failed to process file:', error);
        setErrorMessage(`ファイルの処理に失敗しました: ${file.name}`);
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={ANIMATION_VARIANTS.overlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={ANIMATION_VARIANTS.content}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                "w-full max-w-4xl max-h-[90vh] overflow-hidden",
                "bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30",
                "border-2 border-blue-200/50 rounded-2xl shadow-2xl",
                "flex flex-col",
                isExpanded && "max-w-6xl"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      メール作成
                    </h2>
                    <p className="text-sm text-gray-600 mt-0.5">
                      顧客へのカスタムメールを作成・送信
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 rounded-lg hover:bg-white/80 transition-colors"
                    title={isExpanded ? "縮小" : "拡大"}
                  >
                    {isExpanded ? (
                      <Minimize2 className="w-5 h-5 text-gray-600" />
                    ) : (
                      <Maximize2 className="w-5 h-5 text-gray-600" />
                    )}
                  </motion.button>

                  {mode === 'compose' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMode('preview')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg",
                        "bg-gradient-to-r from-indigo-500 to-purple-600",
                        "text-white font-medium shadow-md hover:shadow-lg",
                        "transition-all"
                      )}
                    >
                      <Eye className="w-4 h-4" />
                      プレビュー
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClose}
                    disabled={sending}
                    className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 text-gray-500 transition-all disabled:opacity-50"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pt-4"
                  >
                    <div className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl",
                      sendStatus === 'error'
                        ? "bg-red-50 text-red-700 border-2 border-red-200"
                        : "bg-yellow-50 text-yellow-700 border-2 border-yellow-200"
                    )}>
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{errorMessage}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {mode === 'compose' ? (
                  <>
                    {/* Recipients Section */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <Users className="w-4 h-4" />
                        宛先
                        <Badge variant="info" size="sm">
                          {selectedRecipients.length}
                        </Badge>
                      </label>

                      <div className="min-h-[60px] p-4 rounded-xl border-2 border-dashed border-gray-300 bg-white/50 hover:bg-white hover:border-blue-400 transition-all shadow-sm">
                        <AnimatePresence mode="popLayout">
                          {selectedRecipients.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedRecipients.map(recipient => (
                                <RecipientChip
                                  key={recipient.email}
                                  recipient={recipient}
                                  onRemove={() => removeRecipient(recipient.email)}
                                  disabled={sending}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center text-gray-400 text-sm py-2">
                              下のボタンをクリックして宛先を追加
                            </div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            addRecipient({ id: '1', email: 'test@example.com', name: 'テストユーザー' });
                          }}
                          disabled={sending}
                          className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-sm font-semibold text-gray-700 disabled:opacity-50 shadow-sm"
                        >
                          <Users className="w-4 h-4 inline mr-2" />
                          顧客から選択
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => openManualInput('to')}
                          disabled={sending}
                          className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-sm font-semibold text-gray-700 disabled:opacity-50 shadow-sm"
                        >
                          <Plus className="w-4 h-4 inline mr-2" />
                          手動追加
                        </motion.button>
                      </div>
                    </div>

                    {/* CC Recipients Section */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <Copy className="w-4 h-4" />
                        CC (カーボンコピー)
                        <Badge variant="info" size="sm">
                          {ccRecipients.length}
                        </Badge>
                      </label>

                      <div className="min-h-[60px] p-4 rounded-xl border-2 border-dashed border-gray-300 bg-white/50 hover:bg-white hover:border-blue-400 transition-all shadow-sm">
                        <AnimatePresence mode="popLayout">
                          {ccRecipients.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {ccRecipients.map(recipient => (
                                <RecipientChip
                                  key={recipient.email}
                                  recipient={recipient}
                                  onRemove={() => removeCcRecipient(recipient.email)}
                                  disabled={sending}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center text-gray-400 text-sm py-2">
                              CC宛先を追加（オプション）
                            </div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => openManualInput('cc')}
                          disabled={sending}
                          className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-sm font-semibold text-gray-700 disabled:opacity-50 shadow-sm"
                        >
                          <Plus className="w-4 h-4 inline mr-2" />
                          CCを追加
                        </motion.button>
                      </div>
                    </div>

                    {/* Subject Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">
                        件名
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        disabled={sending}
                        placeholder="件名を入力してください..."
                        className={cn(
                          "w-full px-4 py-3 rounded-xl border-2 font-medium",
                          "border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20",
                          "transition-all duration-200 shadow-sm",
                          "disabled:bg-gray-100 disabled:cursor-not-allowed"
                        )}
                      />
                    </div>

                    {/* Message Editor */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">
                        本文
                      </label>
                      <div className="relative">
                        <textarea
                          ref={textareaRef}
                          value={message}
                          onChange={handleTextareaChange}
                          disabled={sending}
                          placeholder="メール本文を入力してください..."
                          rows={8}
                          className={cn(
                            "w-full px-4 py-3 rounded-xl border-2 resize-none font-medium",
                            "border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20",
                            "transition-all duration-200 shadow-sm",
                            "disabled:bg-gray-100 disabled:cursor-not-allowed",
                            "min-h-[200px] max-h-[300px]"
                          )}
                        />

                        <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-lg">
                          {message.length} 文字
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
                        <span>改行はそのまま反映されます</span>
                      </div>
                    </div>

                    {/* Attachments Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                          <Paperclip className="w-4 h-4" />
                          添付ファイル
                          {attachments.length > 0 && (
                            <Badge variant="info" size="sm">
                              {attachments.length}
                            </Badge>
                          )}
                        </label>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => fileInputRef.current?.click()}
                          disabled={sending}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-semibold disabled:opacity-50"
                        >
                          <Paperclip className="w-4 h-4" />
                          ファイルを追加
                        </motion.button>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={ACCEPTED_FILE_TYPES.join(',')}
                        onChange={handleFileSelect}
                        disabled={sending}
                        className="hidden"
                      />

                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={cn(
                          "relative p-6 rounded-xl border-2 border-dashed",
                          "bg-gradient-to-br from-gray-50 to-blue-50/30",
                          "border-gray-300 hover:border-blue-400",
                          "transition-all duration-200",
                          sending && "opacity-50 pointer-events-none"
                        )}
                      >
                        <div className="flex flex-col items-center justify-center text-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Download className="w-6 h-6 text-blue-600" />
                          </div>
                          <p className="text-sm text-gray-600 font-medium">
                            ファイルをドラッグ＆ドロップ、または上のボタンで選択
                          </p>
                          <p className="text-xs text-gray-500">
                            対応ファイル: PDF, Word, Excel, 画像 (最大25MB)
                          </p>
                        </div>
                      </div>

                      <AnimatePresence mode="popLayout">
                        {attachments.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {attachments.map(attachment => (
                              <AttachmentCard
                                key={attachment.id}
                                attachment={attachment}
                                onRemove={() => removeAttachment(attachment.id)}
                                disabled={sending}
                              />
                            ))}
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  /* Preview Mode */
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 text-white">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5" />
                          <span className="font-semibold">メールプレビュー</span>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div>
                          <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">宛先</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedRecipients.map(recipient => (
                              <span
                                key={recipient.email}
                                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                              >
                                {recipient.name || recipient.email}
                                {recipient.name && ` <${recipient.email}>`}
                              </span>
                            ))}
                          </div>
                        </div>

                        {ccRecipients.length > 0 && (
                          <div>
                            <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">CC</div>
                            <div className="flex flex-wrap gap-2">
                              {ccRecipients.map(recipient => (
                                <span
                                  key={recipient.email}
                                  className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium"
                                >
                                  {recipient.name || recipient.email}
                                  {recipient.name && ` <${recipient.email}>`}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">件名</div>
                          <div className="text-gray-900 font-semibold">{subject}</div>
                        </div>

                        {attachments.length > 0 && (
                          <div>
                            <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">添付ファイル</div>
                            <div className="flex flex-wrap gap-2">
                              {attachments.map(attachment => (
                                <div
                                  key={attachment.id}
                                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm"
                                >
                                  <Paperclip className="w-4 h-4 text-gray-600" />
                                  <span className="font-medium">{attachment.filename}</span>
                                  <span className="text-xs text-gray-500">
                                    ({formatFileSize(attachment.size)})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="border-t pt-4">
                          <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">本文</div>
                          <div
                            className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-4 whitespace-pre-wrap"
                          >
                            {message ? (
                              <>
                                {message}
                                <div className="mt-4 pt-4 border-t border-gray-300 text-xs text-gray-600">
                                  <div className="font-semibold">Epackage Lab (イーパックラボ)</div>
                                  <div>info@epackage-lab.com | 050-1793-6500</div>
                                  <div>本社：兵庫県明石市上ノ丸2-11-21</div>
                                  <div>https://epackage-lab.com</div>
                                </div>
                              </>
                            ) : (
                              <span className="text-gray-400">内容がありません</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMode('compose')}
                      className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-semibold"
                    >
                      編集に戻る
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClose}
                    disabled={sending}
                    className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
                  >
                    キャンセル
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReset}
                    disabled={sending || sendStatus === 'success'}
                    className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
                  >
                    リセット
                  </motion.button>
                </div>

                <AnimatePresence mode="wait">
                  {sendStatus === 'success' ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-2 px-6 py-2 bg-green-100 text-green-700 rounded-xl font-semibold shadow-lg"
                    >
                      <Check className="w-5 h-5" />
                      送信成功
                    </motion.div>
                  ) : sendStatus === 'error' ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-2 px-6 py-2 bg-red-100 text-red-700 rounded-xl font-semibold shadow-lg"
                    >
                      <AlertCircle className="w-5 h-5" />
                      送信失敗
                    </motion.div>
                  ) : (
                    <motion.button
                      key="send"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSend}
                      disabled={sending}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2 rounded-xl font-semibold shadow-lg",
                        "bg-gradient-to-r from-blue-500 to-indigo-600",
                        "hover:from-blue-600 hover:to-indigo-700",
                        "text-white",
                        "disabled:opacity-70 disabled:cursor-not-allowed",
                        "transition-all duration-200"
                      )}
                    >
                      {sending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          送信中...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          メール送信
                        </>
                      )}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Manual Email Input Modal */}
          <AnimatePresence>
            {showManualInput && (
              <>
                <motion.div
                  variants={ANIMATION_VARIANTS.overlay}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={() => setShowManualInput(null)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                />
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                  <motion.div
                    variants={ANIMATION_VARIANTS.content}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <h3 className="text-lg font-bold text-gray-900">
                        {showManualInput === 'to' ? '宛先を追加' : 'CCを追加'}
                      </h3>
                      <button
                        onClick={() => setShowManualInput(null)}
                        className="p-1 rounded-lg hover:bg-white/80 transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">
                          メールアドレス <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={manualEmail}
                          onChange={(e) => setManualEmail(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleManualEmailAdd();
                            }
                          }}
                          placeholder="example@domain.com"
                          autoFocus
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">
                          名前（オプション）
                        </label>
                        <input
                          type="text"
                          value={manualName}
                          onChange={(e) => setManualName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleManualEmailAdd();
                            }
                          }}
                          placeholder="山田 太郎"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium"
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowManualInput(null)}
                          className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                        >
                          キャンセル
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleManualEmailAdd}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all font-semibold shadow-lg"
                        >
                          <Plus className="w-4 h-4 inline mr-2" />
                          追加
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmailComposer;
