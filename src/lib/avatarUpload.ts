import { supabase } from './supabase'
import ApiClient from './apiClient'

export interface UploadAvatarResult {
  success: boolean
  avatarUrl?: string
  error?: string
}

export class AvatarUploadService {
  private static readonly BUCKET_NAME = 'avatars'
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  /**
   * Validate if the file is suitable for avatar upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size must be less than ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`
      }
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'File must be JPEG, PNG, WebP, or GIF'
      }
    }

    return { valid: true }
  }

  /**
   * Upload avatar image and update user profile
   */
  static async uploadAvatar(file: File, userId: string): Promise<UploadAvatarResult> {
    try {
      // Validate file first
      const validation = this.validateFile(file)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Create form data
      const formData = new FormData()
      formData.append('avatar', file)

      // Upload via API
      const response = await ApiClient.postFormData('/api/profile/avatar', formData)

      const data = await response.json()

      if (response.ok && data.success) {
        return {
          success: true,
          avatarUrl: data.avatarUrl
        }
      } else {
        return {
          success: false,
          error: data.error || 'Upload failed'
        }
      }

    } catch (error) {
      console.error('Avatar upload error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during upload'
      }
    }
  }

  /**
   * Delete avatar from storage
   */
  static async deleteAvatar(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath])

      if (error) {
        console.error('Delete error:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Avatar deletion error:', error)
      return false
    }
  }

  /**
   * Generate avatar URL for a user
   */
  static getAvatarUrl(userId: string, filename?: string): string {
    if (!filename) {
      return '/next.svg' // Default avatar - simple icon
    }

    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(`${userId}/${filename}`)

    return data.publicUrl
  }

  /**
   * Extract filename from avatar URL
   */
  static extractFilenameFromUrl(avatarUrl: string): string | null {
    try {
      const url = new URL(avatarUrl)
      const pathParts = url.pathname.split('/')
      const avatarsIndex = pathParts.findIndex(part => part === 'avatars')
      
      if (avatarsIndex !== -1 && pathParts.length > avatarsIndex + 2) {
        // Return the filename part (everything after userId)
        return pathParts.slice(avatarsIndex + 2).join('/')
      }
      
      return null
    } catch {
      return null
    }
  }

  /**
   * Get optimized image URL with transformations
   */
  static getOptimizedAvatarUrl(
    userId: string, 
    filename: string, 
    options: {
      width?: number
      height?: number
      quality?: number
    } = {}
  ): string {
    const baseUrl = this.getAvatarUrl(userId, filename)
    
    // Add image transformation parameters if supported
    const params = new URLSearchParams()
    if (options.width) params.append('width', options.width.toString())
    if (options.height) params.append('height', options.height.toString())
    if (options.quality) params.append('quality', options.quality.toString())
    
    const queryString = params.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }

  /**
   * Resize image on client side before upload (optional optimization)
   */
  static async resizeImage(
    file: File, 
    maxWidth: number = 400, 
    maxHeight: number = 400, 
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
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

      img.src = URL.createObjectURL(file)
    })
  }
}

export default AvatarUploadService 