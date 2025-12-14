"use client";

import { useState } from "react";
import Image from "next/image";
import { User, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showUploadButton?: boolean;
  onUpload?: (file: File) => void;
  editable?: boolean;
}

export default function Avatar({
  src,
  alt,
  name,
  size = "md",
  className,
  showUploadButton = false,
  onUpload,
  editable = false
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-xl"
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const avatarContent = () => {
    if (src && !imageError) {
      return (
        <Image
          src={src}
          alt={alt || name || "User avatar"}
          fill
          className="object-cover rounded-full"
          onError={handleImageError}
        />
      );
    }

    if (name) {
      return (
        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
          {getInitials(name)}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-700">
        <User className="w-1/2 h-1/2 text-gray-400" />
      </div>
    );
  };

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          "relative rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600",
          sizeClasses[size],
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {avatarContent()}
        
        {editable && isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
            <Camera className="w-1/3 h-1/3 text-white" />
          </div>
        )}
      </div>

      {showUploadButton && editable && (
        <label className="absolute -bottom-1 -right-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 cursor-pointer transition-colors">
          <Camera className="w-3 h-3" />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
} 