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
