import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { PDFDocument } from 'pdf-lib';
import { generateActivationQrSheetPdf } from './activationQrSheetPdf';

// One-off verification: renders a real 30-code sheet with the production QR
// renderer and writes it to scratch/ so it can be opened and inspected.
describe('sample sheet', () => {
  it('renders a real 30-code sheet with the production renderer', async () => {
    const codes = Array.from({ length: 30 }, (_, i) => `RSV-QA${String(i).padStart(2, '0')}-TEST`);
    const bytes = await generateActivationQrSheetPdf({ codes, quota: 500 });

    fs.writeFileSync('scratch/activation-qr-sample.pdf', Buffer.from(bytes));

    const doc = await PDFDocument.load(bytes);
    const [page] = doc.getPages();
    console.log(
      `sample: ${bytes.length} bytes, ${doc.getPageCount()} page, ` +
        `page ${page.getWidth().toFixed(2)} x ${page.getHeight().toFixed(2)} pt`
    );

    expect(doc.getPageCount()).toBe(1);
    expect(page.getWidth()).toBeCloseTo(595.28, 1);
    expect(page.getHeight()).toBeCloseTo(841.89, 1);
    // Regression guard: uncompressed streams ballooned this to ~129 MB.
    expect(bytes.byteLength).toBeLessThan(2_000_000);
  });
});
