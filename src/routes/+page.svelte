<script lang="ts">
	import Upload from '@lucide/svelte/icons/upload';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	let isDragging = $state(false);
	let progress = $state(0);
	let processing = $state(false);
	let currentFile = $state('');
	let totalFiles = $state(0);
	let processedFiles = $state(0);
	let addOriginText = $state(false);
	let removeTextArea = $state(false);

	let fileInput: HTMLInputElement | null = $state(null);

	async function processPDF(file: File) {
		try {
			currentFile = file.name;
			const arrayBuffer = await file.arrayBuffer();
			progress = 40;

			const { cropLabelPdf, downloadBytesAsPdf } = await import('$lib/pdf');
			progress = 50;

			const bytes = await cropLabelPdf(
				arrayBuffer,
				{ addOriginText, removeTextArea },
				(done, total) => {
					progress = 50 + Math.floor((done / total) * 30);
				}
			);
			progress = 90;

			const downloadName = `${file.name.replace(/\.pdf$/i, '')}-cropped.pdf`;
			downloadBytesAsPdf(bytes, downloadName);
			progress = 100;
		} catch (error) {
			console.error('Error cropping PDF:', error);
		}
	}

	async function processFiles(files: File[]) {
		const pdfFiles = files.filter((file) => file.type === 'application/pdf');

		if (pdfFiles.length === 0) {
			alert('请上传有效的PDF文件。');
			return;
		}

		processing = true;
		totalFiles = pdfFiles.length;
		processedFiles = 0;

		for (const file of pdfFiles) {
			await processPDF(file);
			processedFiles += 1;
			progress = 0;
		}

		processing = false;
		currentFile = '';
		progress = 0;
		totalFiles = 0;
		processedFiles = 0;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}

	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		const files = e.dataTransfer?.files;
		if (files) {
			await processFiles(Array.from(files));
		}
	}

	async function handleFileSelect(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		const files = target.files;
		if (files) {
			await processFiles(Array.from(files));
		}
	}
</script>

<svelte:head>
	<title>亚马逊 FBA 标签裁切器</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
	<Card.Root class="w-full max-w-lg">
		<Card.Header>
			<Card.Title>亚马逊 FBA 标签裁切工具</Card.Title>
			<Card.Description>将 4x6 英寸的 PDF 标签裁切成 4x4 英寸</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="mb-4 space-y-2">
				<div class="flex items-center space-x-2">
					<Checkbox id="add-origin-text" bind:checked={addOriginText} />
					<Label for="add-origin-text" class="text-sm text-gray-600">
						添加&quot;Made In China&quot;原产国标识
					</Label>
				</div>
				<div class="flex items-center space-x-2">
					<Checkbox id="remove-text-area" bind:checked={removeTextArea} />
					<Label for="remove-text-area" class="text-sm text-gray-600">移除公司抬头</Label>
				</div>
			</div>

			<div
				role="button"
				tabindex="0"
				class={[
					'rounded-lg border-2 border-dashed p-8 text-center transition-colors',
					isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
				]}
				ondragover={handleDragOver}
				ondragleave={handleDragLeave}
				ondrop={handleDrop}
			>
				<div class="flex flex-col items-center justify-center">
					<Upload class="mb-4 h-12 w-12 text-gray-400" />
					<p class="mb-2 text-gray-600">拖拽一个或多个 PDF 文件到这里, 或者</p>
					<Button variant="outline" onclick={() => fileInput?.click()} disabled={processing}>
						选择文件
					</Button>
					<input
						bind:this={fileInput}
						type="file"
						class="hidden"
						accept=".pdf"
						multiple
						onchange={handleFileSelect}
					/>
				</div>
			</div>

			{#if processing}
				<div class="mt-4">
					<Progress value={progress} class="w-full" />
					<p class="mt-2 text-center text-sm text-gray-500">
						正在处理: {currentFile} ({processedFiles + 1}/{totalFiles})
					</p>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
