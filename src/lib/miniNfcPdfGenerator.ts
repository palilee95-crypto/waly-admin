import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

export interface MiniNfcCardItem {
  code: string;
  quota?: number;
  plan?: string;
}

export interface GeneratePdfOptions {
  items: MiniNfcCardItem[];
  showSerialText?: boolean;
  templateBuffer?: ArrayBuffer | Uint8Array;
  onProgress?: (current: number, total: number) => void;
}

// Coordinate conversions and layout constants
// 1 mm in PDF points (72 pt / 25.4 mm)
const MM_TO_PT = 72 / 25.4;

// Standard ISO A4 height in millimeters
const A4_HEIGHT_MM = 297.0;

// Grid layout: 2 Columns x 4 Rows
const COL_X_MM = [17.94, 106.27];
const ROW_Y_MM = [35.87, 92.90, 149.76, 206.78];

// Relative White Box location within each 85.5 x 54 mm card
const REL_SPOT_X_MM = 56.50;
const REL_SPOT_Y_MM = 13.50;
const SPOT_WIDTH_MM = 23.20;
const SPOT_HEIGHT_MM = 23.00;

/**
 * Generates an 8-up A4 Manufacturer Print-Ready PDF with unique QR codes
 * imprinted directly onto the Risev Mini NFC Card template.
 */
export async function generateMiniNfc8UpPdf(options: GeneratePdfOptions): Promise<Uint8Array> {
  const { items, showSerialText = true, templateBuffer, onProgress } = options;

  if (!items || items.length === 0) {
    throw new Error('At least one card item is required to generate PDF');
  }

  // 1. Obtain master template PDF bytes
  let masterBytes: ArrayBuffer | Uint8Array;
  if (templateBuffer) {
    masterBytes = templateBuffer;
  } else {
    const templatePath = '/templates/Risev_Tap_A4_8up_85.5x54mm_Print_Ready.pdf';
    const res = await fetch(templatePath);
    if (!res.ok) {
      throw new Error(`Failed to load master PDF template from ${templatePath} (${res.status} ${res.statusText})`);
    }
    masterBytes = await res.arrayBuffer();
  }

  // 2. Load master template into source document
  const sourceDoc = await PDFDocument.load(masterBytes);

  // 3. Create target output document
  const pdfDoc = await PDFDocument.create();

  // Embed font for serial text if enabled
  const font = showSerialText ? await pdfDoc.embedFont(StandardFonts.CourierBold) : null;

  const totalCards = items.length;
  const cardsPerPage = 8;
  const totalPages = Math.ceil(totalCards / cardsPerPage);

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    // Copy the original vector template page to preserve 100% sharpness
    const [templatePage] = await pdfDoc.copyPages(sourceDoc, [0]);
    const currentPage = pdfDoc.addPage(templatePage);

    const startCardIdx = pageIdx * cardsPerPage;
    const endCardIdx = Math.min(startCardIdx + cardsPerPage, totalCards);

    for (let cardIdx = startCardIdx; cardIdx < endCardIdx; cardIdx++) {
      const item = items[cardIdx];
      const slotIdx = cardIdx % cardsPerPage;

      const col = slotIdx % 2; // 0 (Left), 1 (Right)
      const row = Math.floor(slotIdx / 2); // 0, 1, 2, 3

      // Card top-left position on page in mm
      const cardX_mm = COL_X_MM[col];
      const cardY_mm = ROW_Y_MM[row];

      // White spot absolute position on page in mm (from top-left)
      const spotX_mm = cardX_mm + REL_SPOT_X_MM;
      const spotY_mm = cardY_mm + REL_SPOT_Y_MM;

      // 4. Generate high-resolution QR code
      const activateUrl = `https://risev.app/nfc?c=${item.code.trim().toUpperCase()}`;
      const qrDataUrl = await QRCode.toDataURL(activateUrl, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 360,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      const qrImage = await pdfDoc.embedPng(qrDataUrl);

      if (showSerialText && font) {
        // Mode B: QR Code + Serial Text underneath
        const qrSize_mm = 17.2;
        const qrOffsetX_mm = (SPOT_WIDTH_MM - qrSize_mm) / 2; // ~3.0 mm
        const qrOffsetY_mm = 0.8; // padding from top of white box

        const qrX_pt = (spotX_mm + qrOffsetX_mm) * MM_TO_PT;
        // In PDF coordinates, Y starts from bottom
        const qrY_pt = (A4_HEIGHT_MM - (spotY_mm + qrOffsetY_mm + qrSize_mm)) * MM_TO_PT;
        const qrSize_pt = qrSize_mm * MM_TO_PT;

        currentPage.drawImage(qrImage, {
          x: qrX_pt,
          y: qrY_pt,
          width: qrSize_pt,
          height: qrSize_pt,
        });

        // Render Monospace Serial Code Text
        const fontSize = 4.3; // points
        const textStr = item.code.trim().toUpperCase();
        const textWidth = font.widthOfTextAtSize(textStr, fontSize);
        const spotCenter_pt = (spotX_mm + SPOT_WIDTH_MM / 2) * MM_TO_PT;
        const textX_pt = spotCenter_pt - textWidth / 2;
        const textY_pt = (A4_HEIGHT_MM - (spotY_mm + qrOffsetY_mm + qrSize_mm + 3.4)) * MM_TO_PT;

        currentPage.drawText(textStr, {
          x: textX_pt,
          y: textY_pt,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      } else {
        // Mode A: Pure QR Code Only (Centered)
        const qrSize_mm = 21.5;
        const qrOffsetX_mm = (SPOT_WIDTH_MM - qrSize_mm) / 2; // ~0.85 mm
        const qrOffsetY_mm = (SPOT_HEIGHT_MM - qrSize_mm) / 2; // ~0.75 mm

        const qrX_pt = (spotX_mm + qrOffsetX_mm) * MM_TO_PT;
        const qrY_pt = (A4_HEIGHT_MM - (spotY_mm + qrOffsetY_mm + qrSize_mm)) * MM_TO_PT;
        const qrSize_pt = qrSize_mm * MM_TO_PT;

        currentPage.drawImage(qrImage, {
          x: qrX_pt,
          y: qrY_pt,
          width: qrSize_pt,
          height: qrSize_pt,
        });
      }

      if (onProgress) {
        onProgress(cardIdx + 1, totalCards);
      }
    }
  }

  return await pdfDoc.save();
}

/**
 * Triggers a browser download of the generated PDF bytes.
 */
export function downloadPdfBlob(pdfBytes: Uint8Array, filename: string): void {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
