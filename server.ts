import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Support base64 image payloads for PDF page OCR
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: !!apiKey });
});

// OCR & Layout analysis endpoint using Gemini 3.8 Flash
app.post('/api/ocr-page', async (req, res) => {
  try {
    const { imageBase64, pageNumber = 1, options = {} } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trên server. Vui lòng kiểm tra cài đặt.',
      });
    }

    // Clean base64 if it has data URL prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const promptText = `
Bạn là chuyên gia chuyển đổi tài liệu quét / PDF sang tài liệu Microsoft Word (.docx) chuyên nghiệp.
Nhiệm vụ: Phân tích hình ảnh trang PDF số ${pageNumber} này (có thể là văn bản in, văn bản quét, hợp đồng, bảng tính, biểu mẫu tiếng Việt hoặc tiếng Anh).

Yêu cầu cực kỳ quan trọng:
1. Nhận diện chính xác 100% tiếng Việt có dấu, không bỏ sót từ, không làm sai dấu hỏi/ngã/nặng/sắc/huyền.
2. Bảo toàn bố cục tài liệu: tiêu đề chính (Heading 1), tiêu đề phụ (Heading 2, 3), đoạn văn (paragraph), bảng biểu (table), danh sách gạch đầu dòng (bullet_list), danh sách đánh số (numbered_list).
3. Bảng biểu (table): Nhận diện đúng số hàng (rows) và số cột (columns), đánh dấu ô tiêu đề cột (isHeader: true), nội dung từng ô text.
4. Thuộc tính văn bản: Nhận diện chữ in đậm (bold), chữ in nghiêng (italic), căn lề (left, center, right, justify).
5. Trả về đúng định dạng JSON theo schema đã cho, không thêm bất kỳ văn bản giải thích nào ngoài JSON.
`;

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: cleanBase64,
      },
    };

    const textPart = {
      text: promptText,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pageNumber: { type: Type.INTEGER },
            detectedLanguage: { type: Type.STRING },
            summary: { type: Type.STRING },
            blocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: {
                    type: Type.STRING,
                    description: 'Loại khối: heading, paragraph, table, list, divider',
                  },
                  level: {
                    type: Type.INTEGER,
                    description: 'Cấp tiêu đề 1, 2 hoặc 3 nếu là heading',
                  },
                  alignment: {
                    type: Type.STRING,
                    description: 'left, center, right hoặc justify',
                  },
                  text: {
                    type: Type.STRING,
                    description: 'Nội dung thuần túy của khối nếu là heading hoặc paragraph đơn giản',
                  },
                  runs: {
                    type: Type.ARRAY,
                    description: 'Các đoạn text có style (bold, italic) trong paragraph',
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING },
                        bold: { type: Type.BOOLEAN },
                        italic: { type: Type.BOOLEAN },
                        underline: { type: Type.BOOLEAN },
                      },
                      required: ['text'],
                    },
                  },
                  listType: {
                    type: Type.STRING,
                    description: 'bullet hoặc numbered nếu là list',
                  },
                  listItems: {
                    type: Type.ARRAY,
                    description: 'Danh sách các mục nếu là list',
                    items: { type: Type.STRING },
                  },
                  tableData: {
                    type: Type.OBJECT,
                    description: 'Dữ liệu bảng nếu type là table',
                    properties: {
                      headers: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      rows: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                    },
                  },
                },
                required: ['type'],
              },
            },
          },
          required: ['blocks'],
        },
      },
    });

    const responseText = response.text || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      // Fallback regex extraction if needed
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Không thể phân tích dữ liệu JSON trả về từ AI');
      }
    }

    parsedResult.pageNumber = pageNumber;
    return res.json({ success: true, data: parsedResult });
  } catch (error: any) {
    console.error('Error during OCR page conversion:', error);
    return res.status(500).json({
      error: error.message || 'Lỗi khi nhận diện trang bằng AI',
    });
  }
});

// Configure Vite integration
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
