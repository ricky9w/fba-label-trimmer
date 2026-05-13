import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { cropLabelPdf } from './pdf';

const POINTS_PER_INCH = 72;
const FOUR_BY_SIX_WIDTH = 4 * POINTS_PER_INCH;
const FOUR_BY_SIX_HEIGHT = 6 * POINTS_PER_INCH;
const EXPECTED_CROPPED_HEIGHT = FOUR_BY_SIX_HEIGHT * (4 / 6);

async function makeFixturePdf(pageCount: number): Promise<Uint8Array> {
	const doc = await PDFDocument.create();
	for (let i = 0; i < pageCount; i++) {
		doc.addPage([FOUR_BY_SIX_WIDTH, FOUR_BY_SIX_HEIGHT]);
	}
	return doc.save();
}

describe('cropLabelPdf', () => {
	it('shrinks each page crop box to 4x4 inches and keeps width unchanged', async () => {
		const fixture = await makeFixturePdf(2);
		const cropped = await cropLabelPdf(fixture, {
			addOriginText: false,
			removeTextArea: false
		});

		const out = await PDFDocument.load(cropped);
		expect(out.getPageCount()).toBe(2);

		for (const page of out.getPages()) {
			const cropBox = page.getCropBox();
			expect(cropBox.width).toBeCloseTo(FOUR_BY_SIX_WIDTH, 5);
			expect(cropBox.height).toBeCloseTo(EXPECTED_CROPPED_HEIGHT, 5);
			expect(cropBox.y).toBeCloseTo(FOUR_BY_SIX_HEIGHT - EXPECTED_CROPPED_HEIGHT, 5);
			expect(cropBox.x).toBeCloseTo(0, 5);
		}
	});

	it('invokes onPageProgress once per page with running counts', async () => {
		const fixture = await makeFixturePdf(3);
		const calls: Array<[number, number]> = [];
		await cropLabelPdf(fixture, { addOriginText: false, removeTextArea: false }, (done, total) =>
			calls.push([done, total])
		);
		expect(calls).toEqual([
			[1, 3],
			[2, 3],
			[3, 3]
		]);
	});

	it('produces larger output when addOriginText is enabled (text drawn)', async () => {
		const fixture = await makeFixturePdf(1);
		const baseline = await cropLabelPdf(fixture, {
			addOriginText: false,
			removeTextArea: false
		});
		const withText = await cropLabelPdf(fixture, {
			addOriginText: true,
			removeTextArea: false
		});
		expect(withText.byteLength).toBeGreaterThan(baseline.byteLength);
	});

	it('produces larger output when removeTextArea draws the masking rectangle', async () => {
		const fixture = await makeFixturePdf(1);
		const baseline = await cropLabelPdf(fixture, {
			addOriginText: false,
			removeTextArea: false
		});
		const withMask = await cropLabelPdf(fixture, {
			addOriginText: false,
			removeTextArea: true
		});
		expect(withMask.byteLength).toBeGreaterThan(baseline.byteLength);
	});

	it('accepts both ArrayBuffer and Uint8Array inputs', async () => {
		const u8 = await makeFixturePdf(1);
		const arrayBuffer = u8.buffer.slice(
			u8.byteOffset,
			u8.byteOffset + u8.byteLength
		) as ArrayBuffer;

		const fromBuffer = await cropLabelPdf(arrayBuffer, {
			addOriginText: false,
			removeTextArea: false
		});
		const fromU8 = await cropLabelPdf(u8, {
			addOriginText: false,
			removeTextArea: false
		});

		expect(fromBuffer.byteLength).toBeGreaterThan(0);
		expect(fromU8.byteLength).toBeGreaterThan(0);
	});
});
