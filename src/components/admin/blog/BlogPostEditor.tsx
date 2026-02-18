/**
 * Blog Post Editor Component
 *
 * Split-pane markdown editor with:
 * - Textarea with syntax highlighting
 * - Live preview pane
 * - Toolbar (Bold, Italic, H1-H3, Link, Image, Code)
 * - Drag-drop image support
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MarkdownPreview } from './MarkdownPreview';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Image,
  Code,
  List,
  Quote,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

export interface BlogPostEditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
  onImageUpload?: (file: File) => Promise<{ url: string; alt?: string }>;
  placeholder?: string;
  readOnly?: boolean;
}

interface ToolbarButton {
  icon: React.ReactNode;
  label: string;
  action: () => void;
  shortcut?: string;
}

// ============================================================
// Helper Functions
// ============================================================

function insertMarkdown(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string = '',
  placeholder = ''
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selection = text.substring(start, end);

  const newText = text.substring(0, start) + before + selection + after + text.substring(end);
  const newPosition = start + before.length + selection.length;

  textarea.value = newText;
  textarea.focus();
  textarea.setSelectionRange(newPosition, newPosition);

  // Trigger change event
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

// ============================================================
// Main Component
// ============================================================

export function BlogPostEditor({
  initialContent = '',
  onChange,
  onImageUpload,
  placeholder = 'Markdown形式で本文を入力...',
  readOnly = false,
}: BlogPostEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [showPreview, setShowPreview] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Sync content with parent
  useEffect(() => {
    onChange(content);
  }, [content, onChange]);

  // Handle content change
  const handleChange = (value: string) => {
    setContent(value);
  };

  // Toolbar buttons
  const getToolbarButtons = (): ToolbarButton[] => [
    {
      icon: <Bold className="h-4 w-4" />,
      label: '太字 (Ctrl+B)',
      action: () => {
        if (textareaRef.current) {
          insertMarkdown(textareaRef.current, '**', '**', '太字テキスト');
        }
      },
      shortcut: 'Ctrl+B',
    },
    {
      icon: <Italic className="h-4 w-4" />,
      label: '斜体 (Ctrl+I)',
      action: () => {
        if (textareaRef.current) {
          insertMarkdown(textareaRef.current, '*', '*', '斜体テキスト');
        }
      },
      shortcut: 'Ctrl+I',
    },
    {
      icon: <Heading1 className="h-4 w-4" />,
      label: '見出し1',
      action: () => {
        if (textareaRef.current) {
          insertMarkdown(textareaRef.current, '# ', '', '見出し1');
        }
      },
    },
    {
      icon: <Heading2 className="h-4 w-4" />,
      label: '見出し2',
      action: () => {
        if (textareaRef.current) {
          insertMarkdown(textareaRef.current, '## ', '', '見出し2');
        }
      },
    },
    {
      icon: <Heading3 className="h-4 w-4" />,
      label: '見出し3',
      action: () => {
        if (textareaRef.current) {
          insertMarkdown(textareaRef.current, '### ', '', '見出し3');
        }
      },
    },
    {
      icon: <Link className="h-4 w-4" />,
      label: 'リンク',
      action: () => {
        if (textareaRef.current) {
          insertMarkdown(
            textareaRef.current,
            '[',
            '](https://)',
            'リンクテキスト'
          );
        }
      },
    },
    {
      icon: <Image className="h-4 w-4" />,
      label: '画像',
      action: () => {
        fileInputRef.current?.click();
      },
    },
    {
      icon: <Code className="h-4 w-4" />,
      label: 'コードブロック',
      action: () => {
        if (textareaRef.current) {
          insertMarkdown(
            textareaRef.current,
            '```\n',
            '\n```',
            'コード'
          );
        }
      },
    },
    {
      icon: <List className="h-4 w-4" />,
      label: 'リスト',
      action: () => {
        if (textareaRef.current) {
          insertMarkdown(
            textareaRef.current,
            '- ',
            '',
            'リスト項目'
          );
        }
      },
    },
    {
      icon: <Quote className="h-4 w-4" />,
      label: '引用',
      action: () => {
        if (textareaRef.current) {
          insertMarkdown(
            textareaRef.current,
            '> ',
            '',
            '引用テキスト'
          );
        }
      },
    },
  ];

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const selectionStart = textareaRef.current?.selectionStart || 0;
    const selectionEnd = textareaRef.current?.selectionEnd || 0;

    // Ctrl+B: Bold
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      if (textareaRef.current) {
        insertMarkdown(textareaRef.current, '**', '**', '太字テキスト');
      }
    }

    // Ctrl+I: Italic
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      if (textareaRef.current) {
        insertMarkdown(textareaRef.current, '*', '*', '斜体テキスト');
      }
    }

    // Ctrl+K: Link
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      if (textareaRef.current) {
        insertMarkdown(
          textareaRef.current,
          '[',
          '](https://)',
          'リンクテキスト'
        );
      }
    }

    // Tab: Insert 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      if (textareaRef.current) {
        const text = textareaRef.current.value;
        const newText =
          text.substring(0, selectionStart) + '  ' + text.substring(selectionEnd);
        textareaRef.current.value = newText;
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
          selectionStart + 2;
        textareaRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile && onImageUpload) {
      await uploadImage(imageFile);
    }
  };

  // Handle file input change
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      await uploadImage(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload image
  const uploadImage = async (file: File) => {
    if (!onImageUpload) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const result = await onImageUpload(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Insert image markdown
      if (textareaRef.current) {
        const imageMarkdown = result.alt
          ? `![${result.alt}](${result.url})`
          : `![](${result.url})`;
        insertMarkdown(textareaRef.current, imageMarkdown, '', '');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('画像のアップロードに失敗しました。');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Sync scroll between editor and preview
  const handleEditorScroll = () => {
    if (!editorRef.current || !previewRef.current) return;

    const editor = editorRef.current;
    const preview = previewRef.current;

    const editorScrollRatio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
    preview.scrollTop = editorScrollRatio * (preview.scrollHeight - preview.clientHeight);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      {!readOnly && (
        <div className="border-b border-border-light bg-bg-primary px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 flex-wrap">
              {getToolbarButtons().map((btn, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="ghost"
                  onClick={btn.action}
                  title={`${btn.label}${btn.shortcut ? ` (${btn.shortcut})` : ''}`}
                  className="h-8 px-2"
                >
                  {btn.icon}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Upload Progress */}
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-text-tertiary">
                  <span>アップロード中...</span>
                  <span className="w-20 bg-bg-secondary rounded-full h-2 overflow-hidden">
                    <span
                      className="bg-brixa-500 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
              )}

              {/* Preview Toggle */}
              <div className="flex items-center border border-border-light rounded-md overflow-hidden">
                <Button
                  size="sm"
                  variant={!showPreview ? 'default' : 'ghost'}
                  onClick={() => setShowPreview(false)}
                  className="h-8 rounded-none"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  編集
                </Button>
                <Button
                  size="sm"
                  variant={showPreview ? 'default' : 'ghost'}
                  onClick={() => setShowPreview(true)}
                  className="h-8 rounded-none"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  プレビュー
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor & Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        {showPreview ? (
          <>
            {/* Split View */}
            <div
              ref={editorRef}
              className="flex-1 overflow-auto border-r border-border-light"
              onScroll={handleEditorScroll}
            >
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                placeholder={placeholder}
                readOnly={readOnly}
                className={cn(
                  'w-full h-full p-4 resize-none font-mono text-sm leading-relaxed',
                  'focus:outline-none',
                  isDragging && 'bg-brixa-50',
                  readOnly && 'bg-bg-secondary'
                )}
                style={{
                  minHeight: '100%',
                  fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Fira Code", "Droid Sans Mono", "Source Code Pro", monospace',
                }}
              />
              {isDragging && (
                <div className="absolute inset-0 bg-brixa-100 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <Image className="h-12 w-12 mx-auto mb-2 text-brixa-500" />
                    <p className="text-brixa-700 font-medium">画像をドロップ</p>
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            <div
              ref={previewRef}
              className="flex-1 overflow-auto bg-white"
            >
              <div className="p-6">
                <MarkdownPreview content={content} />
              </div>
            </div>
          </>
        ) : (
          /* Editor Only */
          <div
            ref={editorRef}
            className="flex-1 overflow-auto"
            onScroll={handleEditorScroll}
          >
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              placeholder={placeholder}
              readOnly={readOnly}
              className={cn(
                'w-full h-full p-4 resize-none font-mono text-sm leading-relaxed',
                'focus:outline-none',
                isDragging && 'bg-brixa-50',
                readOnly && 'bg-bg-secondary'
              )}
              style={{
                minHeight: '100%',
                fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Fira Code", "Droid Sans Mono", "Source Code Pro", monospace',
              }}
            />
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Status Bar */}
      <div className="border-t border-border-light bg-bg-secondary px-4 py-1 flex items-center justify-between text-xs text-text-tertiary">
        <div>
          {content.length} 文字
          {content.split('\n').length} 行
        </div>
        <div className="flex items-center gap-3">
          <span>
            読了時間: 約 {Math.max(1, Math.ceil(content.length / 400))} 分
          </span>
        </div>
      </div>
    </div>
  );
}

// Import cn utility
import { cn } from '@/lib/utils';
