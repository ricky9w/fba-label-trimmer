import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface CropOptions {
	addOriginText: boolean;
	removeTextArea: boolean;
}

/**
 * Crops 4x6 inch FBA label PDF pages down to 4x4, optionally masking the
 * company-header strip and stamping a centered "Made In China" line.
 * Pure transform: takes raw bytes in, returns the saved PDF bytes — runs in
 * Node and the browser, which keeps it unit-testable.
 */
export async function cropLabelPdf(
	bytes: ArrayBuffer | Uint8Array,
	opts: CropOptions,
	onPageProgress?: (done: number, total: number) => void
): Promise<Uint8Array> {
	const pdfDoc = await PDFDocument.load(bytes);
	const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const pages = pdfDoc.getPages();
	const total = pages.length;

	pages.forEach((page, index) => {
		const { width, height } = page.getSize();
		const newHeight = height * (4 / 6);
		page.setCropBox(0, height - newHeight, width, newHeight);

		if (opts.removeTextArea) {
			page.drawRectangle({
				x: 30,
				y: 376,
				width: 124,
				height: 8,
				color: rgb(1, 1, 1)
			});
		}

		if (opts.addOriginText) {
			const text = 'Made In China';
			const fontSize = 12;
			const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
			page.drawText(text, {
				x: (width - textWidth) / 2,
				y: fontSize * 2 + height - newHeight,
				size: fontSize,
				font: helveticaFont
			});
		}

		onPageProgress?.(index + 1, total);
	});

	return pdfDoc.save();
}

/** Browser-only: trigger a download of the given bytes as a PDF. */
export function downloadBytesAsPdf(bytes: Uint8Array, filename: string): void {
	const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
