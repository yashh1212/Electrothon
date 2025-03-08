import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Upload, File, X, Check } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  accept?: string;
  acceptedTypes?: string; // Added to match usage in CreateExamForm
  maxSize?: number; // in MB
  title?: string; // Made optional
  description?: string; // Made optional
  label?: string; // Added to match usage in CreateExamForm
  onFileSelect: (file: File) => void;
  onUpload?: (file: File) => void; // Added to match usage in CreateExamForm
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept = ".pdf,.doc,.docx",
  acceptedTypes, // Use this if provided
  maxSize = 10,
  title,
  description,
  label,
  onFileSelect,
  onUpload,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.size > maxSize * 1024 * 1024) {
      toast.error(`File is too large. Maximum size is ${maxSize}MB.`);
      return;
    }

    setFile(selectedFile);
    if (onUpload) {
      onUpload(selectedFile); // Use onUpload if provided
    }
    onFileSelect(selectedFile); // Always call onFileSelect
    toast.success("File uploaded successfully");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];

    if (!droppedFile) return;

    if (droppedFile.size > maxSize * 1024 * 1024) {
      toast.error(`File is too large. Maximum size is ${maxSize}MB.`);
      return;
    }

    setFile(droppedFile);
    if (onUpload) {
      onUpload(droppedFile); // Use onUpload if provided
    }
    onFileSelect(droppedFile); // Always call onFileSelect
    toast.success("File uploaded successfully");
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Use provided props with fallbacks
  const displayTitle = title || label || "Upload File";
  const displayDescription =
    description || `Supports ${acceptedTypes || accept} (Max ${maxSize}MB)`;
  const acceptValue = acceptedTypes || accept;

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{displayTitle}</h3>
        <p className="text-muted-foreground text-sm">{displayDescription}</p>
      </div>

      {!file ? (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragging ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={acceptValue}
            onChange={handleFileChange}
          />

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-medium">Drag & drop your file here or</p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports {acceptValue.split(",").join(", ")} (Max {maxSize}MB)
              </p>
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="mt-2"
              >
                Browse files
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-xl p-6 flex items-center justify-between animate-scale-in">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <File className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm truncate max-w-[200px] md:max-w-xs">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full bg-green-50 text-green-600 hover:bg-green-100"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
              onClick={clearFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
