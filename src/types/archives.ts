// Archives/Trade Records Types

export interface TradeRecord {
  id: string;
  title: string;
  clientName: string;
  industry: Industry;
  projectType: ProjectType;
  description: string;
  technicalSpec: string;
  results: string[];
  images: TradeRecordImage[];
  startDate: string;
  endDate: string;
  featured: boolean;
  sortOrder: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TradeRecordImage {
  id: string;
  url: string;
  alt: string;
  isMain: boolean;
  sortOrder: number;
}

export type Industry = 'manufacturing' | 'cosmetics' | 'food' | 'pharmaceutical' | 'other';

export type ProjectType = 'equipment_supply' | 'consulting' | 'custom_manufacturing' | 'technology_transfer' | 'other';

export interface ArchiveFilters {
  industry: Industry | null;
  projectType: ProjectType | null;
  dateRange: {
    start: string | null;
    end: string | null;
  } | null;
  featured: boolean | null;
  searchTerm: string;
  sortBy: 'newest' | 'oldest' | 'featured' | 'alphabetical';
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface ArchivePageState {
  records: TradeRecord[];
  filteredRecords: TradeRecord[];
  filters: ArchiveFilters;
  pagination: PaginationState;
  loading: boolean;
  selectedRecord: TradeRecord | null;
  showDetailModal: boolean;
}