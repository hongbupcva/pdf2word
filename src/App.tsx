import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Navbar } from './components/Navbar';
import { FileUpload } from './components/FileUpload';
import { PdfViewerPane } from './components/PdfViewerPane';
import { WordPreviewPane } from './components/WordPreviewPane';
import { SettingsModal } from './components/SettingsModal';
import { ConversionProgressModal } from './components/ConversionProgressModal';
import {
  ConvertedPage,
  ConversionSettings,
  DocumentBlock,
} from './types/document';
import {
  loadPdfFromBuffer,
  renderPdfPageToCanvas,
  detectIfPageIsScanned,
  extractNativeDigitalPageBlocks,
} from './services/pdfService';
import { ocrPageWithGemini } from './services/geminiService';
import {
  createSampleScannedPdf,
  createSampleDigitalPdf,
} from './services/sampleDocumentService';

const DEFAULT_SETTINGS: ConversionSettings = {
  mode: 'auto',
  fontFamily: 'Times New Roman',
  fontSize: 13,
  includePageBreaks: true,
  preserveTables: true,
  detectBoldItalic: true,
  vietnameseBooster: true,
};

export default function App() {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [fileName, setFileName] = useState<string>('tai-lieu.pdf');
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [pages, setPages] = useState<ConvertedPage[]>([]);
  const [pageImages, setPageImages] = useState<Record<number, string>>({});

  const [settings, setSettings] = useState<ConversionSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [progressState, setProgressState] = useState({
    isOpen: false,
    currentPage: 1,
    totalPages: 1,
    currentStage: 'Khởi tạo...',
    isScannedCurrent: false,
  });

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    try {
      setIsProcessing(true);
      setFileName(file.name);

      const buffer = await file.arrayBuffer();
      await processLoadedPdf(buffer, file.name);
    } catch (err: any) {
      console.error('Lỗi khi mở file PDF:', err);
      alert('Không thể mở tệp PDF: ' + (err.message || 'Vui lòng kiểm tra lại'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle loading sample PDFs
  const handleLoadSample = async (type: 'digital' | 'scanned') => {
    try {
      setIsProcessing(true);
      const sample =
        type === 'scanned'
          ? await createSampleScannedPdf()
          : await createSampleDigitalPdf();

      setFileName(sample.name);
      await processLoadedPdf(sample.buffer, sample.name);
    } catch (err: any) {
      console.error('Lỗi khi tải tài liệu mẫu:', err);
      alert('Lỗi tải tài liệu mẫu: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Main processing pipeline
  const processLoadedPdf = async (buffer: ArrayBuffer, name: string) => {
    setProgressState({
      isOpen: true,
      currentPage: 1,
      totalPages: 1,
      currentStage: 'Đang tải cấu trúc tài liệu PDF...',
      isScannedCurrent: false,
    });

    const doc = await loadPdfFromBuffer(buffer);
    setPdfDoc(doc);
    setTotalPages(doc.numPages);
    setCurrentPageIndex(0);

    const initialPages: ConvertedPage[] = [];
    const imagesCache: Record<number, string> = {};

    // Process page by page
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      setProgressState({
        isOpen: true,
        currentPage: pageNum,
        totalPages: doc.numPages,
        currentStage: `Đang kết xuất ảnh trang ${pageNum}...`,
        isScannedCurrent: false,
      });

      // 1. Render page image to canvas for preview and OCR
      const rendered = await renderPdfPageToCanvas(doc, pageNum, 1.8);
      imagesCache[pageNum] = rendered.dataUrl;

      // 2. Detect if page is scanned or digital
      const scanCheck = await detectIfPageIsScanned(doc, pageNum);
      const isScanned = scanCheck.isScanned;

      let blocks: DocumentBlock[] = [];
      let rawText = '';
      let detectedLang = 'vi';

      const shouldUseAiOcr =
        settings.mode === 'ai_ocr' ||
        (settings.mode === 'auto' && (isScanned || scanCheck.textLength < 50));

      if (shouldUseAiOcr) {
        setProgressState({
          isOpen: true,
          currentPage: pageNum,
          totalPages: doc.numPages,
          currentStage: `Gemini 3.8 AI đang nhận diện chữ & bảng biểu trang ${pageNum}...`,
          isScannedCurrent: true,
        });

        try {
          const ocrResult = await ocrPageWithGemini(rendered.base64, pageNum, {
            preserveTables: settings.preserveTables,
            vietnameseBooster: settings.vietnameseBooster,
          });

          blocks = ocrResult.blocks;
          detectedLang = ocrResult.detectedLanguage || 'vi';
          rawText = blocks
            .map((b) => b.text || (b.runs ? b.runs.map((r) => r.text).join('') : ''))
            .join('\n');
        } catch (ocrErr: any) {
          console.warn(`Lỗi OCR trang ${pageNum}, chuyển sang fallback trích xuất text:`, ocrErr);
          const fallback = await extractNativeDigitalPageBlocks(doc, pageNum);
          blocks = fallback.blocks;
          rawText = fallback.rawText;
        }
      } else {
        // Native digital text extraction
        setProgressState({
          isOpen: true,
          currentPage: pageNum,
          totalPages: doc.numPages,
          currentStage: `Đang trích xuất cấu trúc văn bản trang ${pageNum}...`,
          isScannedCurrent: false,
        });

        const nativeExt = await extractNativeDigitalPageBlocks(doc, pageNum);
        blocks = nativeExt.blocks;
        rawText = nativeExt.rawText;
      }

      initialPages.push({
        pageNumber: pageNum,
        isScanned,
        thumbnailUrl: rendered.dataUrl,
        status: 'completed',
        detectedLanguage: detectedLang,
        blocks,
        rawText,
      });

      // Update state incrementally so UI renders first page without waiting for all
      if (pageNum === 1) {
        setPages([...initialPages]);
        setPageImages({ ...imagesCache });
      }
    }

    setPages(initialPages);
    setPageImages(imagesCache);

    setProgressState({
      isOpen: false,
      currentPage: doc.numPages,
      totalPages: doc.numPages,
      currentStage: 'Hoàn tất chuyển đổi!',
      isScannedCurrent: false,
    });
  };

  // Reprocess a specific page with Gemini AI OCR
  const handleReprocessPageWithAi = async (pageNumber: number) => {
    if (!pdfDoc) return;
    try {
      setIsProcessing(true);
      setProgressState({
        isOpen: true,
        currentPage: pageNumber,
        totalPages,
        currentStage: `Đang chạy lại Gemini 3.8 AI OCR cho trang ${pageNumber}...`,
        isScannedCurrent: true,
      });

      let pageImg = pageImages[pageNumber];
      let base64 = '';

      if (!pageImg) {
        const rendered = await renderPdfPageToCanvas(pdfDoc, pageNumber, 2.0);
        pageImg = rendered.dataUrl;
        base64 = rendered.base64;
        setPageImages((prev) => ({ ...prev, [pageNumber]: pageImg }));
      } else {
        base64 = pageImg.replace(/^data:image\/\w+;base64,/, '');
      }

      const ocrResult = await ocrPageWithGemini(base64, pageNumber, {
        preserveTables: settings.preserveTables,
        vietnameseBooster: settings.vietnameseBooster,
      });

      const updatedPages = [...pages];
      const pageIdx = pageNumber - 1;
      if (updatedPages[pageIdx]) {
        updatedPages[pageIdx] = {
          ...updatedPages[pageIdx],
          isScanned: true,
          blocks: ocrResult.blocks,
          rawText: ocrResult.blocks.map((b) => b.text || '').join('\n'),
        };
        setPages(updatedPages);
      }
    } catch (err: any) {
      console.error('Lỗi khi quét lại trang:', err);
      alert('Không thể quét lại trang: ' + err.message);
    } finally {
      setIsProcessing(false);
      setProgressState((prev) => ({ ...prev, isOpen: false }));
    }
  };

  // Inline block text update handler
  const handleUpdateBlockText = (pageIndex: number, blockId: string, newText: string) => {
    setPages((prevPages) => {
      const next = [...prevPages];
      const targetPage = { ...next[pageIndex] };
      targetPage.blocks = targetPage.blocks.map((b) => {
        if (b.id === blockId) {
          return { ...b, text: newText, runs: [{ text: newText }] };
        }
        return b;
      });
      next[pageIndex] = targetPage;
      return next;
    });
  };

  // Inline table cell update handler
  const handleUpdateTableCell = (
    pageIndex: number,
    blockId: string,
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    setPages((prevPages) => {
      const next = [...prevPages];
      const targetPage = { ...next[pageIndex] };
      targetPage.blocks = targetPage.blocks.map((b) => {
        if (b.id === blockId && b.tableData) {
          const newRows = b.tableData.rows.map((row, rI) => {
            if (rI === rowIndex) {
              const newRow = [...row];
              newRow[colIndex] = value;
              return newRow;
            }
            return row;
          });
          return {
            ...b,
            tableData: {
              ...b.tableData,
              rows: newRows,
            },
          };
        }
        return b;
      });
      next[pageIndex] = targetPage;
      return next;
    });
  };

  const handleReset = () => {
    setPdfDoc(null);
    setPages([]);
    setPageImages({});
    setCurrentPageIndex(0);
    setTotalPages(0);
    setFileName('tai-lieu.pdf');
  };

  const hasDocument = pdfDoc !== null && pages.length > 0;
  const currentRenderedImg = pageImages[currentPageIndex + 1];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      {/* Top Navigation */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onReset={handleReset}
        onLoadSample={handleLoadSample}
        hasDocument={hasDocument}
        isProcessing={isProcessing}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {!hasDocument ? (
          <div className="flex-1 overflow-y-auto">
            <FileUpload
              onFileSelect={handleFileSelect}
              onLoadSample={handleLoadSample}
              isProcessing={isProcessing}
            />
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 h-[calc(100vh-4rem)]">
            {/* Left: Original PDF Viewer Pane */}
            <div className="h-full overflow-hidden">
              <PdfViewerPane
                currentPageIndex={currentPageIndex}
                totalPages={totalPages}
                onPageChange={(idx) => setCurrentPageIndex(idx)}
                renderedImageUrl={currentRenderedImg}
                currentPageData={pages[currentPageIndex]}
                onReprocessPageWithAi={handleReprocessPageWithAi}
                isProcessing={isProcessing}
              />
            </div>

            {/* Right: Converted Word Document Live Preview & Editor */}
            <div className="h-full overflow-hidden">
              <WordPreviewPane
                pages={pages}
                currentPageIndex={currentPageIndex}
                settings={settings}
                onUpdateSettings={(newSettings) =>
                  setSettings((prev) => ({ ...prev, ...newSettings }))
                }
                onUpdateBlockText={handleUpdateBlockText}
                onUpdateTableCell={handleUpdateTableCell}
                fileName={fileName}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={(newSettings) => setSettings(newSettings)}
      />

      {/* Conversion Progress Modal */}
      <ConversionProgressModal
        isOpen={progressState.isOpen}
        currentPage={progressState.currentPage}
        totalPages={progressState.totalPages}
        currentStage={progressState.currentStage}
        isScannedCurrent={progressState.isScannedCurrent}
      />
    </div>
  );
}
