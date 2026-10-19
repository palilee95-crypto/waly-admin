// src/lib/activationQrSheetPdf.ts
import jsPDF from 'jspdf';
import QRCodeLib from 'qrcode';

/** 1 mm expressed in PDF points (72 pt / 25.4 mm). */
export const MM_TO_PT = 72 / 25.4;

/**
 * Activation QR sticker sheet geometry (spec §2.1).
 * A4 portrait, 8 mm margins, 12 mm top band + 4 mm gap, 29 mm stickers on a
 * 2 mm cut gutter, 6 columns x 8 rows = 48 stickers per page.
 */
export const SHEET = {
  PAGE_W_MM: 210,
  PAGE_H_MM: 297,
  STICKER_MM: 29,
  GUTTER_MM: 2,
  COLS: 6,
  ROWS: 8,
  PER_PAGE: 48,
  MARGIN_X_MM: 8,
  BAND_Y_MM: 8,
  BAND_H_MM: 12,
  BAND_GAP_MM: 4,
  GRID_ORIGIN_X_MM: 13,
  GRID_ORIGIN_Y_MM: 33.5,
} as const;

/** Horizontal and vertical distance between sticker origins, in mm. */
export const PITCH_MM = SHEET.STICKER_MM + SHEET.GUTTER_MM;

/** Base URL each QR sticker encodes. */
export const ACTIVATE_URL_BASE = 'https://risev.app/nfc?c=';

export interface StickerSlot {
  index: number;
  page: number;
  col: number;
  row: number;
  xMm: number;
  yMm: number;
}

export function countPages(codeCount: number): number {
  return Math.ceil(codeCount / SHEET.PER_PAGE);
}

export function formatQuotaLabel(quota: number): string {
  return `${quota} MEMBERS`;
}

export function buildStickerSlots(count: number): StickerSlot[] {
  const slots: StickerSlot[] = [];
  for (let index = 0; index < count; index++) {
    const page = Math.floor(index / SHEET.PER_PAGE);
    const positionOnPage = index % SHEET.PER_PAGE;
    const col = positionOnPage % SHEET.COLS;
    const row = Math.floor(positionOnPage / SHEET.COLS);
    slots.push({
      index,
      page,
      col,
      row,
      xMm: SHEET.GRID_ORIGIN_X_MM + col * PITCH_MM,
      yMm: SHEET.GRID_ORIGIN_Y_MM + row * PITCH_MM,
    });
  }
  return slots;
}

export interface ActivationQrSheetOptions {
  /** Activation codes, e.g. ['RSV-8K2P-9M4X']. Order is preserved on the sheet. */
  codes: string[];
  /** Member capacity this batch grants; rendered in the page band. */
  quota: number;
  /** Optional override for the band text. Defaults to `${quota} MEMBERS`. */
  label?: string;
  /** Injectable QR renderer — defaults to real QR PNG generation. */
  renderQrPng?: (text: string) => Promise<string>;
  onProgress?: (done: number, total: number) => void;
  /**
   * Deflate the PDF streams (default true). Turning it off makes the drawn text
   * readable in the raw bytes — useful for debugging and byte-level assertions,
   * but it inflates the file dramatically because images go in uncompressed.
   */
  compress?: boolean;
}

/**
 * Renders a QR PNG data URL for one activation code.
 * 4-module quiet zone, EC level H, pure black for maximum contrast at 29 mm.
 */
export async function defaultRenderQrPng(text: string): Promise<string> {
  return QRCodeLib.toDataURL(text, {
    errorCorrectionLevel: 'H',
    margin: 4,
    // ~610 dpi at the 29 mm sticker size — crisply printed without bloating the PDF.
    width: 700,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
}

/**
 * Builds a print-ready A4 PDF of QR-only stickers (spec §2 and §3).
 * Pure with respect to the DOM: it returns bytes and never triggers a download.
 */
export async function generateActivationQrSheetPdf(
  options: ActivationQrSheetOptions
): Promise<Uint8Array> {
  const {
    codes,
    quota,
    label,
    renderQrPng = defaultRenderQrPng,
    onProgress,
    compress = true,
  } = options;

  if (!codes || codes.length === 0) {
    throw new Error('At least one activation code is required to build a QR sheet');
  }

  const bandText = label || formatQuotaLabel(quota);
  const slots = buildStickerSlots(codes.length);
  const totalPages = countPages(codes.length);

  // Render every QR up front so drawing below stays synchronous.
  const qrDataUrls: string[] = [];
  for (let i = 0; i < codes.length; i++) {
    const code = codes[i].trim().toUpperCase();
    qrDataUrls.push(await renderQrPng(ACTIVATE_URL_BASE + code));
    if (onProgress) onProgress(i + 1, codes.length);
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    // Compression must stay on in production: with it off, jsPDF embeds each QR
    // as an uncompressed bitmap and a 30-sticker page balloons past 100 MB.
    compress,
  });

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) {
      doc.addPage('a4', 'portrait');
    }

    // Top band — repeated on every page (spec §2.2).
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 109, 55); // #006d37
    doc.text(bandText, SHEET.PAGE_W_MM / 2, SHEET.BAND_Y_MM + SHEET.BAND_H_MM / 2, {
      align: 'center',
      baseline: 'middle',
    });

    for (const slot of slots) {
      if (slot.page !== page) continue;
      doc.addImage(
        qrDataUrls[slot.index],
        'PNG',
        slot.xMm,
        slot.yMm,
        SHEET.STICKER_MM,
        SHEET.STICKER_MM
      );
    }
  }

  return new Uint8Array(doc.output('arraybuffer'));
}
