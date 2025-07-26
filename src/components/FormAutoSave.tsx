'use client'

import { useEffect, useState } from 'react'
import { Check, Save, Loader2 } from 'lucide-react'

interface FormAutoSaveProps {
  enabled: boolean
  className?: string
}

export default function FormAutoSave({ enabled, className = '' }: FormAutoSaveProps) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  useEffect(() => {
    if (!enabled) {
      setStatus('idle')
      return
    }

    // Show saving status briefly
    setStatus('saving')
    
    const timer = setTimeout(() => {
      setStatus('saved')
      
      // Reset to idle after showing saved status
      const resetTimer = setTimeout(() => {
        setStatus('idle')
      }, 2000)
      
      return () => clearTimeout(resetTimer)
    }, 500)

    return () => clearTimeout(timer)
  }, [enabled])

  if (status === 'idle') return null

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      {status === 'saving' && (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
          <span className="text-purple-300">Saving draft...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="w-4 h-4 text-green-400" />
          <span className="text-green-300">Draft saved</span>
        </>
      )}
    </div>
  )
} 