import ApiClient from './apiClient'

export type ImageType = 'banner' | 'logo' | 'screenshot'

export interface ImageUploadResult {
  success: boolean
  imageUrl?: string
  fileName?: string
  error?: string
}

export interface ImageUploadOptions {
  onProgress?: (progress: number) => void
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

export class ProjectImageUploadService {
  private static readonly MAX_SIZES = {
    banner: 10 * 1024 * 1024, // 10MB
    logo: 5 * 1024 * 1024,    // 5MB
    screenshot: 10 * 1024 * 1024 // 10MB
  }

  private static readonly ALLOWED_TYPES = {
    banner: ['image/jpeg', 'image/png', 'image/webp'],
    logo: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    screenshot: ['image/jpeg', 'image/png', 'image/webp']
  }

  /**
   * Validate image file before upload
   */
  static validateImage(file: File, imageType: ImageType): { valid: boolean; error?: string } {
    // Check file size
    const maxSize = this.MAX_SIZES[imageType]
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
        error: `File must be one of: ${allowedTypes.join(', ')}`
      }
    }

    return { valid: true }
  }

  /**
   * Upload image to Supabase storage
   */
  static async uploadImage(
    file: File, 
    imageType: ImageType, 
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResult> {
    try {
      // Validate file first
      const validation = this.validateImage(file, imageType)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Optionally resize image before upload
      let fileToUpload = file
      if (options.maxWidth || options.maxHeight) {
        try {
          fileToUpload = await this.resizeImage(file, {
            maxWidth: options.maxWidth,
            maxHeight: options.maxHeight,
            quality: options.quality || 0.8
          })
        } catch (resizeError) {
          console.warn('Image resize failed, uploading original:', resizeError)
          // Continue with original file if resize fails
        }
      }

      // Create form data
      const formData = new FormData()
      formData.append('file', fileToUpload)
      formData.append('type', imageType)

      // Upload via API with progress tracking
      let response: Response
      
      if (options.onProgress) {
        // Use XMLHttpRequest for progress tracking
        response = await this.uploadWithProgress(formData, options.onProgress)
      } else {
        // Use standard fetch
        response = await ApiClient.postFormData('/api/projects/images/upload', formData)
      }

      const data = await response.json()

      if (response.ok && data.success) {
        return {
          success: true,
          imageUrl: data.imageUrl,
          fileName: data.fileName
        }
      } else {
        return {
          success: false,
          error: data.error || 'Upload failed'
        }
      }

    } catch (error) {
      console.error('Image upload error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during upload'
      }
    }
  }

  /**
   * Upload with progress tracking using XMLHttpRequest
   */
  private static async uploadWithProgress(
    formData: FormData, 
    onProgress: (progress: number) => void
  ): Promise<Response> {
    return new Promise(async (resolve, reject) => {
      try {
        // Get auth headers
        const { data: { session } } = await import('./supabase').then(m => m.supabase.auth.getSession())
        
        if (!session?.access_token) {
          throw new Error('Not authenticated')
        }

        const xhr = new XMLHttpRequest()

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100
            onProgress(progress)
          }
        })

        // Handle completion
        xhr.addEventListener('load', () => {
          const response = new Response(xhr.response, {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: new Headers(xhr.getAllResponseHeaders().split('\r\n').reduce((headers: Record<string, string>, line) => {
              const [key, value] = line.split(': ')
              if (key && value) headers[key] = value
              return headers
            }, {}))
          })
          resolve(response)
        })

        // Handle errors
        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'))
        })

        // Setup request
        xhr.open('POST', '/api/projects/images/upload')
        xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`)
        
        // Send data
        xhr.send(formData)

      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Delete image from storage
   */
  static async deleteImage(imageUrl: string, imageType: ImageType): Promise<{ success: boolean; error?: string }> {
    try {
      const params = new URLSearchParams({
        url: imageUrl,
        type: imageType
      })

      const response = await ApiClient.delete(`/api/projects/images/upload?${params.toString()}`)
      const data = await response.json()

      if (response.ok && data.success) {
        return { success: true }
      } else {
        return {
          success: false,
          error: data.error || 'Delete failed'
        }
      }

    } catch (error) {
      console.error('Image deletion error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during deletion'
      }
    }
  }

  /**
   * Resize image on client side before upload
   */
  static async resizeImage(
    file: File, 
    options: {
      maxWidth?: number
      maxHeight?: number
      quality?: number
    }
  ): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        const maxWidth = options.maxWidth || width
        const maxHeight = options.maxHeight || height
        
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
          options.quality || 0.8
        )
      }

      img.onerror = () => {
        resolve(file) // Fallback to original if image load fails
      }

      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Get recommended dimensions for different image types
   */
  static getRecommendedDimensions(imageType: ImageType): { width: number; height: number; description: string } {
    switch (imageType) {
      case 'banner':
        return {
          width: 1920,
          height: 1080,
          description: 'Wide banner image (16:9 ratio) for project showcase'
        }
      case 'logo':
        return {
          width: 512,
          height: 512,
          description: 'Square logo image for project branding'
        }
      case 'screenshot':
        return {
          width: 1920,
          height: 1080,
          description: 'High-quality screenshot showing gameplay'
        }
    }
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
   * Check if file is an image
   */
  static isImageFile(file: File): boolean {
    return file.type.startsWith('image/')
  }

  /**
   * Create image preview URL
   */
  static createPreviewUrl(file: File): string {
    return URL.createObjectURL(file)
  }

  /**
   * Cleanup preview URL
   */
  static cleanupPreviewUrl(url: string): void {
    URL.revokeObjectURL(url)
  }
} 