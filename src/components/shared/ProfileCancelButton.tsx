/**
 * Profile Cancel Button Component
 * プロフィール編集キャンセルボタン
 *
 * Shared cancel button component with client-side reload functionality
 */

'use client';

import React from 'react';

export interface ProfileCancelButtonProps {
  className?: string;
  label?: string;
}

/**
 * Cancel button component with client-side reload functionality
 */
export function ProfileCancelButton({
  className = '',
  label = 'キャンセル'
}: ProfileCancelButtonProps) {
  const handleCancel = () => {
    window.location.reload();
  };

  return (
    <button
      type="button"
      onClick={handleCancel}
      className={className}
    >
      {label}
    </button>
  );
}

export default ProfileCancelButton;
