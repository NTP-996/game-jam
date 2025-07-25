'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import AvatarUploadService from '@/lib/avatarUpload'
import ApiClient from '@/lib/apiClient'
import Image from 'next/image'
import DashboardNav from '@/components/dashboard/DashboardNav'
import MobileBottomNav from '@/components/dashboard/MobileBottomNav'
import ProfileButton from '@/components/ProfileButton'
import FloatingElements from '@/components/FloatingElements/FloatingElements'
import { 
  User, Mail, Edit3, Save, X, Github, Globe, Upload, Loader2
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  username: string
  avatar_url: string
  
  // Social Links
  github_url: string
  twitter_url: string
  discord_username: string
  website_url: string
  
  created_at: string
}

export default function ProfilePage() {
  const { user, signOut, loading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileExists, setProfileExists] = useState<boolean | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    github_url: '',
    twitter_url: '',
    discord_username: '',
    website_url: '',
  })

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    
    setProfileLoading(true)
    try {
      const response = await ApiClient.get('/api/profile')
      const data = await response.json()

      if (response.ok && data.profile) {
        setProfile(data.profile)
        setProfileExists(true)
        setFormData({
          full_name: data.profile.full_name || '',
          username: data.profile.username || '',
          github_url: data.profile.github_url || '',
          twitter_url: data.profile.twitter_url || '',
          discord_username: data.profile.discord_username || '',
          website_url: data.profile.website_url || '',
        })
      } else if (response.status === 404) {
        setProfileExists(false)
        setFormData({
          full_name: user.user_metadata?.full_name || '',
          username: '',
          github_url: '',
          twitter_url: '',
          discord_username: '',
          website_url: '',
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setError('Failed to load profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!user) return
    
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    
    try {
      const response = profileExists ? 
        await ApiClient.put('/api/profile', formData) :
        await ApiClient.post('/api/profile', formData)

      const data = await response.json()

      if (response.ok) {
        setProfile(data.profile)
        setProfileExists(true)
        setIsEditing(false)
        setSuccess('Profile updated successfully!')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setError('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setUploadingAvatar(true)
    setError(null)

    try {
      const result = await AvatarUploadService.uploadAvatar(file, user.id)
      
      if (result.success && result.avatarUrl) {
        // Update profile with new avatar URL
        const response = await ApiClient.put('/api/profile/avatar', { avatar_url: result.avatarUrl })

        if (response.ok) {
          setProfile(prev => prev ? { ...prev, avatar_url: result.avatarUrl! } : null)
          setSuccess('Avatar updated successfully!')
          setTimeout(() => setSuccess(null), 3000)
        } else {
          setError('Failed to update avatar')
        }
      } else {
        setError(result.error || 'Failed to upload avatar')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setError('Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900/20 via-transparent to-blue-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-200">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900/20 via-transparent to-blue-900/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please Sign In</h1>
          <p className="text-purple-300">You need to be signed in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingElements />
      
      <div className="relative z-10 flex">
        <DashboardNav />
        
        <main className="flex-1 lg:ml-64 bg-gradient-to-b from-purple-900/20 via-transparent to-blue-900/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white pixelify-sans mb-2">Profile Settings</h1>
              <p className="text-purple-200">Manage your basic profile information and social links</p>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-6 bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {/* Profile Card */}
            <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden">
              
              {/* Header with Edit Button */}
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 border-b border-gray-700/50 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white pixelify-sans flex items-center gap-3">
                  <User className="w-8 h-8" />
                  Profile Information
                </h2>
                
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        // Reset form data
                        if (profile) {
                          setFormData({
                            full_name: profile.full_name || '',
                            username: profile.username || '',
                            github_url: profile.github_url || '',
                            twitter_url: profile.twitter_url || '',
                            discord_username: profile.discord_username || '',
                            website_url: profile.website_url || '',
                          })
                        }
                      }}
                      className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-6">
                
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500/30">
                      {profile?.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt="Profile"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                          {(profile?.full_name || user.user_metadata?.full_name || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Profile Picture</h3>
                    <label className="cursor-pointer inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <Upload className="w-4 h-4" />
                      Upload New Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploadingAvatar}
                      />
                    </label>
                    <p className="text-gray-400 text-sm mt-1">Recommended: Square image, at least 200x200px</p>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email
                    </label>
                    <div className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-400">
                      {user.email}
                    </div>
                    <p className="text-gray-500 text-xs mt-1">Email cannot be changed here</p>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg px-4 py-3 text-white">
                        {profile?.full_name || 'Not set'}
                      </div>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Username
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Choose a username"
                      />
                    ) : (
                      <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg px-4 py-3 text-white">
                        {profile?.username || 'Not set'}
                      </div>
                    )}
                  </div>

                </div>

                {/* Social Links */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Social Links
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* GitHub */}
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">
                        <Github className="w-4 h-4 inline mr-2" />
                        GitHub URL
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={formData.github_url}
                          onChange={(e) => handleInputChange('github_url', e.target.value)}
                          className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="https://github.com/username"
                        />
                      ) : (
                        <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg px-4 py-3 text-white">
                          {profile?.github_url ? (
                            <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                              {profile.github_url}
                            </a>
                          ) : (
                            'Not set'
                          )}
                        </div>
                      )}
                    </div>

                    {/* Twitter/X */}
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">
                        𝕏 Twitter/X URL
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={formData.twitter_url}
                          onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                          className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="https://twitter.com/username"
                        />
                      ) : (
                        <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg px-4 py-3 text-white">
                          {profile?.twitter_url ? (
                            <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                              {profile.twitter_url}
                            </a>
                          ) : (
                            'Not set'
                          )}
                        </div>
                      )}
                    </div>

                    {/* Discord */}
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">
                        Discord Username
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.discord_username}
                          onChange={(e) => handleInputChange('discord_username', e.target.value)}
                          className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="username#1234"
                        />
                      ) : (
                        <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg px-4 py-3 text-white">
                          {profile?.discord_username || 'Not set'}
                        </div>
                      )}
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">
                        <Globe className="w-4 h-4 inline mr-2" />
                        Website URL
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={formData.website_url}
                          onChange={(e) => handleInputChange('website_url', e.target.value)}
                          className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="https://yourwebsite.com"
                        />
                      ) : (
                        <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg px-4 py-3 text-white">
                          {profile?.website_url ? (
                            <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                              {profile.website_url}
                            </a>
                          ) : (
                            'Not set'
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>
      
      <ProfileButton />
      <MobileBottomNav />
    </div>
  )
} 