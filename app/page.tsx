'use client';

import React, { useState } from "react";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const PDFCropper = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [currentFile, setCurrentFile] = useState<string>("");
  const [totalFiles, setTotalFiles] = useState(0);
  const [processedFiles, setProcessedFiles] = useState(0);
  const [addOriginText, setAddOriginText] = useState(false);

  const processPDF = async (file: File) => {
    try {
      setCurrentFile(file.name);
      const arrayBuffer = await file.arrayBuffer();
      setProgress(40);
      
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      setProgress(50);

      const pages = pdfDoc.getPages();
      const totalPages = pages.length;
      
      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        const newHeight = height * (4 / 6);
        page.setCropBox(0, height - newHeight, width, newHeight);
        
        if (addOriginText) {
          const text = "Made In China";
          const fontSize = 12;
          const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
          page.drawText(text, {
            x: (width - textWidth) / 2,
            y: fontSize * 2 + height - newHeight,
            size: fontSize,
            font: helveticaFont
          });
        }
        
        setProgress(50 + Math.floor((index + 1) / totalPages * 30));
      });

      const modifiedPdfBytes = await pdfDoc.save();
      setProgress(90);

      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.name.replace('.pdf', '')}-cropped.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setProgress(100);
    } catch (error) {
      console.error('Error cropping PDF:', error);
    }
  };

  const processFiles = async (files: File[]) => {
    const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      alert('请上传有效的PDF文件。');
      return;
    }

    setProcessing(true);
    setTotalFiles(pdfFiles.length);
    setProcessedFiles(0);

    for (const file of pdfFiles) {
      await processPDF(file);
      setProcessedFiles(prev => prev + 1);
      setProgress(0);
    }

    setProcessing(false);
    setCurrentFile("");
    setProgress(0);
    setTotalFiles(0);
    setProcessedFiles(0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    await processFiles(Array.from(files));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await processFiles(Array.from(files));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>亚马逊 FBA 标签裁切工具</CardTitle>
          <CardDescription>
            将 4x6 英寸的 PDF 标签裁切成 4x4 英寸
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={addOriginText}
                onChange={(e) => setAddOriginText(e.target.checked)}
                className="form-checkbox h-4 w-4"
              />
              <span className="text-sm text-gray-600">添加&quot;Made In China&quot;原产国标识</span>
            </label>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center">
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                拖拽一个或多个 PDF 文件到这里, 或者
              </p>
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={processing}
              >
                选择文件
              </Button>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf"
                multiple
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {processing && (
            <div className="mt-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-500 mt-2 text-center">
                正在处理: {currentFile} ({processedFiles + 1}/{totalFiles})
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFCropper;
