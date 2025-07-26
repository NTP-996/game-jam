'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Image from 'next/image'
import { User, Settings, LogOut, Mail } from 'lucide-react'

export default function ProfileButton() {
  const { user, signOut, loading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (loading) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="w-12 h-12 bg-purple-600/50 rounded-full animate-pulse"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/auth/signin"
          className="w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110"
        >
          <User size={20} />
        </Link>
      </div>
    )
  }

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 bg-purple-800/90 backdrop-blur-sm border border-purple-500/30 rounded-lg shadow-xl">
          {/* User Info */}
          <div className="p-4 border-b border-purple-500/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 border-2 border-purple-400 overflow-hidden">
                <Image
                  src={user.user_metadata?.avatar_url || '/next.svg'}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">
                  {user.user_metadata?.full_name || 'Game Developer'}
                </p>
                <p className="text-purple-300 text-sm truncate flex items-center">
                  <Mail size={12} className="mr-1" />
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/dashboard/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-purple-700/50 transition-colors"
            >
              <Settings size={16} />
              <span>Profile Settings</span>
            </Link>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full overflow-hidden shadow-lg transition-all duration-300 hover:scale-110 border-2 border-purple-400"
      >
        <Image
          src={user.user_metadata?.avatar_url || '/next.svg'}
          alt="Profile"
          width={48}
          height={48}
          className="w-full h-full object-cover"
        />
      </button>

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
} 