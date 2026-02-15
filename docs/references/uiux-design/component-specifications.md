# 워크플로우 UI 컴포넌트 상세 명세서

## 1. WorkflowTimeline 컴포넌트

### 1.1 컴포넌트 개요

**용途:** 10단계 B2B 주문 프로세스의 진척도를 시각적으로 표시

**사용 위치:**
- 주문 상세 페이지 (/member/orders/[id])
- 관리자 주문 관리 페이지 (/admin/orders/[id])
- 대시보드 요약 카드

### 1.2 인터페이스 정의

```typescript
// src/components/workflow/WorkflowTimeline.tsx
interface WorkflowTimelineProps {
  /** 현재 단계 (1-10) */
  currentStep: number;

  /** 완료된 단계 배열 */
  completedSteps: number[];

  /** 차단된 단계 배열 */
  blockedSteps?: number[];

  /** 단계 정보 배열 */
  steps: WorkflowStep[];

  /** 레이아웃 방향 */
  variant?: 'horizontal' | 'vertical';

  /** 클릭 가능 여부 */
  clickable?: boolean;

  /** 단계 클릭 핸들러 */
  onStepClick?: (step: WorkflowStep) => void;

  /** 반응형 모드 */
  responsive?: boolean;

  /** 컴팩트 모드 (요약 카드용) */
  compact?: boolean;

  /** 클래스명 */
  className?: string;
}

interface WorkflowStep {
  /** 단계 ID */
  id: string;

  /** 단계 번호 (1-10) */
  number: number;

  /** 단계 제목 */
  title: string;

  /** 단계 설명 */
  description?: string;

  /** 아이콘 */
  icon?: React.ReactNode;

  /** 완료일 */
  completedDate?: string;

  /** 링크 */
  href?: string;

  /** 상태 */
  status: 'completed' | 'current' | 'pending' | 'blocked';
}

// 색상 테마
interface TimelineTheme {
  completed: string;
  current: string;
  pending: string;
  blocked: string;
  lineCompleted: string;
  linePending: string;
}
```

### 1.3 스타일 명세

```css
/* 수평 타임라인 (데스크톱) */
.timeline-horizontal {
  display: flex;
  align-items: center;
  gap: 0;
  overflow-x: auto;
  padding: 1rem 0;
  scroll-behavior: smooth;
}

.timeline-horizontal::-webkit-scrollbar {
  height: 4px;
}

.timeline-horizontal::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

/* 수직 타임라인 (모바일) */
.timeline-vertical {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 단계 스타일 */
.step-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
  z-index: 10;
}

.step-number.completed {
  background: #10b981;
  color: white;
  border: 2px solid #10b981;
}

.step-number.current {
  background: #3b82f6;
  color: white;
  border: 2px solid #3b82f6;
  animation: pulse 2s infinite;
}

.step-number.pending {
  background: white;
  color: #9ca3af;
  border: 2px solid #e5e7eb;
}

.step-number.blocked {
  background: #fef2f2;
  color: #ef4444;
  border: 2px solid #fecaca;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
}

/* 연결선 */
.step-line {
  position: absolute;
  height: 2px;
  background: #e5e7eb;
  top: 20px;
  left: 50%;
  width: 100%;
  z-index: 1;
}

.step-line.completed {
  background: #10b981;
}

/* 텍스트 스타일 */
.step-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin-top: 0.5rem;
  text-align: center;
}

.step-description {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
  margin-top: 0.25rem;
  max-width: 150px;
}

/* 호버 효과 */
.step-item.clickable {
  cursor: pointer;
}

.step-item.clickable:hover .step-number {
  transform: scale(1.1);
}

/* 툴팁 */
.step-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 100;
}

.step-item:hover .step-tooltip {
  opacity: 1;
  visibility: visible;
}

/* 반응형 */
@media (max-width: 768px) {
  .step-item {
    min-width: 80px;
  }

  .step-number {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }

  .step-title {
    font-size: 0.75rem;
  }

  .step-description {
    display: none;
  }
}
```

### 1.4 사용 예시

```tsx
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

function OrderDetailPage() {
  const steps: WorkflowStep[] = [
    {
      id: 'registration',
      number: 1,
      title: '회원가입',
      description: '기업 회원가입 완료',
      status: 'completed',
      icon: <CheckCircle className="w-4 h-4" />,
      completedDate: '2024-12-01',
    },
    {
      id: 'quotation',
      number: 2,
      title: '견적요청',
      description: '견적서 요청 및 승인',
      status: 'completed',
      icon: <CheckCircle className="w-4 h-4" />,
      completedDate: '2024-12-05',
    },
    {
      id: 'order',
      number: 3,
      title: '주문',
      description: '주문 확정',
      status: 'completed',
      icon: <CheckCircle className="w-4 h-4" />,
      completedDate: '2024-12-10',
    },
    {
      id: 'data-entry',
      number: 4,
      title: '데이터입고',
      description: 'AI/PDF 파일 업로드',
      status: 'current',
      icon: <Clock className="w-4 h-4 animate-pulse" />,
      href: '/member/orders/ORD-001/data-upload',
    },
    {
      id: 'work-order',
      number: 5,
      title: '작업표준서',
      description: '사양서 확인',
      status: 'pending',
    },
    // ... 나머지 단계
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <WorkflowTimeline
        currentStep={4}
        completedSteps={[1, 2, 3]}
        steps={steps}
        variant="horizontal"
        clickable
        onStepClick={(step) => {
          if (step.href) {
            router.push(step.href);
          }
        }}
        responsive
      />
    </div>
  );
}
```

---

## 2. DocumentViewer 컴포넌트

### 2.1 컴포넌트 개요

**용途:** PDF, 이미지 문서 미리보기

**사용 위치:**
- 견적서 상세 (/member/quotations/[id])
- 작업표준서 확인 (/member/orders/[id]/work-order)
- 계약서 서명 (/member/orders/[id]/contract)

### 2.2 인터페이스 정의

```typescript
// src/components/workflow/DocumentViewer.tsx
interface DocumentViewerProps {
  /** 문서 URL */
  url: string;

  /** 문서 타입 */
  type: 'pdf' | 'image';

  /** 문서 제목 */
  title: string;

  /** 다운로드 URL */
  downloadUrl?: string;

  /** 높이 */
  height?: string | number;

  /** 전체 화면 여부 */
  allowFullscreen?: boolean;

  /** 컨트롤 표시 */
  showControls?: boolean;

  /** 확대/축소 가능 */
  allowZoom?: boolean;

  /** 페이지 네비게이션 (PDF) */
  showPageNavigation?: boolean;

  /** 확인 버튼 */
  showConfirmButton?: boolean;

  /** 확인 버튼 텍스트 */
  confirmButtonText?: string;

  /** 확인 핸들러 */
  onConfirm?: () => void;

  /** 로딩 상태 */
  isLoading?: boolean;

  /** 에러 상태 */
  error?: string;

  /** 추가 액션 버튼 */
  actions?: DocumentAction[];

  /** 클래스명 */
  className?: string;
}

interface DocumentAction {
  /** 라벨 */
  label: string;

  /** 아이콘 */
  icon?: React.ReactNode;

  /** 클릭 핸들러 */
  onClick: () => void;

  /** 버튼 변형 */
  variant?: 'primary' | 'secondary' | 'ghost';
}

interface PDFViewerState {
  currentPage: number;
  totalPages: number;
  scale: number;
  rotation: number;
}
```

### 2.3 스타일 명세

```css
/* 문서 뷰어 컨테이너 */
.document-viewer {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

/* 헤더 */
.document-viewer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.document-viewer-title {
  font-weight: 600;
  font-size: 1rem;
  color: #111827;
}

.document-viewer-actions {
  display: flex;
  gap: 0.5rem;
}

/* 컨텐츠 영역 */
.document-viewer-content {
  position: relative;
  flex: 1;
  overflow: auto;
  background: #6b7280;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem;
}

/* PDF 캔버스 */
.pdf-canvas {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  height: auto;
}

/* 이미지 */
.document-image {
  max-width: 100%;
  height: auto;
  border-radius: 0.25rem;
}

/* 컨트롤 바 */
.document-viewer-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-info {
  font-size: 0.875rem;
  color: #6b7280;
}

/* 풀스크린 */
.document-viewer.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  border-radius: 0;
}

/* 로딩 상태 */
.document-viewer-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 에러 상태 */
.document-viewer-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

/* 푸터 */
.document-viewer-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  gap: 0.75rem;
}

/* 반응형 */
@media (max-width: 768px) {
  .document-viewer-controls {
    flex-wrap: wrap;
  }

  .document-viewer-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .document-viewer-content {
    padding: 1rem;
  }
}
```

### 2.4 사용 예시

```tsx
import { DocumentViewer } from '@/components/workflow/DocumentViewer';
import { Download, Maximize, Printer } from 'lucide-react';

function ContractSigningPage() {
  const [scale, setScale] = React.useState(1);
  const [currentPage, setCurrentPage] = React.useState(1);

  const actions: DocumentAction[] = [
    {
      label: '다운로드',
      icon: <Download className="w-4 h-4" />,
      onClick: () => handleDownload(),
      variant: 'ghost',
    },
    {
      label: '인쇄',
      icon: <Printer className="w-4 h-4" />,
      onClick: () => handlePrint(),
      variant: 'ghost',
    },
    {
      label: '전체 화면',
      icon: <Maximize className="w-4 h-4" />,
      onClick: () => toggleFullscreen(),
      variant: 'ghost',
    },
  ];

  return (
    <DocumentViewer
      url="/documents/contract-ORD-001.pdf"
      type="pdf"
      title="계약서 - 주문 #ORD-001"
      downloadUrl="/api/documents/contract-ORD-001/download"
      height="600px"
      allowFullscreen
      showControls
      allowZoom
      showPageNavigation
      showConfirmButton
      confirmButtonText="내용 확인 완료"
      onConfirm={() => handleConfirm()}
      actions={actions}
    />
  );
}
```

---

## 3. FileUploader 컴포넌트

### 3.1 컴포넌트 개요

**용途:** .ai, PDF 파일 업로드 (드래그 앤 드롭)

**사용 위치:**
- 데이터 업로드 페이지 (/member/orders/[id]/data-upload)

### 3.2 인터페이스 정의

```typescript
// src/components/workflow/FileUploader.tsx
interface FileUploaderProps {
  /** 허용 파일 형식 */
  accept: string[];

  /** 최대 파일 크기 (bytes) */
  maxSize: number;

  /** 다중 업로드 가능 */
  multiple?: boolean;

  /** 최대 파일 개수 */
  maxFiles?: number;

  /** 업로드 핸들러 */
  onUpload: (files: File[]) => Promise<UploadResult>;

  /** 제거 핸들러 */
  onRemove?: (fileId: string) => void;

  /** 초기 파일 목록 */
  value?: UploadedFile[];

  /** 드롭 존 텍스트 */
  dropzoneText?: string;

  /** 힌트 텍스트 */
  hint?: string;

  /** 자동 업로드 */
  autoUpload?: boolean;

  /** 프로그레스 표시 */
  showProgress?: boolean;

  /** 프리뷰 표시 */
  showPreview?: boolean;

  /** 클래스명 */
  className?: string;
}

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  preview?: string;
  url?: string;
}

interface UploadResult {
  success: boolean;
  fileId: string;
  url: string;
  error?: string;
}
```

### 3.3 스타일 명세

```css
/* 파일 업로더 */
.file-uploader {
  width: 100%;
}

/* 드롭 존 */
.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  background: #f9fafb;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 200px;
}

.dropzone:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.dropzone.dragover {
  border-color: #3b82f6;
  background: #dbeafe;
}

.dropzone.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 드롭 존 아이콘 */
.dropzone-icon {
  width: 48px;
  height: 48px;
  color: #9ca3af;
  margin-bottom: 1rem;
}

/* 드롭 존 텍스트 */
.dropzone-text {
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.dropzone-hint {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}

/* 파일 목록 */
.file-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* 파일 아이템 */
.file-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  gap: 0.75rem;
}

.file-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 0.25rem;
  color: #6b7280;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  font-size: 0.75rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.file-progress {
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.file-progress-bar {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.file-progress-bar.completed {
  background: #10b981;
}

.file-progress-bar.error {
  background: #ef4444;
}

/* 파일 상태 */
.file-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.file-status.uploading {
  color: #3b82f6;
}

.file-status.success {
  color: #10b981;
}

.file-status.error {
  color: #ef4444;
}

/* 제거 버튼 */
.file-remove {
  color: #ef4444;
  transition: color 0.2s ease;
}

.file-remove:hover {
  color: #dc2626;
}

/* 에러 메시지 */
.file-error {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.25rem;
}

/* 반응형 */
@media (max-width: 768px) {
  .dropzone {
    padding: 2rem 1rem;
    min-height: 150px;
  }

  .file-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .file-remove {
    align-self: flex-end;
  }
}
```

### 3.4 사용 예시

```tsx
import { FileUploader } from '@/components/workflow/FileUploader';
import { Upload, File, CheckCircle, XCircle, X } from 'lucide-react';

function DataUploadPage() {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);

  const handleUpload = async (files: File[]): Promise<UploadResult> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await fetch('/api/orders/ORD-001/upload', {
      method: 'POST',
      body: formData,
    });

    return response.json();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <FileUploader
        accept={['.ai', '.pdf']}
        maxSize={50 * 1024 * 1024} // 50MB
        multiple
        maxFiles={5}
        onUpload={handleUpload}
        onRemove={(fileId) => handleRemove(fileId)}
        value={files}
        dropzoneText=".ai 또는 .pdf 파일을 업로드하세요"
        hint="최대 50MB, 최대 5개 파일"
        autoUpload
        showProgress
        showPreview
      />
    </div>
  );
}
```

---

## 4. SignatureCanvas 컴포넌트

### 4.1 컴포넌트 개요

**용途:** 전자 서명 (터치/마우스)

**사용 위치:**
- 계약서 서명 페이지 (/member/orders/[id]/contract)

### 4.2 인터페이스 정의

```typescript
// src/components/workflow/SignatureCanvas.tsx
interface SignatureCanvasProps {
  /** 캔버스 너비 */
  width?: number;

  /** 캔버스 높이 */
  height?: number;

  /** 저장 핸들러 */
  onSave: (signatureData: SignatureData) => void;

  /** 지우기 핸들러 */
  onClear?: () => void;

  /** 펜 색상 */
  penColor?: string;

  /** 펜 굵기 */
  penWidth?: number;

  /** 배경색 */
  backgroundColor?: string;

  /** 터치 지원 */
  touchAction?: boolean;

  /** 클래스명 */
  className?: string;
}

interface SignatureData {
  /** 서명 이미지 (Data URL) */
  dataUrl: string;

  /** 타임스탬프 */
  timestamp: string;

  /** IP 주소 */
  ipAddress: string;

  /** 사용자 에이전트 */
  userAgent: string;

  /** 캔버스 크기 */
  dimensions: {
    width: number;
    height: number;
  };
}

interface SignatureControls {
  /** 색상 옵션 */
  colors: string[];

  /** 굵기 옵션 */
  widths: number[];

  /** 지우개 모드 */
  eraser: boolean;
}
```

### 4.3 스타일 명세

```css
/* 서명 캔버스 컨테이너 */
.signature-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 600px;
}

/* 캔버스 래퍼 */
.signature-canvas-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  overflow: hidden;
  touch-action: none;
}

.signature-canvas-wrapper:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 캔버스 */
.signature-canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

/* 플레이스홀더 */
.signature-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #9ca3af;
  font-size: 0.875rem;
  pointer-events: none;
  user-select: none;
}

.signature-placeholder.hidden {
  display: none;
}

/* 컨트롤 바 */
.signature-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
}

/* 색상 선택 */
.color-picker {
  display: flex;
  gap: 0.5rem;
}

.color-option {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px white;
}

/* 굵기 선택 */
.width-picker {
  display: flex;
  gap: 0.5rem;
}

.width-option {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.width-option:hover {
  background: #f3f4f6;
}

.width-option.selected {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* 액션 버튼 */
.signature-actions {
  display: flex;
  gap: 0.5rem;
}

.signature-actions button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.signature-clear {
  background: #fef2f2;
  color: #ef4444;
}

.signature-clear:hover {
  background: #fee2e2;
}

.signature-save {
  background: #3b82f6;
  color: white;
}

.signature-save:hover {
  background: #2563eb;
}

.signature-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 힌트 */
.signature-hint {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
}

/* 반응형 */
@media (max-width: 768px) {
  .signature-canvas-wrapper {
    height: 150px;
  }

  .signature-controls {
    flex-direction: column;
    gap: 0.75rem;
  }

  .control-group {
    width: 100%;
    justify-content: space-between;
  }

  .signature-actions {
    width: 100%;
  }

  .signature-actions button {
    flex: 1;
  }
}
```

### 4.4 사용 예시

```tsx
import { SignatureCanvas } from '@/components/workflow/SignatureCanvas';
import { Check, X, Pen, Eraser } from 'lucide-react';

function ContractSigningPage() {
  const [signatureData, setSignatureData] = React.useState<SignatureData | null>(null);
  const [agreed, setAgreed] = React.useState(false);

  const handleSave = (data: SignatureData) => {
    setSignatureData(data);
  };

  const handleSubmit = async () => {
    if (!signatureData || !agreed) return;

    const response = await fetch('/api/orders/ORD-001/contract/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signatureData),
    });

    if (response.ok) {
      // 서명 완료 처리
      router.push('/member/orders/ORD-001/production');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <SignatureCanvas
        width={600}
        height={200}
        penColor="#000000"
        penWidth={2}
        backgroundColor="#ffffff"
        onSave={handleSave}
      />

      <div className="mt-4 space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span className="text-sm">계약서 내용을 확인했으며, 동의합니다.</span>
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" required />
          <span className="text-sm">전자 서명에 대한 법적 효력을 확인했습니다.</span>
        </label>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!signatureData || !agreed}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg disabled:opacity-50"
        >
          서명 제출
        </button>
      </div>
    </div>
  );
}
```

---

## 5. ProductionTimeline 컴포넌트

### 5.1 컴포넌트 개요

**용途:** 9단계 생산 공정 진척도 표시

**사용 위치:**
- 생산 진척 페이지 (/member/orders/[id]/production)
- 관리자 생산 관리 페이지 (/admin/production)

### 5.2 인터페이스 정의

```typescript
// src/components/workflow/ProductionTimeline.tsx
interface ProductionTimelineProps {
  /** 생산 단계 배열 */
  stages: ProductionStage[];

  /** 현재 단계 인덱스 */
  currentIndex: number;

  /** 레이아웃 */
  layout?: 'vertical' | 'horizontal';

  /** 상세 정보 표시 */
  showDetails?: boolean;

  /** 클릭 가능 */
  clickable?: boolean;

  /** 단계 클릭 핸들러 */
  onStageClick?: (stage: ProductionStage) => void;

  /** 클래스명 */
  className?: string;
}

interface ProductionStage {
  id: string;
  number: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  progress?: number;
  startDate?: string;
  endDate?: string;
  estimatedDate?: string;
  assignee?: {
    name: string;
    avatar?: string;
  };
  photos?: ProductionPhoto[];
  notes?: string;
}

interface ProductionPhoto {
  id: string;
  url: string;
  thumbnail: string;
  caption?: string;
  uploadedAt: string;
}
```

### 5.3 스타일 명세

```css
/* 생산 타임라인 */
.production-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 수평 레이아웃 */
.production-timeline.horizontal {
  flex-direction: row;
  overflow-x: auto;
  padding: 1rem 0;
}

/* 단계 아이템 */
.stage-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.stage-item.clickable {
  cursor: pointer;
}

.stage-item.clickable:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stage-item.current {
  border-color: #3b82f6;
  background: #eff6ff;
}

/* 단계 번호 */
.stage-number {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 50%;
  font-weight: 600;
  font-size: 1.25rem;
  color: #6b7280;
}

.stage-number.completed {
  background: #d1fae5;
  color: #10b981;
}

.stage-number.in_progress {
  background: #dbeafe;
  color: #3b82f6;
  animation: pulse 2s infinite;
}

.stage-number.error {
  background: #fef2f2;
  color: #ef4444;
}

/* 단계 정보 */
.stage-info {
  flex: 1;
}

.stage-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.stage-title {
  font-weight: 600;
  font-size: 1rem;
  color: #111827;
}

.stage-status {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
}

.stage-status.completed {
  background: #d1fae5;
  color: #10b981;
}

.stage-status.in_progress {
  background: #dbeafe;
  color: #3b82f6;
}

.stage-status.pending {
  background: #f3f4f6;
  color: #6b7280;
}

.stage-status.error {
  background: #fef2f2;
  color: #ef4444;
}

/* 프로그레스 바 */
.stage-progress {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin: 0.5rem 0;
}

.stage-progress-bar {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.stage-progress-bar.completed {
  background: #10b981;
}

/* 단계 메타 */
.stage-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.stage-meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* 사진 갤러리 */
.stage-photos {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  overflow-x: auto;
}

.stage-photo {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 0.375rem;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.stage-photo:hover {
  transform: scale(1.05);
}

.stage-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 반응형 */
@media (max-width: 768px) {
  .stage-item {
    flex-direction: column;
  }

  .stage-number {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .stage-photos {
    justify-content: flex-start;
  }
}
```

### 5.4 사용 예시

```tsx
import { ProductionTimeline } from '@/components/workflow/ProductionTimeline';
import { Calendar, User, Image as ImageIcon } from 'lucide-react';

function ProductionProgressPage() {
  const stages: ProductionStage[] = [
    {
      id: 'design-review',
      number: 1,
      title: '디자인 검토',
      description: '디자인 파일 검토 및 수정',
      status: 'completed',
      progress: 100,
      startDate: '2025-01-10',
      endDate: '2025-01-10',
      assignee: { name: '김디자인' },
      photos: [
        { id: '1', url: '/photos/1.jpg', thumbnail: '/photos/1-thumb.jpg', uploadedAt: '2025-01-10' },
      ],
    },
    {
      id: 'cutting',
      number: 4,
      title: '재단',
      description: '재료 자르기 및 가공',
      status: 'in_progress',
      progress: 60,
      startDate: '2025-01-15',
      estimatedDate: '2025-01-17',
      assignee: { name: '박제작' },
    },
    // ... 나머지 단계
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <ProductionTimeline
        stages={stages}
        currentIndex={3}
        layout="vertical"
        showDetails
        clickable
        onStageClick={(stage) => handleStageClick(stage)}
      />
    </div>
  );
}
```

---

## 6. ShipmentTracker 컴포넌트

### 6.1 컴포넌트 개요

**용途:** 배송 추적 정보 표시

**사용 위치:**
- 배송 추적 페이지 (/member/orders/[id]/shipment)

### 6.2 인터페이스 정의

```typescript
// src/components/workflow/ShipmentTracker.tsx
interface ShipmentTrackerProps {
  /** 배송 정보 */
  shipment: ShipmentInfo;

  /** 실시간 업데이트 */
  realtime?: boolean;

  /** 지도 표시 */
  showMap?: boolean;

  /** 클래스명 */
  className?: string;
}

interface ShipmentInfo {
  trackingNumber: string;
  carrier: {
    name: string;
    logo: string;
    tel: string;
  };
  status: ShipmentStatus;
  estimatedDelivery?: string;
  actualDelivery?: string;
  origin: Address;
  destination: Address;
  trackingHistory: TrackingEvent[];
}

type ShipmentStatus =
  | 'preparing'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed';

interface TrackingEvent {
  id: string;
  status: string;
  location: string;
  description: string;
  timestamp: string;
}

interface Address {
  name: string;
  postalCode: string;
  address: string;
  phone?: string;
}
```

### 6.3 스타일 명세

```css
/* 배송 추적 */
.shipment-tracker {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 헤더 */
.shipment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.shipment-carrier {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.shipment-carrier-logo {
  width: 48px;
  height: 48px;
  border-radius: 0.25rem;
}

.shipment-tracking-number {
  font-family: monospace;
  font-size: 0.875rem;
  color: #6b7280;
}

/* 상태 배지 */
.shipment-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.shipment-status.preparing {
  background: #f3f4f6;
  color: #6b7280;
}

.shipment-status.in_transit {
  background: #dbeafe;
  color: #3b82f6;
}

.shipment-status.delivered {
  background: #d1fae5;
  color: #10b981;
}

/* 추적 타임라인 */
.tracking-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.tracking-event {
  display: flex;
  gap: 1rem;
  padding-bottom: 1.5rem;
  position: relative;
}

.tracking-event:last-child {
  padding-bottom: 0;
}

/* 타임라인 라인 */
.tracking-event::before {
  content: '';
  position: absolute;
  left: 12px;
  top: 24px;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
}

.tracking-event:last-child::before {
  display: none;
}

/* 이벤트 아이콘 */
.tracking-event-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  color: #6b7280;
  z-index: 1;
}

.tracking-event.current .tracking-event-icon {
  background: #3b82f6;
  color: white;
}

.tracking-event.completed .tracking-event-icon {
  background: #10b981;
  color: white;
}

/* 이벤트 정보 */
.tracking-event-info {
  flex: 1;
}

.tracking-event-status {
  font-weight: 600;
  color: #111827;
}

.tracking-event-location {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.tracking-event-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.tracking-event-time {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

/* 반응형 */
@media (max-width: 768px) {
  .shipment-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .tracking-event {
    gap: 0.75rem;
  }
}
```

### 6.4 사용 예시

```tsx
import { ShipmentTracker } from '@/components/workflow/ShipmentTracker';
import { Truck, MapPin, CheckCircle } from 'lucide-react';

function ShipmentTrackingPage() {
  const shipment: ShipmentInfo = {
    trackingNumber: '1234567890123',
    carrier: {
      name: 'CJ대한통운',
      logo: '/carriers/cj.png',
      tel: '1588-1255',
    },
    status: 'in_transit',
    estimatedDelivery: '2025-02-20',
    origin: {
      name: 'EPACKAGE Lab',
      postalCode: '12345',
      address: '서울시 강남구 테헤란로 123',
    },
    destination: {
      name: '(주)에피패키지',
      postalCode: '67890',
      address: '부산시 해운대구 센텀로 456',
      phone: '051-123-4567',
    },
    trackingHistory: [
      {
        id: '1',
        status: 'delivered',
        location: '부산지사',
        description: '배송 완료',
        timestamp: '2025-02-20 10:30:00',
      },
      // ... 나머지 이벤트
    ],
  };

  return (
    <div className="max-w-3xl mx-auto">
      <ShipmentTracker
        shipment={shipment}
        realtime
        showMap
      />
    </div>
  );
}
```

---

## 7. 컴포넌트 통합 예시

### 7.1 주문 상세 페이지

```tsx
// src/app/member/orders/[id]/page.tsx
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline';
import { DocumentViewer } from '@/components/workflow/DocumentViewer';
import { FileUploader } from '@/components/workflow/FileUploader';
import { SignatureCanvas } from '@/components/workflow/SignatureCanvas';
import { ProductionTimeline } from '@/components/workflow/ProductionTimeline';
import { ShipmentTracker } from '@/components/workflow/ShipmentTracker';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { order, isLoading } = useOrder(params.id);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold">주문 #{order.id}</h1>
        <p className="text-text-muted">주문일: {order.createdAt}</p>
      </div>

      {/* 10단계 타임라인 */}
      <WorkflowTimeline
        currentStep={order.currentStep}
        completedSteps={order.completedSteps}
        steps={order.workflowSteps}
        variant="horizontal"
        clickable
        onStepClick={(step) => router.push(step.href)}
        responsive
      />

      {/* 현재 단계 컨텐츠 */}
      {order.currentStep === 4 && (
        <FileUploader
          accept={['.ai', '.pdf']}
          maxSize={50 * 1024 * 1024}
          onUpload={handleDataUpload}
        />
      )}

      {order.currentStep === 5 && (
        <DocumentViewer
          url={order.workOrderUrl}
          type="pdf"
          title="작업표준서"
          showConfirmButton
          onConfirm={handleWorkOrderConfirm}
        />
      )}

      {order.currentStep === 7 && (
        <div className="space-y-6">
          <DocumentViewer
            url={order.contractUrl}
            type="pdf"
            title="계약서"
          />
          <SignatureCanvas onSave={handleContractSign} />
        </div>
      )}

      {order.currentStep === 8 && (
        <ProductionTimeline
          stages={order.productionStages}
          currentIndex={order.currentProductionIndex}
          layout="vertical"
          showDetails
        />
      )}

      {order.currentStep === 10 && (
        <ShipmentTracker shipment={order.shipment} realtime />
      )}
    </div>
  );
}
```

---

## 8. 성능 최적화

### 8.1 코드 스플리팅

```typescript
// 동적 임포트
const WorkflowTimeline = dynamic(() =>
  import('@/components/workflow/WorkflowTimeline'),
  { ssr: true }
);

const DocumentViewer = dynamic(() =>
  import('@/components/workflow/DocumentViewer'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

const SignatureCanvas = dynamic(() =>
  import('@/components/workflow/SignatureCanvas'),
  { ssr: false }
);
```

### 8.2 메모이제이션

```typescript
import { memo, useMemo, useCallback } from 'react';

export const WorkflowTimeline = memo(({ currentStep, steps, ...props }: WorkflowTimelineProps) => {
  const stepItems = useMemo(() =>
    steps.map(step => ({ ...step, status: getStepStatus(step.number, currentStep) })),
    [steps, currentStep]
  );

  const handleStepClick = useCallback((step: WorkflowStep) => {
    if (props.onStepClick && step.href) {
      props.onStepClick(step);
    }
  }, [props.onStepClick]);

  return (
    <div className="timeline">
      {stepItems.map(step => (
        <StepItem key={step.id} step={step} onClick={handleStepClick} />
      ))}
    </div>
  );
});
```

---

## 9. 테스트 전략

### 9.1 유닛 테스트

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline';

describe('WorkflowTimeline', () => {
  const mockSteps = [
    { id: '1', number: 1, title: 'Step 1', status: 'completed' },
    { id: '2', number: 2, title: 'Step 2', status: 'current' },
    { id: '3', number: 3, title: 'Step 3', status: 'pending' },
  ];

  it('renders all steps', () => {
    render(<WorkflowTimeline currentStep={2} steps={mockSteps} />);
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
  });

  it('calls onStepClick when step is clicked', () => {
    const handleClick = jest.fn();
    render(
      <WorkflowTimeline
        currentStep={2}
        steps={mockSteps}
        clickable
        onStepClick={handleClick}
      />
    );

    fireEvent.click(screen.getByText('Step 1'));
    expect(handleClick).toHaveBeenCalledWith(mockSteps[0]);
  });
});
```

### 9.2 E2E 테스트

```typescript
import { test, expect } from '@playwright/test';

test('complete data upload step', async ({ page }) => {
  await page.goto('/member/orders/ORD-001/data-upload');

  // 파일 선택
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('./test-files/design.ai');

  // 업로드 확인
  await expect(page.locator('.file-status.success')).toBeVisible();

  // 제출 버튼 클릭
  await page.click('button:has-text("제출")');

  // 다음 단계로 이동 확인
  await expect(page).toHaveURL('/member/orders/ORD-001/work-order');
});
```

---

_문서 버전: 1.0_
_작성일: 2024-12-31_
_마지막 수정: 2024-12-31_
