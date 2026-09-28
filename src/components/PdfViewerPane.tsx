import React, { useState } from 'react';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileText, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import { ConvertedPage } from '../types/document';

interface PdfViewerPaneProps {
  currentPageIndex: number;
  totalPages: number;
  onPageChange: (index: number) => void;
  renderedImageUrl?: string;
  currentPageData?: ConvertedPage;
  onReprocessPageWithAi?: (pageNumber: number) => void;
  isProcessing: boolean;
}

export const PdfViewerPane: React.FC<PdfViewerPaneProps> = ({
  currentPageIndex,
  totalPages,
  onPageChange,
  renderedImageUrl,
  currentPageData,
  onReprocessPageWithAi,
  isProcessing,
}) => {
  const [zoom, setZoom] = useState<number>(100);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleZoomReset = () => setZoom(100);

  const isScanned = currentPageData?.isScanned ?? false;

  return (
    <div className="flex flex-col h-full bg-gray-100/80 border-r border-gray-200">
      {/* Pane Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-xs text-gray-700">
            <span>Tài liệu PDF gốc</span>
            {isScanned ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                <ImageIcon className="w-3 h-3 text-amber-600" />
                Ảnh quét / Scan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
                <FileText className="w-3 h-3 text-blue-600" />
                Văn bản số
              </span>
            )}
          </div>
        </div>

        {/* Page Switcher & Zoom */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 text-xs text-gray-700">
            <button
              type="button"
              onClick={() => onPageChange(currentPageIndex - 1)}
              disabled={currentPageIndex <= 0 || isProcessing}
              className="p-1 hover:bg-white rounded disabled:opacity-30 disabled:hover:bg-transparent"
              title="Trang trước"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-medium">
              {currentPageIndex + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(currentPageIndex + 1)}
              disabled={currentPageIndex >= totalPages - 1 || isProcessing}
              className="p-1 hover:bg-white rounded disabled:opacity-30 disabled:hover:bg-transparent"
              title="Trang tiếp theo"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 hover:bg-white rounded text-gray-600"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomReset}
              className="px-1.5 py-0.5 hover:bg-white rounded text-[11px] text-gray-600 font-medium"
              title="Đặt lại 100%"
            >
              {zoom}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 hover:bg-white rounded text-gray-600"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {onReprocessPageWithAi && (
            <button
              type="button"
              onClick={() => onReprocessPageWithAi(currentPageIndex + 1)}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              title="Dùng Gemini AI quét lại trang này"
            >
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span className="hidden lg:inline">Quét lại AI</span>
            </button>
          )}
        </div>
      </div>

      {/* PDF Viewport Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-start justify-center">
        {renderedImageUrl ? (
          <div
            className="transition-transform duration-150 origin-top shadow-md rounded-md bg-white border border-gray-300 overflow-hidden"
            style={{ width: `${zoom}%`, maxWidth: '95%' }}
          >
            <img
              src={renderedImageUrl}
              alt={`Trang PDF ${currentPageIndex + 1}`}
              className="w-full h-auto block select-none"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-2" />
            <p className="text-xs">Đang hiển thị trang PDF...</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-500 flex items-center justify-between">
        <span>Bản hiển thị trực tiếp từ file PDF gốc</span>
        {currentPageData?.detectedLanguage && (
          <span className="text-gray-600 font-medium">
            Ngôn ngữ: {currentPageData.detectedLanguage}
          </span>
        )}
      </div>
    </div>
  );
};
