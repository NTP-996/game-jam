'use client'

import { useState } from 'react'
import { ApiClient } from '@/lib/apiClient'

export default function FixMembershipButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const fixMembership = async () => {
    try {
      setLoading(true)
      setMessage('')
      
      const response = await ApiClient.post('/api/teams/fix-membership', {})
      const data = await response.json()
      
      if (response.ok) {
        setMessage(data.message)
        // Refresh the page after 2 seconds to show updated data
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Fix membership error:', error)
      setMessage('Failed to fix membership')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="text-yellow-400">⚠️</div>
        <div className="flex-1">
          <h3 className="text-yellow-300 font-medium">Team Membership Issue Detected</h3>
          <p className="text-yellow-200/80 text-sm">
            You're the team leader but not showing as a member. Click to fix this.
          </p>
        </div>
        <button
          onClick={fixMembership}
          disabled={loading}
          className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? 'Fixing...' : 'Fix Membership'}
        </button>
      </div>
      
      {message && (
        <div className="mt-3 p-3 bg-gray-800/50 rounded text-sm">
          <div className={message.includes('Error') ? 'text-red-300' : 'text-green-300'}>
            {message}
          </div>
        </div>
      )}
    </div>
  )
} 