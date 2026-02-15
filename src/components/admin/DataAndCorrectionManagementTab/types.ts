/**
 * Types for DataAndCorrectionManagementTab
 */

// =====================================================
// Design Revision Types
// =====================================================

export interface DesignRevision {
  id: string;
  order_id: string;
  revision_number: number;
  preview_image_url?: string;
  original_file_url?: string;
  partner_comment?: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
}

// =====================================================
// File Types
// =====================================================

export interface OrderFile {
  id: string;
  order_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  uploaded_at: string;
  uploader_id: string;
  category: 'design' | 'specification' | 'other';
  is_required: boolean;
}

// =====================================================
// Comment Types
// =====================================================

export interface OrderComment {
  id: string;
  order_id: string;
  content: string;
  comment_type: 'general' | 'design' | 'production' | 'shipping' | 'correction' | 'internal';
  author_id: string;
  author_role: 'customer' | 'admin' | 'korean_member' | 'production';
  is_internal: boolean;
  visibility?: 'all' | 'admin_only' | 'korean_only';
  attachments: string[];
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

// =====================================================
// Props Types
// =====================================================

export interface DataAndCorrectionManagementTabProps {
  order: {
    id: string;
    // Add other order properties as needed
  };
  orderId: string;
  adminNotes: string;
  onAdminNotesChange: (notes: string) => void;
  onUpdateNotes: () => void;
  onSendToKorea: () => void;
  sendingToKorea: boolean;
  koreaMessage: { type: 'success' | 'error'; text: string } | null;
  fetchFn?: typeof fetch;
}

// =====================================================
// Korea Send Section Types
// =====================================================

export interface KoreaSendStatus {
  sent: boolean;
  sent_at?: string;
  sent_by?: string;
  message_sent?: string;
}
