'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PropertyImageGalleryProps {
  images: string[];
  onImageUpload?: (files: FileList) => void;
  isEditable?: boolean;
}

export default function PropertyImageGallery({
  images,
  onImageUpload,
  isEditable = false
}: PropertyImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageUpload?.(e.target.files);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative h-96 bg-gray-100 rounded-xl overflow-hidden">
        {images.length > 0 ? (
          <Image
            src={images[activeImage]}
            alt="Property"
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No Images Available
          </div>
        )}

        {/* Upload Button */}
        {isEditable && (
          <div className="absolute bottom-4 right-4">
            <label className="cursor-pointer">
              <span className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
                Upload Images
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden ${
                activeImage === index ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 