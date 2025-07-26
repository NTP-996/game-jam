'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Check, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { ProjectUploadService, ImageType } from '@/lib/projectUpload'

interface ImageUploadProps {
  imageType: ImageType
  currentUrl?: string
  onUpload: (url: string) => void
  onDelete?: () => void
  disabled?: boolean
  className?: string
}

export default function ImageUpload({
  imageType,
  currentUrl,
  onUpload,
  onDelete,
  disabled = false,
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const recommendations = ProjectUploadService.getRecommendedDimensions(imageType)

  const handleFileSelect = async (file: File) => {
    if (disabled) return

    setError(null)
    setUploading(true)

    try {
      // Validate file
      const validation = ProjectUploadService.validateFile(file, imageType)
      if (!validation.valid) {
        setError(validation.error || 'Invalid file')
        setUploading(false)
        return
      }

      // Create preview
      const previewUrl = ProjectUploadService.createPreviewUrl(file)
      setPreview(previewUrl)

      // Optionally resize image for better performance
      const processedFile = await ProjectUploadService.resizeImage(file, imageType)

      // Upload file
      const result = await ProjectUploadService.uploadProjectImage(processedFile, imageType)

      if (result.success && result.imageUrl) {
        onUpload(result.imageUrl)
        // Clean up preview since we have the final URL
        if (preview) {
          ProjectUploadService.revokePreviewUrl(preview)
          setPreview(null)
        }
      } else {
        setError(result.error || 'Upload failed')
        // Clean up preview on error
        if (previewUrl) {
          ProjectUploadService.revokePreviewUrl(previewUrl)
          setPreview(null)
        }
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('An unexpected error occurred')
      if (preview) {
        ProjectUploadService.revokePreviewUrl(preview)
        setPreview(null)
      }
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleDelete = async () => {
    if (currentUrl && onDelete) {
      const success = await ProjectUploadService.deleteProjectImage(currentUrl, imageType)
      if (success) {
        onDelete()
      }
    }
  }

  const displayUrl = preview || currentUrl
  const hasImage = Boolean(displayUrl)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer
          ${dragOver 
            ? 'border-blue-400 bg-blue-500/10' 
            : hasImage 
              ? 'border-green-500 bg-green-500/10' 
              : 'border-purple-500/50 bg-purple-500/5 hover:border-purple-400 hover:bg-purple-500/10'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ProjectUploadService['ALLOWED_TYPES'][imageType].join(',')}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileSelect(file)
          }}
          className="hidden"
          disabled={disabled}
        />

        {uploading ? (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-purple-300 text-sm">Uploading {imageType}...</p>
          </div>
        ) : hasImage ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="relative w-full max-w-md">
              <Image
                src={displayUrl}
                alt={`${imageType} preview`}
                width={imageType === 'logo' ? 200 : 400}
                height={imageType === 'logo' ? 200 : 225}
                className={`
                  rounded-lg object-cover mx-auto
                  ${imageType === 'logo' ? 'w-32 h-32' : 'w-full h-40'}
                `}
                onError={() => setError('Failed to load image')}
              />
              {currentUrl && onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete()
                  }}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition-colors"
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center space-x-2 text-green-400">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">
                {imageType.charAt(0).toUpperCase() + imageType.slice(1)} uploaded
              </span>
            </div>
            <p className="text-purple-300 text-xs text-center">
              Click to replace or drag new file here
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full">
              {imageType === 'screenshot' ? (
                <ImageIcon className="w-6 h-6 text-purple-400" />
              ) : (
                <Upload className="w-6 h-6 text-purple-400" />
              )}
            </div>
            <div className="text-center">
              <p className="text-purple-200 font-medium">
                Upload {imageType.charAt(0).toUpperCase() + imageType.slice(1)}
              </p>
              <p className="text-purple-400 text-sm">
                Drag & drop or click to browse
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <h4 className="text-blue-400 font-medium text-sm mb-2">Recommended:</h4>
        <div className="text-blue-200 text-xs space-y-1">
          <p>• Dimensions: {recommendations.width}x{recommendations.height} ({recommendations.ratio})</p>
          <p>• Format: {ProjectUploadService['ALLOWED_TYPES'][imageType].join(', ')}</p>
          <p>• Max size: {ProjectUploadService['MAX_FILE_SIZES'][imageType] / (1024 * 1024)}MB</p>
          {imageType === 'logo' && <p>• Transparent background preferred</p>}
          {imageType === 'banner' && <p>• High contrast for readability</p>}
          {imageType === 'screenshot' && <p>• Show gameplay, not menus</p>}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
} 