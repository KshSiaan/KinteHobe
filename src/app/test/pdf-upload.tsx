"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chunkDocument } from "@/lib/backend/chunker";

export function PdfUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (selectedFile: File) => {
    setError("");

    // Check if file is a PDF
    if (selectedFile.type !== "application/pdf") {
      setError("Please upload a PDF file only");
      return false;
    }

    // Check file size (optional - 10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      setError("File size must be less than 10MB");
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleClear = () => {
    setFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const chunked = await chunkDocument(file);

    console.log("Chunked Document:", chunked);
    // Add your upload logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">
            Upload PDF
          </h1>
          <p className="text-slate-600 text-center mb-8">
            Select or drag a PDF file to upload
          </p>

          {/* Upload Area */}
          {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
          {/** biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 bg-slate-50 hover:border-slate-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Upload PDF file"
            />

            {file ? (
              <div className="space-y-3">
                <FileText className="w-12 h-12 text-blue-500 mx-auto" />
                <p className="font-semibold text-slate-900">{file.name}</p>
                <p className="text-sm text-slate-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="font-semibold text-slate-900">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-slate-600">PDF files only</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            {file ? (
              <>
                <Button
                  onClick={handleUpload}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Upload PDF
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="w-full"
                >
                  Choose Different File
                </Button>
              </>
            ) : (
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Select PDF File
              </Button>
            )}
          </div>

          {/* File Info */}
          <p className="text-xs text-slate-500 text-center mt-4">
            Maximum file size: 10 MB
          </p>
        </div>
      </div>
    </div>
  );
}
