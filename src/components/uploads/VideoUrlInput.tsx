'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Video, AlertCircle, Check, ExternalLink } from 'lucide-react'
import { ProjectUploadService } from '@/lib/projectUpload'

interface VideoUrlInputProps {
  value: string
  onChange: (url: string) => void
  disabled?: boolean
  className?: string
}

export default function VideoUrlInput({
  value,
  onChange,
  disabled = false,
  className = ''
}: VideoUrlInputProps) {
  const [validationState, setValidationState] = useState<{
    valid: boolean
    error?: string
    videoId?: string
  }>({ valid: false })
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!value.trim()) {
      setValidationState({ valid: false })
      setThumbnailUrl(null)
      return
    }

    const validation = ProjectUploadService.validateYouTubeUrl(value)
    setValidationState(validation)

    if (validation.valid && validation.videoId) {
      const thumbnail = ProjectUploadService.getYouTubeThumbnail(value)
      setThumbnailUrl(thumbnail)
    } else {
      setThumbnailUrl(null)
    }
  }, [value])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Video URL Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-purple-300">
          Demo Video URL *
        </label>
        <div className="relative">
          <input
            type="url"
            className={`
              w-full bg-purple-900/50 border rounded-lg px-4 py-3 text-white placeholder-purple-400 pr-10
              ${validationState.valid 
                ? 'border-green-500/50 focus:border-green-500' 
                : value.trim() && validationState.error
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-purple-500/50 focus:border-purple-500'
              }
              focus:outline-none focus:ring-2 focus:ring-purple-500/50
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {value.trim() && !validationState.error ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : value.trim() && validationState.error ? (
              <AlertCircle className="w-5 h-5 text-red-400" />
            ) : (
              <Video className="w-5 h-5 text-purple-400" />
            )}
          </div>
        </div>
        <p className="text-purple-400 text-xs">
          2-5 minute video showcasing your game (YouTube, Vimeo, or other video platform)
        </p>
      </div>

      {/* Video Preview */}
      {validationState.valid && thumbnailUrl && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <Image
                src={thumbnailUrl}
                alt="Video thumbnail"
                width={160}
                height={90}
                className="rounded-lg object-cover"
                onError={() => setThumbnailUrl(null)}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                  <Video className="w-4 h-4 text-black ml-0.5" />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-medium text-sm">Valid video URL</span>
              </div>
              <p className="text-green-200 text-sm mb-3">
                Video preview loaded successfully
              </p>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                <span>Watch video</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Validation Error */}
      {value.trim() && validationState.error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-red-400 text-sm">{validationState.error}</p>
          </div>
        </div>
      )}

      {/* Video Guidelines */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h4 className="text-blue-400 font-medium text-sm mb-2">Video Guidelines:</h4>
        <div className="text-blue-200 text-xs space-y-1">
          <p>• Duration: 2-5 minutes optimal</p>
          <p>• Show actual gameplay, not just menus</p>
          <p>• Demonstrate your Solana blockchain integration</p>
          <p>• Include audio narration or text explanations</p>
          <p>• Show key features and game mechanics</p>
          <p>• Ensure video is publicly accessible</p>
        </div>
      </div>

      {/* Supported Platforms */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
        <h4 className="text-purple-400 font-medium text-sm mb-2">Supported Platforms:</h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-red-600/20 text-red-300 px-2 py-1 rounded">YouTube</span>
          <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded">Vimeo</span>
          <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded">Twitch</span>
          <span className="bg-green-600/20 text-green-300 px-2 py-1 rounded">Loom</span>
        </div>
      </div>
    </div>
  )
} 