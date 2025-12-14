"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon, Upload, X, Link as LinkIcon } from "lucide-react";

interface ImageUploadProps {
  onImageUrlChange: (url: string) => void;
  currentImageUrl?: string;
}

export default function ImageUpload({ onImageUrlChange, currentImageUrl }: ImageUploadProps) {
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("url");
  const [imageUrl, setImageUrl] = useState(currentImageUrl || "");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUrlChange = (url: string) => {
    // Convert Google Drive URLs to direct image links
    let processedUrl = url;
    
    // Handle Google Drive URLs
    if (url.includes('drive.google.com/file/d/')) {
      const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
      if (fileIdMatch) {
        processedUrl = `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
      }
    } else if (url.includes('drive.google.com/open?id=')) {
      const fileIdMatch = url.match(/id=([a-zA-Z0-9-_]+)/);
      if (fileIdMatch) {
        processedUrl = `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
      }
    }
    
    setImageUrl(processedUrl);
    onImageUrlChange(processedUrl);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Convert file to base64 directly in the browser
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target?.result as string;
        handleUrlChange(base64Data);
        setSelectedFile(null);
        setUploading(false);
        alert('Image processed successfully!');
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={uploadMethod === "url" ? "default" : "outline"}
          size="sm"
          onClick={() => setUploadMethod("url")}
          className="flex items-center gap-2"
        >
          <LinkIcon className="h-4 w-4" />
          Image URL
        </Button>
        <Button
          type="button"
          variant={uploadMethod === "file" ? "default" : "outline"}
          size="sm"
          onClick={() => setUploadMethod("file")}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload File
        </Button>
      </div>

      {uploadMethod === "url" ? (
        <div className="space-y-2">
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
          />
          {imageUrl && (
            <div className="relative">
              <img 
                src={imageUrl} 
                alt="Question" 
                className="max-w-xs rounded-lg border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  alert('Failed to load image. Please check the URL.');
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleUrlChange("");
                  setSelectedFile(null);
                }}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {selectedFile ? selectedFile.name : "Click to select image"}
              </p>
            </label>
          </div>
          
          {selectedFile && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
              <div className="flex gap-2">
                <Button
                  onClick={handleFileUpload}
                  disabled={uploading}
                  className="flex-1"
                >
                  {uploading ? "Uploading..." : "Upload Image"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    handleUrlChange("");
                  }}
                  className="px-3"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Image Preview */}
          {(imageUrl || currentImageUrl) && (
            <div className="relative">
              <img 
                src={imageUrl || currentImageUrl} 
                alt="Question" 
                className="max-w-xs rounded-lg border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  alert('Failed to load image. Please check the URL.');
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleUrlChange("");
                  setSelectedFile(null);
                }}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Quick URL Examples */}
      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          Quick examples you can use:
        </p>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => handleUrlChange("https://via.placeholder.com/400x300/0066cc/ffffff?text=Math+Question")}
            className="text-xs text-blue-600 hover:text-blue-800 block"
          >
            📐 Math Question Placeholder
          </button>
          <button
            type="button"
            onClick={() => handleUrlChange("https://via.placeholder.com/400x300/ff6b6b/ffffff?text=Geometry+Problem")}
            className="text-xs text-blue-600 hover:text-blue-800 block"
          >
            📏 Geometry Problem Placeholder
          </button>
          <button
            type="button"
            onClick={() => handleUrlChange("https://via.placeholder.com/400x300/51cf66/ffffff?text=Algebra+Equation")}
            className="text-xs text-blue-600 hover:text-blue-800 block"
          >
            ➗ Algebra Equation Placeholder
          </button>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            Google Drive URL Format:
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Paste your Google Drive sharing URL and it will be automatically converted to the correct format.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Example: https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing
          </p>
        </div>
      </div>
    </div>
  );
} 