import React from 'react';
import { Sparkles, Loader2, FileText, Image as ImageIcon, CheckCircle } from 'lucide-react';

interface ConversionProgressModalProps {
  isOpen: boolean;
  currentPage: number;
  totalPages: number;
  currentStage: string;
  isScannedCurrent: boolean;
  onCancel?: () => void;
}

export const ConversionProgressModal: React.FC<ConversionProgressModalProps> = ({
  isOpen,
  currentPage,
  totalPages,
  currentStage,
  isScannedCurrent,
  onCancel,
}) => {
  if (!isOpen) return null;

  const percentage = Math.round(((currentPage) / Math.max(totalPages, 1)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center border border-gray-100 animate-in fade-in zoom-in-95">
        {/* Animated Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 mb-1">
          Đang chuyển đổi PDF sang Word...
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Trang {currentPage} trên tổng số {totalPages} trang
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden mb-3">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.max(percentage, 8)}%` }}
          />
        </div>

        {/* Status text badge */}
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-700 bg-gray-50 py-2 px-3 rounded-lg border border-gray-200 mb-4">
          {isScannedCurrent ? (
            <ImageIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          ) : (
            <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          )}
          <span className="truncate">{currentStage}</span>
        </div>

        <p className="text-[11px] text-gray-400">
          Gemini 3.8 Flash đang nhận diện tiếng Việt và giữ nguyên bảng biểu sang tệp DOCX.
        </p>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="mt-4 px-4 py-1.5 text-xs text-gray-500 hover:text-gray-800 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            Hủy xử lý
          </button>
        )}
      </div>
    </div>
  );
};
