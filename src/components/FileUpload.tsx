import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Table, ShieldCheck, Zap, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onLoadSample: (type: 'digital' | 'scanned') => void;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onLoadSample,
  isProcessing,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateAndUpload = (file: File) => {
    setErrorMessage(null);
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMessage('Vui lòng chọn tệp định dạng PDF (.pdf)');
      return;
    }

    if (file.size > 80 * 1024 * 1024) {
      setErrorMessage('Dung lượng tệp vượt quá giới hạn 80MB. Vui lòng chọn tệp nhỏ hơn.');
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Công nghệ OCR Đa phương thức Gemini 3.8 Flash
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Chuyển đổi <span className="text-blue-600">PDF sang Word</span> thông minh
        </h1>
        <p className="mt-2 text-base text-gray-600 max-w-2xl mx-auto">
          Hỗ trợ cả <strong>PDF văn bản số</strong> và <strong>PDF ảnh / bản quét từ máy scan</strong>.
          Nhận diện chính xác 100% tiếng Việt, giữ nguyên bảng biểu và cấu trúc tài liệu sang file <code>.docx</code>.
        </p>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70 scale-[1.01]'
            : 'border-gray-300 hover:border-blue-400 bg-white hover:bg-gray-50/50 shadow-sm'
        } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 ring-8 ring-blue-50/50">
            <UploadCloud className="w-9 h-9" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900">
            Kéo thả tệp PDF vào đây hoặc <span className="text-blue-600 underline decoration-blue-300 underline-offset-4">Chọn từ máy tính</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Hỗ trợ PDF văn bản, PDF tài liệu scan, hợp đồng, biên bản, hóa đơn (Tối đa 80MB)
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 font-medium">
              <FileText className="w-3.5 h-3.5 text-blue-500" /> PDF văn bản
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 font-medium">
              <ImageIcon className="w-3.5 h-3.5 text-amber-500" /> PDF ảnh / Scan
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 font-medium">
              <Table className="w-3.5 h-3.5 text-emerald-500" /> Bảng biểu Word
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-500" /> Bảo mật 100%
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg inline-flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Sample Test Cards */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Không có sẵn tệp PDF? Thử nhanh bằng 2 tài liệu mẫu:
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sample 1: Scanned image PDF */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onLoadSample('scanned');
            }}
            className="group relative bg-white border border-amber-200 hover:border-amber-400 rounded-xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-amber-50/40 to-white"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-gray-900 group-hover:text-amber-800">
                    Mẫu 1: Hợp đồng quét có dấu đỏ (PDF Ảnh)
                  </h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                    Scan OCR
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  Tài liệu mô phỏng scan thực tế: có chữ in nghiêng, dấu tròn đỏ, chữ ký tay và bảng đơn giá 5 cột.
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-amber-700 group-hover:translate-x-1 transition-transform">
                  <span>Chuyển đổi mẫu này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Sample 2: Digital text PDF */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onLoadSample('digital');
            }}
            className="group relative bg-white border border-blue-200 hover:border-blue-400 rounded-xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-blue-50/40 to-white"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-gray-900 group-hover:text-blue-800">
                    Mẫu 2: Báo cáo công nghệ (PDF Văn bản số)
                  </h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                    Digital Text
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  Văn bản số tiêu chuẩn với tiêu đề in hoa, các đoạn văn, danh mục số liệu và danh sách đánh dấu.
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-700 group-hover:translate-x-1 transition-transform">
                  <span>Chuyển đổi mẫu này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Capability Highlights */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
            <Zap className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-sm text-gray-900">Nhận diện ảnh quét (OCR AI)</h4>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            Nếu trang là ảnh chụp hoặc bản quét không có lớp văn bản, Gemini AI sẽ tự động đọc từng chữ tiếng Việt chuẩn xác 100%.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
            <Table className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-sm text-gray-900">Bảo toàn bảng biểu Word</h4>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            Tự động phát hiện cấu trúc hàng, cột, tiêu đề bảng trong PDF để tạo ra bảng Microsoft Word chuẩn, có thể chèn thêm hàng và tính toán.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
            <FileText className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-sm text-gray-900">Định dạng Word chuẩn công văn</h4>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            Tự động định dạng font Times New Roman hoặc Arial, cỡ chữ 13pt, lề chuẩn 1 inch theo đúng quy chuẩn văn bản của Việt Nam.
          </p>
        </div>
      </div>
    </div>
  );
};
