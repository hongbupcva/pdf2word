import React from 'react';
import { FileText, Sparkles, Sliders, RefreshCw, FileCode, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  onReset: () => void;
  onLoadSample: (type: 'digital' | 'scanned') => void;
  hasDocument: boolean;
  isProcessing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onReset,
  onLoadSample,
  hasDocument,
  isProcessing,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-gray-900 tracking-tight">
                  DocuMorph <span className="text-blue-600">PDF → Word</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  Gemini 3.8 AI
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">
                Chuyển đổi PDF văn bản & PDF ảnh/quét sang Microsoft Word (.docx)
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!hasDocument ? (
              <div className="hidden md:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onLoadSample('scanned')}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                >
                  <FileCode className="w-3.5 h-3.5 text-amber-600" />
                  Thử PDF ảnh quét (Hợp đồng)
                </button>
                <button
                  type="button"
                  onClick={() => onLoadSample('digital')}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  Thử PDF văn bản (Báo cáo)
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onReset}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                Tải tệp khác
              </button>
            )}

            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-2xs transition-colors"
              title="Tùy chọn Word & Font chữ"
            >
              <Sliders className="w-3.5 h-3.5 text-gray-600" />
              <span className="hidden sm:inline">Tùy chọn Word</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
