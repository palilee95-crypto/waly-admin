import { describe, it, expect } from 'vitest';
import {
  SHEET,
  PITCH_MM,
  buildStickerSlots,
  countPages,
  formatQuotaLabel,
} from './activationQrSheetPdf';

describe('SHEET constants', () => {
  it('describes a 29 mm sticker on a 2 mm gutter, 6 x 8 per A4 page', () => {
    expect(SHEET.PAGE_W_MM).toBe(210);
    expect(SHEET.PAGE_H_MM).toBe(297);
    expect(SHEET.STICKER_MM).toBe(29);
    expect(SHEET.GUTTER_MM).toBe(2);
    expect(SHEET.COLS).toBe(6);
    expect(SHEET.ROWS).toBe(8);
    expect(SHEET.PER_PAGE).toBe(48);
    expect(PITCH_MM).toBe(31);
  });

  it('keeps the whole grid inside the printable area', () => {
    const gridWidth = SHEET.COLS * SHEET.STICKER_MM + (SHEET.COLS - 1) * SHEET.GUTTER_MM;
    const gridHeight = SHEET.ROWS * SHEET.STICKER_MM + (SHEET.ROWS - 1) * SHEET.GUTTER_MM;
    expect(gridWidth).toBe(184);
    expect(gridHeight).toBe(246);
    expect(SHEET.GRID_ORIGIN_X_MM * 2 + gridWidth).toBeLessThanOrEqual(SHEET.PAGE_W_MM);
    expect(SHEET.GRID_ORIGIN_Y_MM + gridHeight).toBeLessThanOrEqual(SHEET.PAGE_H_MM - 8);
  });
});

describe('countPages', () => {
  it('paginates at 48 stickers per page', () => {
    expect(countPages(0)).toBe(0);
    expect(countPages(30)).toBe(1);
    expect(countPages(48)).toBe(1);
    expect(countPages(49)).toBe(2);
    expect(countPages(96)).toBe(2);
    expect(countPages(100)).toBe(3);
  });
});

describe('formatQuotaLabel', () => {
  it('renders the quota as an uppercased members label', () => {
    expect(formatQuotaLabel(500)).toBe('500 MEMBERS');
    expect(formatQuotaLabel(3000)).toBe('3000 MEMBERS');
  });
});

describe('buildStickerSlots', () => {
  it('returns one slot per code', () => {
    expect(buildStickerSlots(0)).toHaveLength(0);
    expect(buildStickerSlots(30)).toHaveLength(30);
  });

  it('places the first sticker at the grid origin', () => {
    const [first] = buildStickerSlots(1);
    expect(first).toEqual({
      index: 0,
      page: 0,
      col: 0,
      row: 0,
      xMm: 13,
      yMm: 33.5,
    });
  });

  it('places the 6th sticker in column 0 of row 1', () => {
    const slot = buildStickerSlots(7)[6];
    expect(slot.col).toBe(0);
    expect(slot.row).toBe(1);
    expect(slot.xMm).toBe(13);
    expect(slot.yMm).toBe(64.5);
  });

  it('places the 48th sticker (index 47) at the bottom-right of page 1', () => {
    const slot = buildStickerSlots(48)[47];
    expect(slot.page).toBe(0);
    expect(slot.col).toBe(5);
    expect(slot.row).toBe(7);
    expect(slot.xMm).toBe(168);
    expect(slot.yMm).toBe(250.5);
  });

  it('wraps to the top-left of page 2 at index 48', () => {
    const slot = buildStickerSlots(49)[48];
    expect(slot.page).toBe(1);
    expect(slot.col).toBe(0);
    expect(slot.row).toBe(0);
    expect(slot.xMm).toBe(13);
    expect(slot.yMm).toBe(33.5);
  });

  it('never places a sticker outside the page', () => {
    for (const slot of buildStickerSlots(100)) {
      expect(slot.xMm).toBeGreaterThanOrEqual(0);
      expect(slot.yMm).toBeGreaterThanOrEqual(0);
      expect(slot.xMm + SHEET.STICKER_MM).toBeLessThanOrEqual(SHEET.PAGE_W_MM);
      expect(slot.yMm + SHEET.STICKER_MM).toBeLessThanOrEqual(SHEET.PAGE_H_MM);
    }
  });
});

import { beforeAll, vi } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import QRCodeLib from 'qrcode';
import {
  generateActivationQrSheetPdf,
  defaultRenderQrPng,
} from './activationQrSheetPdf';

// A real, tiny QR PNG produced once so jsPDF always receives a valid image.
let stubQrDataUrl = '';
beforeAll(async () => {
  const buffer = await QRCodeLib.toBuffer('https://risev.app/nfc?c=STUB', {
    errorCorrectionLevel: 'H',
    margin: 4,
    width: 64,
  });
  stubQrDataUrl = `data:image/png;base64,${buffer.toString('base64')}`;
});

const renderStub = async () => stubQrDataUrl;

function codes(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `RSV-TEST-${String(i).padStart(4, '0')}`);
}

describe('generateActivationQrSheetPdf', () => {
  it('throws when there are no codes', async () => {
    await expect(
      generateActivationQrSheetPdf({ codes: [], quota: 500, renderQrPng: renderStub })
    ).rejects.toThrow(/at least one activation code/i);
  });

  it('produces one page for 30 codes', async () => {
    const bytes = await generateActivationQrSheetPdf({
      codes: codes(30),
      quota: 500,
      renderQrPng: renderStub,
    });
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
  });

  it('paginates 100 codes across three pages', async () => {
    const bytes = await generateActivationQrSheetPdf({
      codes: codes(100),
      quota: 500,
      renderQrPng: renderStub,
    });
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(3);
  });

  it('renders exactly one QR image per code and encodes the activation URL', async () => {
    const renderQrPng = vi.fn(renderStub);
    await generateActivationQrSheetPdf({
      codes: codes(30),
      quota: 500,
      renderQrPng,
    });
    expect(renderQrPng).toHaveBeenCalledTimes(30);
    expect(renderQrPng).toHaveBeenNthCalledWith(1, 'https://risev.app/nfc?c=RSV-TEST-0000');
  });

  it('draws the quota band on every page', async () => {
    const bytes = await generateActivationQrSheetPdf({
      codes: codes(100),
      quota: 500,
      renderQrPng: renderStub,
    });
    const text = new TextDecoder().decode(bytes);
    const occurrences = text.split('500 MEMBERS').length - 1;
    expect(occurrences).toBe(3);
  });

  it('honours a custom label', async () => {
    const bytes = await generateActivationQrSheetPdf({
      codes: codes(2),
      quota: 500,
      label: 'RSV - TIKTOK SHOP - 500 MEMBERS',
      renderQrPng: renderStub,
    });
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain('RSV - TIKTOK SHOP - 500 MEMBERS');
  });

  it('reports progress once per code', async () => {
    const onProgress = vi.fn();
    await generateActivationQrSheetPdf({
      codes: codes(5),
      quota: 500,
      renderQrPng: renderStub,
      onProgress,
    });
    expect(onProgress).toHaveBeenCalledTimes(5);
    expect(onProgress).toHaveBeenLastCalledWith(5, 5);
  });
});

describe('defaultRenderQrPng', () => {
  it('returns a PNG data URL', async () => {
    const dataUrl = await defaultRenderQrPng('https://risev.app/nfc?c=RSV-TEST-0000');
    expect(dataUrl.startsWith('data:image/png;base64,')).toBe(true);
  });
});
