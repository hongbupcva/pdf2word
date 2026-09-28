import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  Packer,
  convertInchesToTwip,
} from 'docx';
import { ConvertedPage, ConversionSettings, DocumentBlock } from '../types/document';

export async function generateDocxBlob(
  pages: ConvertedPage[],
  settings: ConversionSettings,
  documentTitle = 'Tài liệu chuyển đổi PDF sang Word'
): Promise<Blob> {
  const font = settings.fontFamily || 'Times New Roman';
  const baseSize = (settings.fontSize || 13) * 2; // docx font size is in half-points

  const docChildren: (Paragraph | Table)[] = [];

  pages.forEach((page, pageIndex) => {
    // Add page break before subsequent pages if enabled
    if (pageIndex > 0 && settings.includePageBreaks) {
      docChildren.push(
        new Paragraph({
          pageBreakBefore: true,
          children: [],
        })
      );
    }

    if (page.blocks.length === 0 && page.rawText) {
      // Fallback for raw text if blocks weren't generated
      const lines = page.rawText.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          docChildren.push(
            new Paragraph({
              spacing: { after: 120, line: 276 },
              children: [
                new TextRun({
                  text: line,
                  font: font,
                  size: baseSize,
                }),
              ],
            })
          );
        }
      }
      return;
    }

    for (const block of page.blocks) {
      switch (block.type) {
        case 'heading': {
          const headingLvl =
            block.level === 1
              ? HeadingLevel.HEADING_1
              : block.level === 2
              ? HeadingLevel.HEADING_2
              : HeadingLevel.HEADING_3;

          const headingSize =
            block.level === 1
              ? Math.round(baseSize * 1.35)
              : block.level === 2
              ? Math.round(baseSize * 1.2)
              : Math.round(baseSize * 1.1);

          const align =
            block.alignment === 'center'
              ? AlignmentType.CENTER
              : block.alignment === 'right'
              ? AlignmentType.RIGHT
              : AlignmentType.LEFT;

          docChildren.push(
            new Paragraph({
              heading: headingLvl,
              alignment: align,
              spacing: { before: 240, after: 120 },
              children: [
                new TextRun({
                  text: block.text || '',
                  bold: true,
                  font: font,
                  size: headingSize,
                }),
              ],
            })
          );
          break;
        }

        case 'paragraph': {
          const align =
            block.alignment === 'center'
              ? AlignmentType.CENTER
              : block.alignment === 'right'
              ? AlignmentType.RIGHT
              : block.alignment === 'justify'
              ? AlignmentType.JUSTIFIED
              : AlignmentType.LEFT;

          const textRuns: TextRun[] = [];

          if (block.runs && block.runs.length > 0) {
            for (const run of block.runs) {
              textRuns.push(
                new TextRun({
                  text: run.text,
                  bold: run.bold ?? false,
                  italics: run.italic ?? false,
                  underline: run.underline ? {} : undefined,
                  font: font,
                  size: baseSize,
                })
              );
            }
          } else {
            textRuns.push(
              new TextRun({
                text: block.text || '',
                font: font,
                size: baseSize,
              })
            );
          }

          docChildren.push(
            new Paragraph({
              alignment: align,
              spacing: { after: 140, line: 276 },
              children: textRuns,
            })
          );
          break;
        }

        case 'list': {
          const items = block.listItems || (block.text ? [block.text] : []);
          items.forEach((itemText, i) => {
            const prefix = block.listType === 'numbered' ? `${i + 1}. ` : '• ';
            docChildren.push(
              new Paragraph({
                spacing: { after: 80, line: 260 },
                indent: { left: convertInchesToTwip(0.25) },
                children: [
                  new TextRun({
                    text: prefix,
                    bold: block.listType === 'numbered',
                    font: font,
                    size: baseSize,
                  }),
                  new TextRun({
                    text: itemText,
                    font: font,
                    size: baseSize,
                  }),
                ],
              })
            );
          });
          break;
        }

        case 'table': {
          if (!block.tableData) break;
          const { headers, rows } = block.tableData;
          const tableRows: TableRow[] = [];

          // Standard border styling
          const borderStyle = {
            style: BorderStyle.SINGLE,
            size: 1,
            color: '9CA3AF',
          };

          const cellBorders = {
            top: borderStyle,
            bottom: borderStyle,
            left: borderStyle,
            right: borderStyle,
          };

          // Render headers if available
          if (headers && headers.length > 0) {
            const headerCells = headers.map(
              (headerText) =>
                new TableCell({
                  shading: { fill: 'F3F4F6' },
                  borders: cellBorders,
                  margins: {
                    top: convertInchesToTwip(0.08),
                    bottom: convertInchesToTwip(0.08),
                    left: convertInchesToTwip(0.12),
                    right: convertInchesToTwip(0.12),
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 40, after: 40 },
                      children: [
                        new TextRun({
                          text: headerText,
                          bold: true,
                          font: font,
                          size: baseSize,
                        }),
                      ],
                    }),
                  ],
                })
            );

            tableRows.push(
              new TableRow({
                tableHeader: true,
                children: headerCells,
              })
            );
          }

          // Render data rows
          if (rows && rows.length > 0) {
            rows.forEach((row, rowIndex) => {
              const dataCells = row.map(
                (cellText) =>
                  new TableCell({
                    borders: cellBorders,
                    shading:
                      rowIndex % 2 === 1 ? { fill: 'FAFAFA' } : undefined,
                    margins: {
                      top: convertInchesToTwip(0.06),
                      bottom: convertInchesToTwip(0.06),
                      left: convertInchesToTwip(0.12),
                      right: convertInchesToTwip(0.12),
                    },
                    children: [
                      new Paragraph({
                        spacing: { before: 30, after: 30 },
                        children: [
                          new TextRun({
                            text: cellText,
                            font: font,
                            size: baseSize,
                          }),
                        ],
                      }),
                    ],
                  })
              );

              tableRows.push(
                new TableRow({
                  children: dataCells,
                })
              );
            });
          }

          if (tableRows.length > 0) {
            docChildren.push(
              new Table({
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                rows: tableRows,
              })
            );

            // Add small spacing after table
            docChildren.push(
              new Paragraph({
                spacing: { after: 120 },
                children: [],
              })
            );
          }
          break;
        }

        case 'divider': {
          docChildren.push(
            new Paragraph({
              spacing: { before: 120, after: 120 },
              border: {
                bottom: {
                  color: 'D1D5DB',
                  size: 6,
                  style: BorderStyle.SINGLE,
                },
              },
              children: [],
            })
          );
          break;
        }
      }
    }
  });

  const doc = new Document({
    creator: 'DocuMorph AI PDF to Word',
    title: documentTitle,
    description: 'Chuyển đổi từ PDF bằng DocuMorph AI',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export async function downloadDocxFile(
  pages: ConvertedPage[],
  settings: ConversionSettings,
  filename: string
): Promise<void> {
  const cleanName = filename.replace(/\.pdf$/i, '') || 'tai-lieu-chuyen-doi';
  const blob = await generateDocxBlob(pages, settings, cleanName);

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${cleanName}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
