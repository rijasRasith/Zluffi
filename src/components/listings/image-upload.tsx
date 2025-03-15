'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  images: string[];
  onUpload: (url: string) => void;
  onRemove: (url: string) => void;
  maxImages: number;
}

export default function ImageUpload({ images, onUpload, onRemove, maxImages }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) return;
    
    if (images.length + files.length > maxImages) {
      setUploadError(`You can only upload up to ${maxImages} images`);
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Image size should not exceed 5MB');
        setIsUploading(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to upload image');
        }
        
        onUpload(data.url);
      } catch (error) {
        console.error('Upload error:', error);
        setUploadError('Failed to upload image. Please try again.');
      }
    }
    
    setIsUploading(false);
    e.target.value = '';
  };
  
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        {images.map((url, index) => (
          <div key={index} className="relative h-32 bg-gray-100 rounded-md overflow-hidden">
            <Image
              src={url}
              alt={`Image ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(url)}
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <label className="h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition">
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={isUploading}
              multiple={maxImages - images.length > 1}
            />
            {isUploading ? (
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
            ) : (
              <>
                <Upload className="h-6 w-6 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">Upload Image</span>
              </>
            )}
          </label>
        )}
      </div>
      
      {uploadError && (
        <p className="text-sm text-red-600 mt-1">{uploadError}</p>
      )}
    </div>
  );
}
