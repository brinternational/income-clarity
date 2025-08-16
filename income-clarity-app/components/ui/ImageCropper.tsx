'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, X, RotateCcw, ZoomIn, ZoomOut, Check } from 'lucide-react';

export interface ImageCropperProps {
  currentImage?: string;
  onImageChange: (dataUrl: string) => void;
  onCancel?: () => void;
  aspectRatio?: number; // width/height ratio, default 1 (square)
  maxSize?: number; // max file size in MB
  quality?: number; // JPEG quality 0-1
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function ImageCropper({
  currentImage,
  onImageChange,
  onCancel,
  aspectRatio = 1,
  maxSize = 5,
  quality = 0.9
}: ImageCropperProps) {
  const [image, setImage] = useState<string | null>(currentImage || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const dataUrl = await fileToDataUrl(file);
      setImage(dataUrl);
      
      // Reset crop settings
      setRotation(0);
      setZoom(1);
      setCrop({ x: 0, y: 0, width: 200, height: 200 });
    } catch (err) {
      setError('Failed to load image');
    } finally {
      setIsLoading(false);
    }
  }, [maxSize]);

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const cropImage = useCallback(async () => {
    if (!image || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    if (!ctx) return;

    // Set canvas size to crop dimensions
    const outputSize = 200; // Fixed output size
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Calculate scaling
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    // Apply transformations and crop
    ctx.save();
    
    // Center the crop area
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    
    // Draw the cropped portion
    ctx.drawImage(
      img,
      (crop.x * scaleX),
      (crop.y * scaleY),
      (crop.width * scaleX),
      (crop.height * scaleY),
      -outputSize / 2,
      -outputSize / 2,
      outputSize,
      outputSize
    );
    
    ctx.restore();

    // Convert to data URL
    const croppedDataUrl = canvas.toDataURL('image/jpeg', quality);
    onImageChange(croppedDataUrl);
  }, [image, crop, rotation, zoom, quality, onImageChange]);

  const resetCrop = () => {
    setRotation(0);
    setZoom(1);
    setCrop({ x: 0, y: 0, width: 200, height: 200 });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {!image ? (
        // Upload Area
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Upload Profile Picture
          </h4>
          
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop an image here, or click to browse
          </p>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Loading...' : 'Choose File'}
          </button>
          
          <p className="text-xs text-gray-500 mt-3">
            PNG, JPG or GIF up to {maxSize}MB
          </p>
        </div>
      ) : (
        // Crop Interface
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '300px' }}>
            <img
              ref={imageRef}
              src={image}
              alt="Profile preview"
              className="w-full h-full object-contain"
              style={{
                transform: `rotate(${rotation}deg) scale(${zoom})`,
                transformOrigin: 'center'
              }}
            />
            
            {/* Crop overlay would go here in a more advanced implementation */}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setRotation(r => r - 90)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Rotate left"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setZoom(z => Math.min(3, z + 0.1))}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              
              <button
                onClick={resetCrop}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Reset
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setImage(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Choose Different
              </button>
              
              <button
                onClick={cropImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Apply</span>
              </button>
            </div>
          </div>

          {/* Zoom slider */}
          <div className="flex items-center space-x-3">
            <ZoomOut className="w-4 h-4 text-gray-400" />
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1"
            />
            <ZoomIn className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />

      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}