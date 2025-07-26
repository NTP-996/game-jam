import { supabase } from './supabase'
import { ApiClient } from './apiClient'

export interface UploadResult {
  success: boolean
  imageUrl?: string
  error?: string
}

export type ImageType = 'banner' | 'logo' | 'screenshot'

export class ProjectUploadService {
  private static readonly MAX_FILE_SIZES = {
    banner: 10 * 1024 * 1024, // 10MB
    logo: 5 * 1024 * 1024,    // 5MB
    screenshot: 10 * 1024 * 1024 // 10MB
  }

  private static readonly ALLOWED_TYPES = {
    banner: ['image/jpeg', 'image/png', 'image/webp'],
    logo: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    screenshot: ['image/jpeg', 'image/png', 'image/webp']
  }

  private static readonly RECOMMENDED_DIMENSIONS = {
    banner: { width: 1920, height: 1080, ratio: '16:9' },
    logo: { width: 512, height: 512, ratio: '1:1' },
    screenshot: { width: 1920, height: 1080, ratio: '16:9' }
  }

  /**
   * Validate if the file is suitable for the specified image type
   */
  static validateFile(file: File, imageType: ImageType): { valid: boolean; error?: string } {
    // Check file size
    const maxSize = this.MAX_FILE_SIZES[imageType]
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      return {
        valid: false,
        error: `File size must be less than ${maxSizeMB}MB for ${imageType}`
      }
    }

    // Check file type
    const allowedTypes = this.ALLOWED_TYPES[imageType]
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File must be ${allowedTypes.join(', ')} for ${imageType}`
      }
    }

    return { valid: true }
  }

  /**
   * Upload project image
   */
  static async uploadProjectImage(file: File, imageType: ImageType): Promise<UploadResult> {
    try {
      // Validate file first
      const validation = this.validateFile(file, imageType)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', imageType)

      // Upload via API
      const response = await ApiClient.postFormData('/api/projects/images/upload', formData)
      const data = await response.json()

      if (response.ok && data.success) {
        return {
          success: true,
          imageUrl: data.imageUrl
        }
      } else {
        return {
          success: false,
          error: data.error || 'Upload failed'
        }
      }

    } catch (error) {
      console.error('Project image upload error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during upload'
      }
    }
  }

  /**
   * Delete project image
   */
  static async deleteProjectImage(imageUrl: string, imageType: ImageType): Promise<boolean> {
    try {
      const response = await ApiClient.delete(
        `/api/projects/images/upload?url=${encodeURIComponent(imageUrl)}&type=${imageType}`
      )

      return response.ok
    } catch (error) {
      console.error('Project image deletion error:', error)
      return false
    }
  }

  /**
   * Get recommended dimensions for image type
   */
  static getRecommendedDimensions(imageType: ImageType) {
    return this.RECOMMENDED_DIMENSIONS[imageType]
  }

  /**
   * Validate YouTube URL and extract video ID
   */
  static validateYouTubeUrl(url: string): { valid: boolean; videoId?: string; error?: string } {
    if (!url.trim()) {
      return { valid: false, error: 'Video URL is required' }
    }

    // YouTube URL patterns
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        const videoId = match[1]
        if (videoId && videoId.length === 11) {
          return { valid: true, videoId }
        }
      }
    }

    // Also accept Vimeo and other video platforms
    if (url.includes('vimeo.com') || url.includes('twitch.tv') || url.includes('loom.com')) {
      return { valid: true }
    }

    return { 
      valid: false, 
      error: 'Please provide a valid YouTube, Vimeo, or video platform URL' 
    }
  }

  /**
   * Get YouTube thumbnail URL from video URL
   */
  static getYouTubeThumbnail(url: string): string | null {
    const validation = this.validateYouTubeUrl(url)
    if (validation.valid && validation.videoId) {
      return `https://img.youtube.com/vi/${validation.videoId}/maxresdefault.jpg`
    }
    return null
  }

  /**
   * Resize image on client side before upload (optional optimization)
   */
  static async resizeImage(
    file: File, 
    imageType: ImageType, 
    quality: number = 0.9
  ): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        const recommended = this.RECOMMENDED_DIMENSIONS[imageType]
        let { width, height } = img

        // Calculate new dimensions based on recommended sizes
        if (imageType === 'logo') {
          // For logos, make square and resize to recommended size
          const size = Math.min(width, height)
          const targetSize = Math.min(size, recommended.width)
          width = height = targetSize
        } else {
          // For banners and screenshots, maintain aspect ratio
          const targetWidth = Math.min(width, recommended.width)
          const targetHeight = Math.min(height, recommended.height)
          
          const aspectRatio = width / height
          const targetAspectRatio = targetWidth / targetHeight
          
          if (aspectRatio > targetAspectRatio) {
            width = targetWidth
            height = width / aspectRatio
          } else {
            height = targetHeight
            width = height * aspectRatio
          }
        }

        // Set canvas dimensions and draw resized image
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        // Convert back to blob/file
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(resizedFile)
            } else {
              resolve(file) // Fallback to original if resize fails
            }
          },
          file.type,
          quality
        )
      }

      img.onerror = () => resolve(file) // Fallback to original if loading fails
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Get file size in human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Create image preview URL for display
   */
  static createPreviewUrl(file: File): string {
    return URL.createObjectURL(file)
  }

  /**
   * Clean up preview URL to prevent memory leaks
   */
  static revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url)
  }
}

export default ProjectUploadService 