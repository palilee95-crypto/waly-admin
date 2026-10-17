import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

export interface MiniNfcCardItem {
  code: string;
  quota?: number;
  plan?: string;
}

export type NfcPrintTemplateType = '10_up_mirror' | '8_up_standard';

export interface TemplateConfig {
  id: NfcPrintTemplateType;
  title: string;
  filename: string;
  cardsPerPage: number;
  cols: number;
  rows: number;
  colX_mm: number[];
  rowY_mm: number[];
  relSpotX_mm: number;
  relSpotY_mm: number;
  spotWidth_mm: number;
  spotHeight_mm: number;
  isMirrored: boolean;
}

export const TEMPLATE_CONFIGS: Record<NfcPrintTemplateType, TemplateConfig> = {
  '10_up_mirror': {
    id: '10_up_mirror',
    title: '10 Cards / Sheet (Mirror Reverse Print • 5mm Gap)',
    filename: 'Risev_Tap_A4_10Keping_MIRROR_85.5x54mm_Gap5mm.pdf',
    cardsPerPage: 10,
    cols: 2,
    rows: 5,
    colX_mm: [16.92, 107.28],
    rowY_mm: [3.38, 62.44, 121.33, 180.22, 239.27],
    relSpotX_mm: 5.75, // On the left side of mirrored card
    relSpotY_mm: 13.20,
    spotWidth_mm: 23.20,
    spotHeight_mm: 23.00,
    isMirrored: true,
  },
  '8_up_standard': {
    id: '8_up_standard',
    title: '8 Cards / Sheet (Standard Front Print)',
    filename: 'Risev_Tap_A4_8up_85.5x54mm_Print_Ready.pdf',
    cardsPerPage: 8,
    cols: 2,
    rows: 4,
    colX_mm: [17.94, 106.27],
    rowY_mm: [35.87, 92.90, 149.76, 206.78],
    relSpotX_mm: 56.50, // On the right side of standard card
    relSpotY_mm: 13.50,
    spotWidth_mm: 23.20,
    spotHeight_mm: 23.00,
    isMirrored: false,
  },
};

export interface GeneratePdfOptions {
  items: MiniNfcCardItem[];
  templateType?: NfcPrintTemplateType;
  showSerialText?: boolean;
  templateBuffer?: ArrayBuffer | Uint8Array;
  onProgress?: (current: number, total: number) => void;
}

// 1 mm in PDF points (72 pt / 25.4 mm)
const MM_TO_PT = 72 / 25.4;

// Standard ISO A4 height in millimeters
const A4_HEIGHT_MM = 297.0;

/**
 * Creates high-resolution QR artwork (with optional serial text),
 * automatically mirrored if template requires mirror reverse printing.
 */
async function createQrBoxDataUrl(
  code: string,
  showSerialText: boolean,
  isMirrored: boolean
): Promise<string> {
  const activateUrl = `https://risev.app/nfc?c=${code.trim().toUpperCase()}`;

  // 1. Generate base high-resolution QR code
  const rawQrDataUrl = await QRCode.toDataURL(activateUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 380,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  // If in browser environment with Canvas available, compose artwork
  if (typeof document !== 'undefined') {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawQrDataUrl);
          return;
        }

        // Fill background white
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Apply horizontal mirror if required
        if (isMirrored) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }

        if (showSerialText) {
          // Draw QR at top
          ctx.drawImage(img, 45, 12, 310, 310);

          // Draw monospace serial text underneath
          ctx.font = 'bold 34px "JetBrains Mono", Courier, monospace';
          ctx.fillStyle = '#000000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(code.trim().toUpperCase(), 200, 362);
        } else {
          // Centered pure QR
          ctx.drawImage(img, 15, 15, 370, 370);
        }

        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(rawQrDataUrl);
      img.src = rawQrDataUrl;
    });
  }

  return rawQrDataUrl;
}

/**
 * Generates Manufacturer Print-Ready PDF with unique QR codes
 * imprinted directly onto the Risev Mini NFC Card template.
 */
export async function generateMiniNfcPrintPdf(options: GeneratePdfOptions): Promise<Uint8Array> {
  const {
    items,
    templateType = '10_up_mirror',
    showSerialText = true,
    templateBuffer,
    onProgress,
  } = options;

  if (!items || items.length === 0) {
    throw new Error('At least one card item is required to generate PDF');
  }

  const config = TEMPLATE_CONFIGS[templateType] || TEMPLATE_CONFIGS['10_up_mirror'];

  // 1. Obtain master template PDF bytes
  let masterBytes: ArrayBuffer | Uint8Array;
  if (templateBuffer) {
    masterBytes = templateBuffer;
  } else {
    const templatePath = `/templates/${config.filename}`;
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

  // Fallback font if canvas is unavailable (Node.js test environments)
  const fallbackFont = (!config.isMirrored && showSerialText)
    ? await pdfDoc.embedFont(StandardFonts.CourierBold)
    : null;

  const totalCards = items.length;
  const cardsPerPage = config.cardsPerPage;
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

      const col = slotIdx % config.cols;
      const row = Math.floor(slotIdx / config.cols);

      // Card top-left position on page in mm
      const cardX_mm = config.colX_mm[col];
      const cardY_mm = config.rowY_mm[row];

      // White spot absolute position on page in mm (from top-left)
      const spotX_mm = cardX_mm + config.relSpotX_mm;
      const spotY_mm = cardY_mm + config.relSpotY_mm;

      // Generate QR data URL (with canvas mirroring and serial text)
      const qrDataUrl = await createQrBoxDataUrl(
        item.code,
        showSerialText,
        config.isMirrored
      );

      const qrImage = await pdfDoc.embedPng(qrDataUrl);

      // In browser, the canvas rendered both QR and text into the square box
      const boxSize_mm = 21.6;
      const boxOffsetX_mm = (config.spotWidth_mm - boxSize_mm) / 2;
      const boxOffsetY_mm = (config.spotHeight_mm - boxSize_mm) / 2;

      const boxX_pt = (spotX_mm + boxOffsetX_mm) * MM_TO_PT;
      const boxY_pt = (A4_HEIGHT_MM - (spotY_mm + boxOffsetY_mm + boxSize_mm)) * MM_TO_PT;
      const boxSize_pt = boxSize_mm * MM_TO_PT;

      currentPage.drawImage(qrImage, {
        x: boxX_pt,
        y: boxY_pt,
        width: boxSize_pt,
        height: boxSize_pt,
      });

      // If in Node fallback environment without canvas and not mirrored
      if (typeof document === 'undefined' && showSerialText && fallbackFont) {
        const fontSize = 4.3;
        const textStr = item.code.trim().toUpperCase();
        const textWidth = fallbackFont.widthOfTextAtSize(textStr, fontSize);
        const spotCenter_pt = (spotX_mm + config.spotWidth_mm / 2) * MM_TO_PT;
        const textX_pt = spotCenter_pt - textWidth / 2;
        const textY_pt = (A4_HEIGHT_MM - (spotY_mm + 17.2 + 3.4)) * MM_TO_PT;

        currentPage.drawText(textStr, {
          x: textX_pt,
          y: textY_pt,
          size: fontSize,
          font: fallbackFont,
          color: rgb(0, 0, 0),
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
 * Backward compatibility alias for generateMiniNfcPrintPdf.
 */
export const generateMiniNfc8UpPdf = generateMiniNfcPrintPdf;

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
