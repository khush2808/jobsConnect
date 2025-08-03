import React, { useState, useRef } from "react";
import { Upload, X, FileText, Image } from "lucide-react";
import { Button } from "./Button";

const FileUpload = ({
  onFileSelect,
  accept,
  maxSize,
  fileType,
  disabled = false,
  className = "",
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (fileType === "pdf" && file.type !== "application/pdf") {
      alert("Please select a PDF file");
      return;
    }

    if (fileType === "image" && !file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size
    if (maxSize && file.size > maxSize) {
      alert(`File size too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = () => {
    if (fileType === "pdf") return <FileText className="h-8 w-8" />;
    if (fileType === "image") return <Image className="h-8 w-8" />;
    return <Upload className="h-8 w-8" />;
  };

  const getFileTypeText = () => {
    if (fileType === "pdf") return "PDF";
    if (fileType === "image") return "Image";
    return "File";
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {selectedFile ? (
        <div className="border-2 border-dashed border-primary/20 rounded-lg p-4 bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon()}
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center space-y-2">
            {getFileIcon()}
            <div>
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground">
                {getFileTypeText()} file (max{" "}
                {maxSize ? `${maxSize / (1024 * 1024)}MB` : "10MB"})
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { FileUpload };
