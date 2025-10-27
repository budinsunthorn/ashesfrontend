'use client';
import React, { useState, useRef } from 'react';
import { uploadImageToS3Direct, validateImageFile } from '@/utils/s3Upload';
import warnAlert from '../notification/warnAlert';
import successAlert from '../notification/successAlert';
import { BiLoaderAlt } from 'react-icons/bi';
import { IoCloudUploadOutline, IoClose } from 'react-icons/io5';

interface ImageUploadProps {
  label: string;
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  onImageRemoved: () => void;
  showImage: boolean;
  onShowImageToggle: (show: boolean) => void;
  imageWidth: number;
  imageHeight: number;
  onImageWidthChange: (width: number) => void;
  onImageHeightChange: (height: number) => void;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  showImage,
  onShowImageToggle,
  imageWidth,
  imageHeight,
  onImageWidthChange,
  onImageHeightChange,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      warnAlert(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadImageToS3Direct(file, (progress) => {
        setUploadProgress(progress.percentage);
      });

      if (result.success && result.url) {
        onImageUploaded(result.url);
        successAlert('Image uploaded successfully!');
      } else {
        warnAlert(result.error || 'Upload failed');
      }
    } catch (error) {
      warnAlert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    onImageRemoved();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <label className="font-medium">{label}</label>
        <label className="relative h-6 w-12">
          <input
            type="checkbox"
            className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
            checked={showImage}
            onChange={(e) => onShowImageToggle(e.target.checked)}
          />
          <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
        </label>
      </div>

      {showImage && (
        <>
          {/* Upload Area */}
          <div className="mb-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isUploading
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-300 hover:border-primary hover:bg-gray-50 dark:border-dark dark:hover:border-primary'
              }`}
              onClick={!isUploading ? triggerFileSelect : undefined}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <BiLoaderAlt className="animate-spin text-2xl text-primary mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Uploading... {uploadProgress.toFixed(0)}%
                  </p>
                </div>
              ) : currentImageUrl ? (
                <div className="flex flex-col items-center">
                  <img
                    src={currentImageUrl}
                    alt="Preview"
                    className="max-w-full max-h-32 object-contain mb-2 rounded"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click to change image
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <IoCloudUploadOutline className="text-3xl text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click to upload image
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    PNG, JPG, GIF, WebP up to 5MB
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Image Controls */}
          {currentImageUrl && (
            <div className="space-y-4">
              {/* Remove Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="btn btn-outline-danger btn-sm"
                >
                  <IoClose className="mr-1" />
                  Remove Image
                </button>
              </div>

              {/* Image Dimensions */}
              <div>
                <label className="block text-sm font-medium mb-2">Image Dimensions (px)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <span className="w-8 text-center text-sm">W</span>
                    <input
                      type="number"
                      min="1"
                      value={imageWidth}
                      onChange={(e) => onImageWidthChange(Number(e.target.value) || 1)}
                      className="w-full form-input no-spinner"
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="w-8 text-center text-sm">H</span>
                    <input
                      type="number"
                      min="1"
                      value={imageHeight}
                      onChange={(e) => onImageHeightChange(Number(e.target.value) || 1)}
                      className="w-full form-input no-spinner"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImageUpload; 