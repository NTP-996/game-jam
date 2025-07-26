import { useEffect, useRef } from 'react'

interface UseFormPersistenceOptions {
  key: string
  data: any
  enabled?: boolean
  debounceMs?: number
}

export function useFormPersistence({ 
  key, 
  data, 
  enabled = true, 
  debounceMs = 1000 
}: UseFormPersistenceOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastSavedRef = useRef<string>('')

  // Save data to localStorage with debouncing
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const dataString = JSON.stringify(data)
    
    // Skip if data hasn't changed
    if (dataString === lastSavedRef.current) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(`form_draft_${key}`, dataString)
        lastSavedRef.current = dataString
        console.log(`Form data saved for ${key}`)
      } catch (error) {
        console.error('Failed to save form data:', error)
      }
    }, debounceMs)

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, key, enabled, debounceMs])

  // Load persisted data from localStorage
  const loadPersistedData = (): any | null => {
    if (typeof window === 'undefined') return null

    try {
      const saved = localStorage.getItem(`form_draft_${key}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        console.log(`Loaded persisted data for ${key}`)
        return parsed
      }
    } catch (error) {
      console.error('Failed to load persisted form data:', error)
    }
    return null
  }

  // Clear persisted data
  const clearPersistedData = () => {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(`form_draft_${key}`)
      lastSavedRef.current = ''
      console.log(`Cleared persisted data for ${key}`)
    } catch (error) {
      console.error('Failed to clear persisted data:', error)
    }
  }

  return {
    loadPersistedData,
    clearPersistedData
  }
}

export default useFormPersistence 