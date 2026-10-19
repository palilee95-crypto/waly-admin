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
