'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ApiClient from '@/lib/apiClient'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, User, Settings, LogOut, UserPlus } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  username: string
  avatar_url: string
  bio: string
  job_title: string
  location: string
  looking_for_team: boolean
}

interface NavItem {
  name: string
  href: string
  icon: string
  badge?: number
}

const navigation: NavItem[] = [
  { name: 'Home', href: '/dashboard', icon: '🏠' },
  // { name: 'Catalogue', href: '/dashboard/catalogue', icon: '🎮' },
  // { name: 'Team', href: '/dashboard/team', icon: '👥' },
  { name: 'Resources', href: '/dashboard/resources', icon: '📚' },
  { name: 'Partners', href: '/dashboard/partners', icon: '🤝' },
  { name: 'Sponsors', href: '/dashboard/sponsors', icon: '⭐' },
]

const adminNavigation: NavItem[] = [
  { name: 'Admin Panel', href: '/dashboard/admin', icon: '⚙️' },
  { name: 'Applications', href: '/dashboard/admin/applications', icon: '📋', badge: 23 },
  { name: 'Teams', href: '/dashboard/admin/teams', icon: '🏢' },
  { name: 'Projects', href: '/dashboard/admin/projects', icon: '💼' },
  { name: 'Judges', href: '/dashboard/admin/judges', icon: '⚖️' },
]

export default function DashboardNav() {
  const pathname = usePathname()
  const { user, signOut, loading } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const isAdmin = false // This would come from user context/auth

  // Load user profile data
  useEffect(() => {
    if (user && !profile) {
      loadProfile()
    }
  }, [user, profile])

  const loadProfile = async () => {
    if (!user) return
    
    setProfileLoading(true)
    try {
      const response = await ApiClient.get('/api/profile')
      const data = await response.json()

      if (response.ok && data.profile) {
        setProfile(data.profile)
      }
    } catch (error) {
      console.error('Error loading profile for sidebar:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className={`hidden lg:block fixed inset-y-0 left-0 z-30 ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
      <div className="flex h-full flex-col bg-purple-900/80 backdrop-blur-sm border-r border-purple-500/30">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-purple-500/30">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded font-pixelify flex items-center justify-center text-purple-900 font-bold">
                S
              </div>
              <span className="text-white font-bold font-pixelify">Game Jam</span>
            </Link>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-800/50 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* Main Navigation */}
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-purple-700/50 text-white border border-purple-500/50' 
                      : 'text-purple-200 hover:text-white hover:bg-purple-800/50'
                    }
                  `}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="bg-yellow-500 text-purple-900 text-xs font-bold px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Admin Navigation */}
          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-purple-500/30">
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                  Administration
                </h3>
              )}
              <div className="space-y-1">
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                        ${isActive 
                          ? 'bg-purple-700/50 text-white border border-purple-500/50' 
                          : 'text-purple-200 hover:text-white hover:bg-purple-800/50'
                        }
                      `}
                    >
                      <span className="mr-3 text-lg">{item.icon}</span>
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.name}</span>
                          {item.badge && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-purple-500/30">
          {loading ? (
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="w-8 h-8 bg-purple-600/50 rounded-full animate-pulse"></div>
              {!isCollapsed && (
                <div className="flex-1">
                  <div className="h-4 bg-purple-600/50 rounded w-20 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-purple-600/50 rounded w-16 animate-pulse"></div>
                </div>
              )}
            </div>
          ) : user ? (
            // Authenticated User
            <div>
              <div className="flex items-center space-x-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-purple-600 border-2 border-purple-400 overflow-hidden flex-shrink-0">
                  <Image
                    src={profile?.avatar_url || '/next.svg'}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    {profileLoading ? (
                      <div className="space-y-1">
                        <div className="h-4 bg-purple-600/50 rounded w-20 animate-pulse"></div>
                        <div className="h-3 bg-purple-600/30 rounded w-16 animate-pulse"></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-white truncate">
                          {profile?.full_name || user.user_metadata?.full_name || 'Game Developer'}
                        </p>
                        <div className="flex items-center space-x-1">
                          <p className="text-xs text-purple-300 truncate">
                            {profile?.job_title || 'Developer'}
                            {profile?.location && <span> • {profile.location}</span>}
                          </p>
                          {profile?.looking_for_team && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 ml-1">
                              🔍
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {!isCollapsed && (
                <div className="mt-2 space-y-1">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center px-3 py-2 text-sm text-purple-300 hover:text-white hover:bg-purple-800/50 rounded-lg transition-colors"
                  >
                    <Settings size={16} className="mr-3" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <LogOut size={16} className="mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Unauthenticated User
            <div className="space-y-2">
              {!isCollapsed && (
                <div className="px-3 py-2">
                  <p className="text-sm text-purple-300 mb-3">
                    Join the hackathon!
                  </p>
                </div>
              )}
              
              <Link
                href="/auth/signin"
                className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <User size={16} className={!isCollapsed ? "mr-2" : ""} />
                {!isCollapsed && "Sign In"}
              </Link>
              
              <Link
                href="/auth/signup"
                className="flex items-center justify-center px-3 py-2 text-sm font-medium text-purple-300 border border-purple-500/50 hover:text-white hover:bg-purple-800/50 rounded-lg transition-colors"
              >
                <UserPlus size={16} className={!isCollapsed ? "mr-2" : ""} />
                {!isCollapsed && "Sign Up"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 