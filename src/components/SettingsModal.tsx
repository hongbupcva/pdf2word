import React from 'react';
import { X, Check, Sliders, Type, Layers, Table, Sparkles, FileText } from 'lucide-react';
import { ConversionSettings, ConversionMode, WordFont } from '../types/document';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ConversionSettings;
  onSave: (newSettings: ConversionSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [current, setCurrent] = React.useState<ConversionSettings>(settings);

  React.useEffect(() => {
    setCurrent(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Cài đặt xuất tệp Word (.docx)</h3>
              <p className="text-xs text-gray-500">Tùy chỉnh định dạng văn bản và thuật toán xử lý</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs text-gray-700">
          {/* Conversion Mode */}
          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Chế độ chuyển đổi & Công nghệ nhận diện:
            </label>
            <div className="space-y-2">
              {[
                {
                  id: 'auto' as ConversionMode,
                  title: 'Chế độ Thông minh (Khuyên dùng)',
                  desc: 'Tự động kiểm tra từng trang: Nếu là PDF ảnh/quét thì kích hoạt AI OCR, nếu là PDF văn bản thì trích xuất tối ưu.',
                  badge: 'Đề xuất',
                },
                {
                  id: 'ai_ocr' as ConversionMode,
                  title: 'Toàn diện với Gemini 3.8 Flash OCR',
                  desc: 'Dùng trí tuệ nhân tạo phân tích toàn bộ trang để nhận diện chữ viết tay, con dấu, bảng biểu phức tạp và chuẩn hóa tiếng Việt.',
                  badge: 'Độ chính xác cao nhất',
                },
                {
                  id: 'native_fast' as ConversionMode,
                  title: 'Trích xuất Nhanh (Offline / Instant)',
                  desc: 'Trích xuất trực tiếp trong trình duyệt cho file PDF văn bản số, không chờ xử lý AI. (Không dùng cho PDF ảnh quét)',
                  badge: 'Tốc độ cao',
                },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setCurrent({ ...current, mode: opt.id })}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    current.mode === opt.id
                      ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">{opt.title}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-[11px]">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Word Font Family */}
          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Phông chữ Microsoft Word:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Times New Roman' as WordFont, desc: 'Chuẩn thể thức văn bản VN (Nghị định 30)' },
                { name: 'Arial' as WordFont, desc: 'Hiện đại, không chân, dễ đọc trên màn hình' },
                { name: 'Calibri' as WordFont, desc: 'Font mặc định tiêu chuẩn của Microsoft Office' },
                { name: 'Segoe UI' as WordFont, desc: 'Giao diện phong cách Windows hiện đại' },
              ].map((f) => (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => setCurrent({ ...current, fontFamily: f.name })}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    current.fontFamily === f.name
                      ? 'border-blue-500 bg-blue-50/50 font-semibold text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="font-medium text-xs">{f.name}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="block font-semibold text-gray-900 mb-1">
              Cỡ chữ cơ bản (Đoạn văn):
            </label>
            <div className="flex items-center gap-3">
              {[12, 13, 14].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setCurrent({ ...current, fontSize: size })}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    current.fontSize === size
                      ? 'border-blue-500 bg-blue-600 text-white'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {size} pt {size === 13 && '(Chuẩn công văn)'}
                </button>
              ))}
            </div>
          </div>

          {/* Document Structure Switches */}
          <div className="space-y-3 pt-2 border-t border-gray-200">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-medium text-gray-900 block">Ngắt trang tương ứng từng trang PDF</span>
                <span className="text-[11px] text-gray-500">
                  Tự động chèn Page Break trong Word để mỗi trang PDF là một trang Word riêng biệt
                </span>
              </div>
              <input
                type="checkbox"
                checked={current.includePageBreaks}
                onChange={(e) => setCurrent({ ...current, includePageBreaks: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-medium text-gray-900 block">Tái tạo bảng biểu Word hoàn chỉnh</span>
                <span className="text-[11px] text-gray-500">
                  Chuyển bảng từ PDF thành bảng Word thật (table, rows, cells) có thể chỉnh sửa
                </span>
              </div>
              <input
                type="checkbox"
                checked={current.preserveTables}
                onChange={(e) => setCurrent({ ...current, preserveTables: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-medium text-gray-900 block">Bảo toàn in đậm, in nghiêng & căn lề</span>
                <span className="text-[11px] text-gray-500">
                  Giữ nguyên định dạng chữ đậm/nghiêng và căn lề giữa, lề trái, đều 2 bên
                </span>
              </div>
              <input
                type="checkbox"
                checked={current.detectBoldItalic}
                onChange={(e) => setCurrent({ ...current, detectBoldItalic: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};
