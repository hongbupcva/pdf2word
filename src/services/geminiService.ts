import { DocumentBlock } from '../types/document';

export interface OcrApiResponse {
  success: boolean;
  data?: {
    pageNumber: number;
    detectedLanguage?: string;
    summary?: string;
    blocks: any[];
  };
  error?: string;
}

export async function ocrPageWithGemini(
  imageBase64: string,
  pageNumber: number,
  options: { preserveTables?: boolean; vietnameseBooster?: boolean } = {}
): Promise<{ blocks: DocumentBlock[]; detectedLanguage?: string; summary?: string }> {
  const response = await fetch('/api/ocr-page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageBase64,
      pageNumber,
      options,
    }),
  });

  const resJson: OcrApiResponse = await response.json();

  if (!response.ok || !resJson.success || !resJson.data) {
    throw new Error(resJson.error || `Lỗi nhận diện trang ${pageNumber} qua Gemini AI`);
  }

  // Format blocks into DocumentBlock format with unique IDs
  const rawBlocks = resJson.data.blocks || [];
  const normalizedBlocks: DocumentBlock[] = rawBlocks.map((b: any, index: number) => {
    const id = `page-${pageNumber}-block-${index}-${Date.now()}`;
    const type = (b.type || 'paragraph').toLowerCase();

    if (type === 'heading') {
      return {
        id,
        type: 'heading',
        level: b.level === 1 ? 1 : b.level === 2 ? 2 : 3,
        text: b.text || '',
        alignment: b.alignment || 'left',
      };
    }

    if (type === 'table') {
      return {
        id,
        type: 'table',
        tableData: {
          headers: b.tableData?.headers || [],
          rows: b.tableData?.rows || [],
        },
      };
    }

    if (type === 'list') {
      return {
        id,
        type: 'list',
        listType: b.listType === 'numbered' ? 'numbered' : 'bullet',
        listItems: b.listItems || (b.text ? [b.text] : []),
      };
    }

    if (type === 'divider') {
      return {
        id,
        type: 'divider',
      };
    }

    // Default paragraph
    return {
      id,
      type: 'paragraph',
      text: b.text || (b.runs ? b.runs.map((r: any) => r.text).join('') : ''),
      runs: b.runs && b.runs.length > 0 ? b.runs : undefined,
      alignment: b.alignment || 'left',
    };
  });

  return {
    blocks: normalizedBlocks,
    detectedLanguage: resJson.data.detectedLanguage,
    summary: resJson.data.summary,
  };
}
