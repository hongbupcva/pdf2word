export type BlockType = 'heading' | 'paragraph' | 'table' | 'list' | 'divider';

export interface TextRunItem {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface TableData {
  headers?: string[];
  rows: string[][];
}

export interface DocumentBlock {
  id: string;
  type: BlockType;
  level?: 1 | 2 | 3;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  text?: string;
  runs?: TextRunItem[];
  listType?: 'bullet' | 'numbered';
  listItems?: string[];
  tableData?: TableData;
}

export interface ConvertedPage {
  pageNumber: number;
  isScanned: boolean;
  thumbnailUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  detectedLanguage?: string;
  summary?: string;
  blocks: DocumentBlock[];
  rawText: string;
}

export type ConversionMode = 'auto' | 'ai_ocr' | 'native_fast';
export type WordFont = 'Times New Roman' | 'Arial' | 'Calibri' | 'Segoe UI';

export interface ConversionSettings {
  mode: ConversionMode;
  fontFamily: WordFont;
  fontSize: number; // in pt (e.g. 13 or 12)
  includePageBreaks: boolean;
  preserveTables: boolean;
  detectBoldItalic: boolean;
  vietnameseBooster: boolean;
}

export interface PdfDocumentInfo {
  name: string;
  size: number;
  totalPages: number;
  isScannedDetected: boolean;
}
