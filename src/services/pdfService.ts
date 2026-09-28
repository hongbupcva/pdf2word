import * as pdfjsLib from 'pdfjs-dist';
import { ConvertedPage, DocumentBlock } from '../types/document';

// Configure pdfjs worker safely
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface RenderedPageImage {
  dataUrl: string;
  base64: string;
  width: number;
  height: number;
}

export async function loadPdfFromBuffer(buffer: ArrayBuffer): Promise<pdfjsLib.PDFDocumentProxy> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
    cMapPacked: true,
  });
  return await loadingTask.promise;
}

export async function renderPdfPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale = 1.8
): Promise<RenderedPageImage> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    throw new Error('Không thể khởi tạo 2D context cho Canvas');
  }

  // White background for cleaner OCR
  context.fillStyle = '#FFFFFF';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
    canvas: canvas,
  };

  await page.render(renderContext).promise;

  const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
  const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, '');

  return {
    dataUrl,
    base64,
    width: canvas.width,
    height: canvas.height,
  };
}

export async function detectIfPageIsScanned(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number
): Promise<{ isScanned: boolean; textLength: number; sampleText: string }> {
  try {
    const page = await pdfDoc.getPage(pageNumber);
    const textContent = await page.getTextContent();

    let fullText = '';
    for (const item of textContent.items as any[]) {
      if (item.str) {
        fullText += item.str + ' ';
      }
    }

    const trimmed = fullText.trim();
    // A scanned page has very little or no native digital text stream
    const isScanned = trimmed.length < 40;

    return {
      isScanned,
      textLength: trimmed.length,
      sampleText: trimmed.slice(0, 150),
    };
  } catch (err) {
    console.warn('Lỗi khi phân tích nội dung text của trang:', err);
    // If text analysis fails, assume scanned/OCR needed
    return { isScanned: true, textLength: 0, sampleText: '' };
  }
}

export async function extractNativeDigitalPageBlocks(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number
): Promise<{ blocks: DocumentBlock[]; rawText: string }> {
  const page = await pdfDoc.getPage(pageNumber);
  const textContent = await page.getTextContent();

  const items = textContent.items as any[];
  if (!items || items.length === 0) {
    return { blocks: [], rawText: '' };
  }

  // Sort items vertically (top to bottom), then horizontally (left to right)
  // PDF coordinates: (0,0) is bottom-left, transform[5] is Y from bottom, transform[4] is X
  const sortedItems = [...items].sort((a, b) => {
    const yA = a.transform[5];
    const yB = b.transform[5];
    if (Math.abs(yA - yB) > 4) {
      return yB - yA; // top to bottom
    }
    return a.transform[4] - b.transform[4]; // left to right
  });

  // Group items into lines
  interface TextLine {
    y: number;
    items: any[];
    text: string;
    maxHeight: number;
    avgHeight: number;
    isBold: boolean;
  }

  const lines: TextLine[] = [];
  let currentLine: TextLine | null = null;

  for (const item of sortedItems) {
    const text = item.str || '';
    if (!text.trim() && text !== ' ') continue;

    const y = item.transform[5];
    const height = Math.abs(item.height || item.transform[0] || 12);
    const fontName = (item.fontName || '').toLowerCase();
    const isBold = fontName.includes('bold') || fontName.includes('black') || fontName.includes('b');

    if (!currentLine || Math.abs(currentLine.y - y) > 5) {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = {
        y,
        items: [item],
        text: text,
        maxHeight: height,
        avgHeight: height,
        isBold: isBold,
      };
    } else {
      currentLine.items.push(item);
      currentLine.text += (currentLine.text.endsWith(' ') || text.startsWith(' ') ? '' : ' ') + text;
      currentLine.maxHeight = Math.max(currentLine.maxHeight, height);
      currentLine.isBold = currentLine.isBold || isBold;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  // Calculate median text height to detect headings
  const heights = lines.map((l) => l.maxHeight).sort((a, b) => a - b);
  const medianHeight = heights[Math.floor(heights.length / 2)] || 12;

  const blocks: DocumentBlock[] = [];
  let currentParagraphLines: string[] = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      const pText = currentParagraphLines.join(' ').replace(/\s+/g, ' ').trim();
      if (pText) {
        blocks.push({
          id: `page-${pageNumber}-native-p-${blocks.length}`,
          type: 'paragraph',
          text: pText,
          runs: [{ text: pText }],
        });
      }
      currentParagraphLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.text.trim();
    if (!trimmed) continue;

    // Check if line looks like Heading
    const isSignificantlyBigger = line.maxHeight >= medianHeight * 1.25;
    const isShortLine = trimmed.length < 80;
    const isAllUpper = trimmed === trimmed.toUpperCase() && trimmed.length > 4 && /[A-ZÀ-Ỹ]/.test(trimmed);

    if ((isSignificantlyBigger || (line.isBold && isShortLine)) && isShortLine) {
      flushParagraph();
      blocks.push({
        id: `page-${pageNumber}-native-h-${blocks.length}`,
        type: 'heading',
        level: line.maxHeight >= medianHeight * 1.5 ? 1 : 2,
        text: trimmed,
        alignment: isAllUpper ? 'center' : 'left',
      });
      continue;
    }

    // Check for bullet list item
    const isBullet = /^[•\-\*]\s+/.test(trimmed);
    const isNumbered = /^\d+[\.\)]\s+/.test(trimmed);

    if (isBullet || isNumbered) {
      flushParagraph();
      const cleanItemText = trimmed.replace(/^([•\-\*]|\d+[\.\)])\s+/, '');
      blocks.push({
        id: `page-${pageNumber}-native-list-${blocks.length}`,
        type: 'list',
        listType: isNumbered ? 'numbered' : 'bullet',
        listItems: [cleanItemText],
      });
      continue;
    }

    // Regular line accumulated into paragraph
    currentParagraphLines.push(trimmed);

    // If gap to next line is large, treat as paragraph break
    const nextLine = lines[i + 1];
    if (nextLine && Math.abs(line.y - nextLine.y) > medianHeight * 1.8) {
      flushParagraph();
    }
  }

  flushParagraph();

  const rawText = lines.map((l) => l.text).join('\n');
  return { blocks, rawText };
}
