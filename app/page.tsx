'use client';

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
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

  const cropPDF = async (file: File) => {
    try {
      setProcessing(true);
      setProgress(20);

      const arrayBuffer = await file.arrayBuffer();
      setProgress(40);
      
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setProgress(50);

      const pages = pdfDoc.getPages();
      const totalPages = pages.length;
      
      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        const newHeight = height * (4 / 6);
        page.setCropBox(0, height - newHeight, width, newHeight);
        
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
      setTimeout(() => {
        setProcessing(false);
        setProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Error cropping PDF:', error);
    } finally {
      setProcessing(false);
      setProgress(0);
    }
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

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      await cropPDF(file);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      await cropPDF(file);
    } else {
      alert('Please upload a valid PDF file.');
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
                拖拽 PDF 文件到这里, 或者
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
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {processing && (
            <div className="mt-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-500 mt-2 text-center">
                正在处理...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFCropper;
