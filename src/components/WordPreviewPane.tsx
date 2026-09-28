import React, { useState } from 'react';
import { Download, Copy, Check, Edit3, Eye, FileText, Sparkles, Plus, Trash2, AlignLeft, AlignCenter } from 'lucide-react';
import { ConvertedPage, ConversionSettings, DocumentBlock, WordFont } from '../types/document';
import { downloadDocxFile } from '../services/docxService';

interface WordPreviewPaneProps {
  pages: ConvertedPage[];
  currentPageIndex: number;
  settings: ConversionSettings;
  onUpdateSettings: (newSettings: Partial<ConversionSettings>) => void;
  onUpdateBlockText: (pageIndex: number, blockId: string, newText: string) => void;
  onUpdateTableCell: (pageIndex: number, blockId: string, rowIndex: number, colIndex: number, value: string) => void;
  fileName: string;
  isProcessing: boolean;
}

export const WordPreviewPane: React.FC<WordPreviewPaneProps> = ({
  pages,
  currentPageIndex,
  settings,
  onUpdateSettings,
  onUpdateBlockText,
  onUpdateTableCell,
  fileName,
  isProcessing,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'raw'>('preview');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const currentPage = pages[currentPageIndex] || {
    pageNumber: 1,
    isScanned: false,
    status: 'completed',
    blocks: [],
    rawText: '',
  };

  const handleCopyText = async () => {
    try {
      const fullText = pages
        .map((p) => {
          if (p.blocks.length > 0) {
            return p.blocks
              .map((b) => {
                if (b.type === 'heading') return `\n# ${b.text}\n`;
                if (b.type === 'table' && b.tableData) {
                  const h = b.tableData.headers ? b.tableData.headers.join(' | ') + '\n' : '';
                  const r = b.tableData.rows.map((row) => row.join(' | ')).join('\n');
                  return `\n${h}${r}\n`;
                }
                if (b.type === 'list' && b.listItems) {
                  return b.listItems.map((item) => `- ${item}`).join('\n');
                }
                return b.text || '';
              })
              .join('\n\n');
          }
          return p.rawText;
        })
        .join('\n\n--- HẾT TRANG ---\n\n');

      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Lỗi khi sao chép:', err);
    }
  };

  const handleDownloadDocx = async () => {
    try {
      setIsExporting(true);
      await downloadDocxFile(pages, settings, fileName);
    } catch (error: any) {
      console.error('Lỗi khi xuất file docx:', error);
      alert('Có lỗi khi tạo tệp Word: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setIsExporting(false);
    }
  };

  // Font styling for the simulated Word document
  const fontFamilyCss =
    settings.fontFamily === 'Times New Roman'
      ? '"Times New Roman", Times, serif'
      : settings.fontFamily === 'Arial'
      ? 'Arial, Helvetica, sans-serif'
      : settings.fontFamily === 'Calibri'
      ? 'Calibri, sans-serif'
      : 'system-ui, sans-serif';

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Word Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white border-b border-gray-200 shrink-0">
        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'preview'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Trang Word</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'edit'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Chỉnh sửa nội dung</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'raw'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Văn bản thuần</span>
          </button>
        </div>

        {/* Font Family Selector & Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-xs">
            <span className="text-gray-500 font-medium">Font:</span>
            <select
              value={settings.fontFamily}
              onChange={(e) =>
                onUpdateSettings({ fontFamily: e.target.value as WordFont })
              }
              className="px-2 py-1 bg-gray-50 border border-gray-300 rounded-md text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Times New Roman">Times New Roman (Chuẩn CV)</option>
              <option value="Arial">Arial</option>
              <option value="Calibri">Calibri</option>
              <option value="Segoe UI">Segoe UI</option>
            </select>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyText}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
            title="Sao chép toàn bộ văn bản"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-500" />
                <span className="hidden md:inline">Sao chép</span>
              </>
            )}
          </button>

          {/* Download DOCX Button */}
          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={isProcessing || isExporting}
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 rounded-lg shadow-sm shadow-blue-500/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Đang xuất...' : 'Tải file Word (.docx)'}</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center">
        {activeTab === 'preview' && (
          /* Simulated A4 Word Document Page */
          <div
            className="w-full max-w-3xl min-h-[920px] bg-white text-gray-900 rounded-sm shadow-lg p-8 sm:p-14 border border-gray-200 transition-all"
            style={{ fontFamily: fontFamilyCss, fontSize: `${settings.fontSize}pt` }}
          >
            {currentPage.blocks && currentPage.blocks.length > 0 ? (
              <div className="space-y-4">
                {currentPage.blocks.map((block) => {
                  if (block.type === 'heading') {
                    const Tag = block.level === 1 ? 'h1' : block.level === 2 ? 'h2' : 'h3';
                    const sizeClass =
                      block.level === 1
                        ? 'text-2xl font-bold mt-6 mb-3'
                        : block.level === 2
                        ? 'text-xl font-bold mt-4 mb-2'
                        : 'text-lg font-bold mt-3 mb-1.5';
                    const alignClass =
                      block.alignment === 'center'
                        ? 'text-center'
                        : block.alignment === 'right'
                        ? 'text-right'
                        : 'text-left';

                    return (
                      <Tag key={block.id} className={`${sizeClass} ${alignClass} text-gray-900 leading-tight`}>
                        {block.text}
                      </Tag>
                    );
                  }

                  if (block.type === 'paragraph') {
                    const alignClass =
                      block.alignment === 'center'
                        ? 'text-center'
                        : block.alignment === 'right'
                        ? 'text-right'
                        : block.alignment === 'justify'
                        ? 'text-justify'
                        : 'text-left';

                    return (
                      <p key={block.id} className={`${alignClass} leading-relaxed text-gray-800 mb-2`}>
                        {block.runs && block.runs.length > 0 ? (
                          block.runs.map((run, rIdx) => (
                            <span
                              key={rIdx}
                              className={`
                                ${run.bold ? 'font-bold' : ''}
                                ${run.italic ? 'italic' : ''}
                                ${run.underline ? 'underline' : ''}
                              `}
                            >
                              {run.text}
                            </span>
                          ))
                        ) : (
                          block.text
                        )}
                      </p>
                    );
                  }

                  if (block.type === 'list') {
                    const isNumbered = block.listType === 'numbered';
                    const items = block.listItems || (block.text ? [block.text] : []);

                    return (
                      <div key={block.id} className="pl-6 space-y-1 mb-3">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-gray-800 leading-relaxed">
                            <span className="font-semibold select-none">
                              {isNumbered ? `${idx + 1}.` : '•'}
                            </span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  if (block.type === 'table' && block.tableData) {
                    const { headers, rows } = block.tableData;

                    return (
                      <div key={block.id} className="my-4 overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-400 text-xs sm:text-sm">
                          {headers && headers.length > 0 && (
                            <thead>
                              <tr className="bg-gray-100">
                                {headers.map((h, hIdx) => (
                                  <th
                                    key={hIdx}
                                    className="border border-gray-400 px-3 py-2 text-center font-bold text-gray-900"
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                          )}
                          <tbody>
                            {rows &&
                              rows.map((row, rIdx) => (
                                <tr
                                  key={rIdx}
                                  className={rIdx % 2 === 1 ? 'bg-gray-50/60' : 'bg-white'}
                                >
                                  {row.map((cell, cIdx) => (
                                    <td
                                      key={cIdx}
                                      className="border border-gray-400 px-3 py-1.5 text-gray-800"
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }

                  if (block.type === 'divider') {
                    return <hr key={block.id} className="my-4 border-gray-300" />;
                  }

                  return null;
                })}
              </div>
            ) : (
              <div className="whitespace-pre-wrap leading-relaxed text-gray-800">
                {currentPage.rawText || 'Chưa có nội dung cho trang này.'}
              </div>
            )}
          </div>
        )}

        {activeTab === 'edit' && (
          /* Inline Editing View */
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 text-xs">
              <span className="font-semibold text-gray-700">
                Chỉnh sửa khối văn bản của Trang {currentPageIndex + 1}
              </span>
              <span className="text-gray-500">
                Các thay đổi sẽ được cập nhật trực tiếp vào file Word khi tải xuống.
              </span>
            </div>

            {currentPage.blocks && currentPage.blocks.length > 0 ? (
              currentPage.blocks.map((block) => {
                if (block.type === 'heading') {
                  return (
                    <div key={block.id} className="p-3 bg-blue-50/40 rounded-lg border border-blue-200/60">
                      <label className="block text-[11px] font-semibold text-blue-800 mb-1">
                        Tiêu đề (Heading {block.level || 1})
                      </label>
                      <input
                        type="text"
                        value={block.text || ''}
                        onChange={(e) =>
                          onUpdateBlockText(currentPageIndex, block.id, e.target.value)
                        }
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  );
                }

                if (block.type === 'paragraph') {
                  return (
                    <div key={block.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Đoạn văn bản
                      </label>
                      <textarea
                        rows={3}
                        value={block.text || ''}
                        onChange={(e) =>
                          onUpdateBlockText(currentPageIndex, block.id, e.target.value)
                        }
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  );
                }

                if (block.type === 'table' && block.tableData) {
                  return (
                    <div key={block.id} className="p-3 bg-emerald-50/40 rounded-lg border border-emerald-200/60">
                      <label className="block text-[11px] font-semibold text-emerald-800 mb-2">
                        Bảng dữ liệu Word
                      </label>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-emerald-300 text-xs">
                          {block.tableData.headers && (
                            <thead>
                              <tr className="bg-emerald-100">
                                {block.tableData.headers.map((h, colIdx) => (
                                  <th key={colIdx} className="border border-emerald-300 p-1.5 font-bold">
                                    <input
                                      type="text"
                                      value={h}
                                      onChange={(e) => {
                                        // Update header
                                        const newHeaders = [...(block.tableData?.headers || [])];
                                        newHeaders[colIdx] = e.target.value;
                                        block.tableData!.headers = newHeaders;
                                      }}
                                      className="w-full bg-transparent font-bold text-center border-none focus:outline-none focus:bg-white"
                                    />
                                  </th>
                                ))}
                              </tr>
                            </thead>
                          )}
                          <tbody>
                            {block.tableData.rows.map((row, rIdx) => (
                              <tr key={rIdx}>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="border border-emerald-300 p-1 bg-white">
                                    <input
                                      type="text"
                                      value={cell}
                                      onChange={(e) =>
                                        onUpdateTableCell(currentPageIndex, block.id, rIdx, cIdx, e.target.value)
                                      }
                                      className="w-full bg-transparent px-1 py-0.5 border-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }

                return null;
              })
            ) : (
              <p className="text-xs text-gray-500">Không có khối văn bản nào để chỉnh sửa.</p>
            )}
          </div>
        )}

        {activeTab === 'raw' && (
          /* Raw text export view */
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Nội dung trích xuất thuần túy (Plain Text)
            </h4>
            <textarea
              readOnly
              rows={24}
              value={currentPage.rawText || currentPage.blocks.map((b) => b.text || '').join('\n\n')}
              className="w-full p-4 font-mono text-xs bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none select-all"
            />
          </div>
        )}
      </div>

      {/* Pane Footer Stats */}
      <div className="px-4 py-2 bg-white border-t border-gray-200 text-[11px] text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>Khối: <strong>{currentPage.blocks.length}</strong></span>
          <span>Bảng biểu: <strong>{currentPage.blocks.filter((b) => b.type === 'table').length}</strong></span>
          <span>Trang hiện tại: <strong>{currentPageIndex + 1} / {pages.length}</strong></span>
        </div>
        <span className="text-blue-600 font-medium">Định dạng sẵn sàng cho Word (.docx)</span>
      </div>
    </div>
  );
};
