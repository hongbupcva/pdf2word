/**
 * Helper to generate authentic sample PDF files directly in the browser
 * so users can test both "PDF Văn Bản" and "PDF Ảnh / Quét" instantly.
 */

// Helper to create a minimal valid PDF with an image page (simulating scanned document)
export async function createSampleScannedPdf(): Promise<{ buffer: ArrayBuffer; name: string }> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1700;
  const ctx = canvas.getContext('2d')!;

  // Paper background with warm scanned tint & subtle texture
  ctx.fillStyle = '#FAF8F5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add subtle scanner noise & vignette
  ctx.fillStyle = 'rgba(0, 0, 0, 0.015)';
  for (let i = 0; i < 2000; i++) {
    const rx = Math.random() * canvas.width;
    const ry = Math.random() * canvas.height;
    ctx.fillRect(rx, ry, 2, 2);
  }

  // Slight tilt/skew simulation for scanned paper realism
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((-0.25 * Math.PI) / 180);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  // Header - Quốc hiệu Tiêu ngữ
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 26px "Times New Roman", serif';
  ctx.fillText('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', 600, 120);

  ctx.font = 'bold 22px "Times New Roman", serif';
  ctx.fillText('Độc lập - Tự do - Hạnh phúc', 600, 160);

  // Underline bar
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(480, 180);
  ctx.lineTo(720, 180);
  ctx.stroke();

  // Document Title
  ctx.font = 'bold 32px "Times New Roman", serif';
  ctx.fillText('HỢP ĐỒNG DỊCH VỤ CÔNG NGHỆ THÔNG TIN', 600, 260);

  ctx.font = 'italic 18px "Times New Roman", serif';
  ctx.fillText('Số: 128/2026/HĐDV-TECH • Ngày ký: 15/03/2026', 600, 300);

  // Body text
  ctx.textAlign = 'left';
  ctx.font = '20px "Times New Roman", serif';

  let y = 370;
  ctx.font = 'bold 22px "Times New Roman", serif';
  ctx.fillText('BÊN A (BÊN THUÊ DỊCH VỤ):', 120, y);
  y += 35;
  ctx.font = '20px "Times New Roman", serif';
  ctx.fillText('• Công ty Cổ phần Đầu tư & Phát triển Công nghệ Toàn Cầu', 140, y);
  y += 32;
  ctx.fillText('• Địa chỉ: Số 88 Đường Láng Hạ, Đống Đa, TP. Hà Nội', 140, y);
  y += 32;
  ctx.fillText('• Đại diện: Ông Trần Minh Quang — Chức vụ: Tổng Giám Đốc', 140, y);

  y += 50;
  ctx.font = 'bold 22px "Times New Roman", serif';
  ctx.fillText('BÊN B (BÊN CUNG CẤP DỊCH VỤ):', 120, y);
  y += 35;
  ctx.font = '20px "Times New Roman", serif';
  ctx.fillText('• Công ty TNHH Giải pháp Phần mềm Trí Tuệ Nhân Tạo AI Studio', 140, y);
  y += 32;
  ctx.fillText('• Địa chỉ: Tòa nhà Tech Tower, Quận 1, TP. Hồ Chí Minh', 140, y);
  y += 32;
  ctx.fillText('• Đại diện: Bà Lê Thanh Hằng — Chức vụ: Giám đốc Điều hành', 140, y);

  y += 55;
  ctx.font = 'bold 24px "Times New Roman", serif';
  ctx.fillText('ĐIỀU 1: NỘI DUNG VÀ CHI PHÍ THỰC HIỆN', 120, y);

  // Table rendering
  y += 40;
  const startX = 120;
  const colWidths = [80, 420, 160, 160, 140];
  const tableHeaders = ['STT', 'Hạng mục triển khai', 'Đơn vị tính', 'Đơn giá (VNĐ)', 'Thành tiền'];
  const tableRows = [
    ['01', 'Hệ thống OCR nhận diện tài liệu đa ngôn ngữ', 'Gói', '15.000.000', '15.000.000'],
    ['02', 'Mô-đun tái tạo bảng biểu Word tự động', 'Gói', '12.500.000', '12.500.000'],
    ['03', 'Tích hợp API Gemini 3.8 Flash & Cloud', 'Tháng', '8.000.000', '8.000.000'],
    ['04', 'Đào tạo & Chuyển giao công nghệ nhân sự', 'Buổi', '4.500.000', '9.000.000'],
  ];

  // Draw header row
  let curX = startX;
  ctx.fillStyle = '#E5E7EB';
  ctx.fillRect(startX, y, 960, 40);
  ctx.strokeStyle = '#4B5563';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(startX, y, 960, 40);

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 18px "Times New Roman", serif';
  tableHeaders.forEach((h, idx) => {
    ctx.fillText(h, curX + 10, y + 26);
    curX += colWidths[idx];
    if (idx < colWidths.length - 1) {
      ctx.beginPath();
      ctx.moveTo(curX, y);
      ctx.lineTo(curX, y + 40);
      ctx.stroke();
    }
  });

  // Draw rows
  y += 40;
  ctx.font = '19px "Times New Roman", serif';
  tableRows.forEach((row, rIdx) => {
    curX = startX;
    if (rIdx % 2 === 1) {
      ctx.fillStyle = '#F3F4F6';
      ctx.fillRect(startX, y, 960, 38);
    }
    ctx.strokeStyle = '#4B5563';
    ctx.strokeRect(startX, y, 960, 38);

    ctx.fillStyle = '#1F2937';
    row.forEach((cell, cIdx) => {
      ctx.fillText(cell, curX + 10, y + 25);
      curX += colWidths[cIdx];
      if (cIdx < colWidths.length - 1) {
        ctx.beginPath();
        ctx.moveTo(curX, y);
        ctx.lineTo(curX, y + 38);
        ctx.stroke();
      }
    });
    y += 38;
  });

  // Total summary
  y += 30;
  ctx.font = 'bold 20px "Times New Roman", serif';
  ctx.fillText('Tổng giá trị hợp đồng (đã bao gồm thuế GTGT): 44.500.000 VNĐ', 120, y);
  y += 28;
  ctx.font = 'italic 19px "Times New Roman", serif';
  ctx.fillText('(Bằng chữ: Bốn mươi bốn triệu năm trăm ngàn đồng chẵn).', 120, y);

  // Signatures
  y += 90;
  ctx.font = 'bold 22px "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.fillText('ĐẠI DIỆN BÊN A', 320, y);
  ctx.fillText('ĐẠI DIỆN BÊN B', 880, y);

  y += 30;
  ctx.font = 'italic 18px "Times New Roman", serif';
  ctx.fillText('(Ký, ghi rõ họ tên và đóng dấu)', 320, y);
  ctx.fillText('(Ký, ghi rõ họ tên và đóng dấu)', 880, y);

  // Scanned red circular stamp simulation
  ctx.save();
  ctx.translate(880, y + 80);
  ctx.rotate((-5 * Math.PI) / 180);
  ctx.strokeStyle = 'rgba(220, 38, 38, 0.78)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 65, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 52, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(220, 38, 38, 0.85)';
  ctx.font = 'bold 12px "Arial", sans-serif';
  ctx.fillText('★ CÔNG TY TNHH AI STUDIO ★', 0, -25);
  ctx.font = 'bold 14px "Arial", sans-serif';
  ctx.fillText('ĐÃ DUYỆT', 0, 5);
  ctx.font = '10px "Arial", sans-serif';
  ctx.fillText('M.S.D.N: 0318928392', 0, 28);
  ctx.restore();

  // Signature script simulation
  ctx.strokeStyle = 'rgba(30, 58, 138, 0.85)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(270, y + 70);
  ctx.bezierCurveTo(300, y + 40, 330, y + 90, 370, y + 60);
  ctx.bezierCurveTo(390, y + 50, 340, y + 80, 360, y + 90);
  ctx.stroke();

  ctx.font = 'bold 20px "Times New Roman", serif';
  ctx.fillStyle = '#111827';
  ctx.fillText('Trần Minh Quang', 320, y + 150);
  ctx.fillText('Lê Thanh Hằng', 880, y + 150);

  ctx.restore();

  // Convert canvas to minimal valid PDF
  const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.85);
  const jpegBytes = base64ToUint8Array(jpegDataUrl.replace(/^data:image\/jpeg;base64,/, ''));

  const pdfBytes = wrapJpegIntoPdf(jpegBytes, 595, 842); // A4 dimensions in pt
  return {
    buffer: pdfBytes.buffer as ArrayBuffer,
    name: 'Mau-2-Hop-Dong-Quet-Anh.pdf',
  };
}

// Helper to create a digital text sample PDF (Searchable PDF with digital fonts and tables)
export async function createSampleDigitalPdf(): Promise<{ buffer: ArrayBuffer; name: string }> {
  // We can construct a clean PDF with text stream objects
  const title = 'BAO CAO TOAN DIEN VE CHUYEN DOI SO VA TRI TUE NHAN TAO 2026';
  const subtitle = 'Vien Nghien Cuu & Ung Dung Cong Nghe Quoc Gia';
  const p1 = 'Trong nam 2026, cong nghe tri tue nhan tao da tao ra buoc dot pha trong xu ly tai lieu.';
  const p2 = 'Dac biet la kha nang nhan dien chu viet (OCR) va tai tao bang bieu sang Microsoft Word.';
  const p3 = 'He thong giup giam thoi gian nhap lieu thu cong tu 45 phut xuong con duoi 5 giay moi van ban.';

  // Build minimal valid standard PDF with text stream
  const pdfString = `%PDF-1.4
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 595 842]
  /Resources <<
    /Font <<
      /F1 4 0 R
      /F2 5 0 R
    >>
  >>
  /Contents 6 0 R
>>
endobj
4 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica-Bold
>>
endobj
5 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica
>>
endobj
6 0 obj
<< /Length 750 >>
stream
BT
/F1 18 Tf
50 780 Td
(${title}) Tj
/F2 13 Tf
0 -30 Td
(${subtitle}) Tj
/F2 11 Tf
0 -40 Td
(${p1}) Tj
0 -22 Td
(${p2}) Tj
0 -22 Td
(${p3}) Tj
/F1 13 Tf
0 -40 Td
(DANH SAH BANG BIEU THONG KE:) Tj
/F2 10 Tf
0 -26 Td
(STT    Hang Muc                     Chi Phi (VND)        Trang Thai) Tj
0 -20 Td
(01     Nhan dien OCR tu dong        12.000.000           Hoan tat) Tj
0 -20 Td
(02     Xuat file Word .docx         8.500.000            Hoan tat) Tj
0 -20 Td
(03     Bao toan dinh dang bang      6.000.000            Dang chay) Tj
/F1 11 Tf
0 -40 Td
(GHI CHU QUAN TRONG:) Tj
/F2 10 Tf
0 -20 Td
(- Ho tro ca dinh dang PDF text so va PDF scan tu dien thoai hoac may scan.) Tj
0 -20 Td
(- Giu nguyen toan ven font chu va phong cach trinh bay goc.) Tj
ET
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000257 00000 n 
0000000331 00000 n 
0000000400 00000 n 
trailer
<<
  /Size 7
  /Root 1 0 R
>>
startxref
1200
%%EOF`;

  const encoder = new TextEncoder();
  const buffer = encoder.encode(pdfString).buffer as ArrayBuffer;

  return {
    buffer,
    name: 'Mau-1-Bao-Cao-Van-Ban-So.pdf',
  };
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Wraps a raw JPEG image stream into an A4 PDF document
function wrapJpegIntoPdf(jpegBytes: Uint8Array, pageWidth = 595, pageHeight = 842): Uint8Array {
  const header = `%PDF-1.4\n`;
  const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`;
  const obj4Header = `4 0 obj\n<< /Type /XObject /Subtype /Image /Width 1200 /Height 1700 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`;
  const obj4Footer = `\nendstream\nendobj\n`;

  // Draw image to fill page
  const contentStream = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im1 Do\nQ\n`;
  const obj5 = `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`;

  const encoder = new TextEncoder();
  const hBytes = encoder.encode(header);
  const o1Bytes = encoder.encode(obj1);
  const o2Bytes = encoder.encode(obj2);
  const o3Bytes = encoder.encode(obj3);
  const o4HBytes = encoder.encode(obj4Header);
  const o4FBytes = encoder.encode(obj4Footer);
  const o5Bytes = encoder.encode(obj5);

  const offsets = [
    0,
    hBytes.length,
    hBytes.length + o1Bytes.length,
    hBytes.length + o1Bytes.length + o2Bytes.length,
    hBytes.length + o1Bytes.length + o2Bytes.length + o3Bytes.length,
    hBytes.length + o1Bytes.length + o2Bytes.length + o3Bytes.length + o4HBytes.length + jpegBytes.length + o4FBytes.length,
  ];

  const xrefOffset = offsets[5] + o5Bytes.length;

  let xref = `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ` 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  const trBytes = encoder.encode(xref + trailer);

  const totalLength = xrefOffset + trBytes.length;
  const result = new Uint8Array(totalLength);

  let pos = 0;
  result.set(hBytes, pos); pos += hBytes.length;
  result.set(o1Bytes, pos); pos += o1Bytes.length;
  result.set(o2Bytes, pos); pos += o2Bytes.length;
  result.set(o3Bytes, pos); pos += o3Bytes.length;
  result.set(o4HBytes, pos); pos += o4HBytes.length;
  result.set(jpegBytes, pos); pos += jpegBytes.length;
  result.set(o4FBytes, pos); pos += o4FBytes.length;
  result.set(o5Bytes, pos); pos += o5Bytes.length;
  result.set(trBytes, pos);

  return result;
}
