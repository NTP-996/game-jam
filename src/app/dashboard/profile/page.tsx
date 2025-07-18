'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import AvatarUploadService from '@/lib/avatarUpload'
import ApiClient from '@/lib/apiClient'
import Image from 'next/image'
import Link from 'next/link'
import { 
  User, Mail, Settings, LogOut, Edit3, Save, X, Github, MessageCircle, 
  Calendar, MapPin, Briefcase, GraduationCap, Trophy, Code, Gamepad2,
  Globe, Phone, Instagram, Upload, Plus, Trash2, Loader2
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  username: string
  avatar_url: string
  bio: string
  
  // Contact & Social
  github_url: string
  twitter_url: string
  discord_username: string
  telegram_username: string
  website_url: string
  
  // Personal Details
  location: string
  timezone: string
  birth_date: string
  phone: string
  
  // Professional Info
  job_title: string
  company: string
  experience_level: string
  education: string
  
  // Hackathon Specific
  skills: string[]
  interests: string[]
  programming_languages: string[]
  frameworks: string[]
  previous_hackathons: number
  preferred_role: string
  availability: string
  looking_for_team: boolean
  
  // Gaming
  favorite_games: string[]
  game_dev_experience: string
  
  created_at: string
}

const EXPERIENCE_LEVELS = [
  'Beginner (0-1 years)',
  'Intermediate (2-4 years)', 
  'Advanced (5-7 years)',
  'Expert (8+ years)'
]

const PREFERRED_ROLES = [
  'Full-Stack Developer',
  'Frontend Developer', 
  'Backend Developer',
  'Game Developer',
  'UI/UX Designer',
  'Product Manager',
  'Blockchain Developer',
  'Data Scientist',
  'DevOps Engineer',
  'Mobile Developer'
]

const AVAILABILITY_OPTIONS = [
  'Full-time (40+ hours/week)',
  'Part-time (20-40 hours/week)', 
  'Weekends only',
  'Limited (< 20 hours/week)'
]

const POPULAR_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'Rust', 'Solana',
  'Web3', 'Smart Contracts', 'Unity', 'Unreal Engine', 'Blender', 'Figma', 'Photoshop',
  'Game Design', 'UI/UX', 'Backend Development', 'Frontend Development', 'DevOps'
]

export default function ProfilePage() {
  const { user, signOut, loading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [newInterest, setNewInterest] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editForm, setEditForm] = useState({
    full_name: '',
    username: '',
    bio: '',
    
    // Contact & Social
    github_url: '',
    twitter_url: '',
    discord_username: '',
    telegram_username: '',
    website_url: '',
    
    // Personal Details
    location: '',
    timezone: '',
    birth_date: '',
    phone: '',
    
    // Professional Info
    job_title: '',
    company: '',
    experience_level: '',
    education: '',
    
    // Hackathon Specific
    skills: [] as string[],
    interests: [] as string[],
    programming_languages: [] as string[],
    frameworks: [] as string[],
    previous_hackathons: 0,
    preferred_role: '',
    availability: '',
    looking_for_team: false,
    
    // Gaming
    favorite_games: [] as string[],
    game_dev_experience: '',
  })

  // Load user profile
  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      const response = await ApiClient.get('/api/profile')
      const data = await response.json()

      if (response.ok && data.profile) {
        setProfile(data.profile)
        setEditForm({
          full_name: data.profile.full_name || '',
          username: data.profile.username || '',
          bio: data.profile.bio || '',
          github_url: data.profile.github_url || '',
          twitter_url: data.profile.twitter_url || '',
          discord_username: data.profile.discord_username || '',
          telegram_username: data.profile.telegram_username || '',
          website_url: data.profile.website_url || '',
          location: data.profile.location || '',
          timezone: data.profile.timezone || 'UTC+8',
          birth_date: data.profile.birth_date || '',
          phone: data.profile.phone || '',
          job_title: data.profile.job_title || '',
          company: data.profile.company || '',
          experience_level: data.profile.experience_level || '',
          education: data.profile.education || '',
          skills: data.profile.skills || [],
          interests: data.profile.interests || [],
          programming_languages: data.profile.programming_languages || [],
          frameworks: data.profile.frameworks || [],
          previous_hackathons: data.profile.previous_hackathons || 0,
          preferred_role: data.profile.preferred_role || '',
          availability: data.profile.availability || '',
          looking_for_team: data.profile.looking_for_team || false,
          favorite_games: data.profile.favorite_games || [],
          game_dev_experience: data.profile.game_dev_experience || '',
        })
      } else {
        console.error('Failed to load profile:', data.error)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    
    try {
      const response = await ApiClient.put('/api/profile', editForm)
      const data = await response.json()

      if (response.ok && data.profile) {
        setProfile(data.profile)
        setIsEditing(false)
        alert('Profile updated successfully!')
      } else {
        console.error('Failed to update profile:', data.error)
        alert(`Failed to update profile: ${data.error}`)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('An error occurred while updating your profile')
    } finally {
      setIsSaving(false)
    }
  }

  const addSkill = (skill: string) => {
    if (skill && !(editForm.skills || []).includes(skill)) {
      setEditForm({...editForm, skills: [...(editForm.skills || []), skill]})
    }
    setNewSkill('')
  }

  const removeSkill = (skillToRemove: string) => {
    setEditForm({
      ...editForm, 
      skills: (editForm.skills || []).filter(skill => skill !== skillToRemove)
    })
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setIsUploadingAvatar(true)

    try {
      // Optional: Resize image before upload for better performance
      const resizedFile = await AvatarUploadService.resizeImage(file, 400, 400, 0.8)
      
      // Upload avatar
      const result = await AvatarUploadService.uploadAvatar(resizedFile, user.id)
      
      if (result.success && result.avatarUrl) {
        // Update local profile state
        if (profile) {
          setProfile({
            ...profile,
            avatar_url: result.avatarUrl
          })
        }
        
        // Update edit form if in editing mode
        if (isEditing) {
          setEditForm(prev => ({
            ...prev,
            // Note: avatar_url is not in editForm, it's handled separately
          }))
        }
        
        alert('Avatar updated successfully!')
      } else {
        alert(`Failed to upload avatar: ${result.error}`)
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      alert('An error occurred while uploading your avatar')
    } finally {
      setIsUploadingAvatar(false)
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const triggerAvatarUpload = () => {
    fileInputRef.current?.click()
  }

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="ml-0 lg:ml-64 p-6 transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-purple-600/50 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-purple-600/50 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="ml-0 lg:ml-64 p-6 transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-white font-pixelify mb-4">
              Please Sign In
            </h1>
            <p className="text-purple-200 mb-6">
              You need to be signed in to view your profile.
            </p>
            <Link
              href="/auth/signin"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
            >
              <User size={20} />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ml-0 lg:ml-64 p-6 transition-all duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white font-pixelify mb-2">
              Profile Settings
            </h1>
            <p className="text-purple-200">
              Manage your account and showcase your skills to potential teammates
            </p>
          </div>
          
          <div className="flex space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
              >
                <Edit3 size={16} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {profile && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile Card - Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Basic Profile */}
              <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 rounded-full bg-purple-600 border-4 border-purple-400 overflow-hidden mx-auto">
                    <Image
                      src={profile.avatar_url || '/assets/mentors/Belac.svg'}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isEditing && (
                    <>
                      <button 
                        onClick={triggerAvatarUpload}
                        disabled={isUploadingAvatar}
                        className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 p-2 rounded-full text-white transition-colors"
                        title="Upload new avatar"
                      >
                        {isUploadingAvatar ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Upload size={16} />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </>
                  )}
                </div>
                
                {!isEditing ? (
                  <>
                    <h2 className="text-xl font-bold text-white font-pixelify mb-1">
                      {profile.full_name}
                    </h2>
                    <p className="text-purple-300 mb-2">@{profile.username}</p>
                    <p className="text-sm text-purple-400 mb-4">{profile.job_title}</p>
                    <p className="text-purple-200 text-sm mb-4">{profile.bio}</p>
                  </>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                      className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 text-white text-center font-bold"
                      placeholder="Full Name"
                    />
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                      className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 text-purple-300 text-center"
                      placeholder="Username"
                    />
                    <input
                      type="text"
                      value={editForm.job_title}
                      onChange={(e) => setEditForm({...editForm, job_title: e.target.value})}
                      className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 text-purple-400 text-center text-sm"
                      placeholder="Job Title"
                    />
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 text-purple-200 text-sm resize-none"
                      rows={3}
                      placeholder="Bio"
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-purple-500/30">
                  <p className="text-purple-400 text-xs">
                    Member since {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Team Status */}
              <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white font-pixelify mb-4 flex items-center space-x-2">
                  <Gamepad2 size={20} />
                  <span>Team Status</span>
                </h3>
                
                {!isEditing ? (
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg ${profile.looking_for_team ? 'bg-green-500/20 border border-green-500/30' : 'bg-gray-500/20 border border-gray-500/30'}`}>
                      <p className={`font-semibold ${profile.looking_for_team ? 'text-green-400' : 'text-gray-400'}`}>
                        {profile.looking_for_team ? '🔍 Looking for Team' : '✅ Not Looking'}
                      </p>
                    </div>
                    <div className="text-sm text-purple-300">
                      <p><strong>Preferred Role:</strong> {profile.preferred_role}</p>
                      <p><strong>Availability:</strong> {profile.availability}</p>
                      <p><strong>Hackathons:</strong> {profile.previous_hackathons} previous</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editForm.looking_for_team}
                        onChange={(e) => setEditForm({...editForm, looking_for_team: e.target.checked})}
                        className="rounded border-purple-500"
                      />
                      <span className="text-white text-sm">Looking for team</span>
                    </label>
                    
                    <select
                      value={editForm.preferred_role}
                      onChange={(e) => setEditForm({...editForm, preferred_role: e.target.value})}
                      className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="">Select Role</option>
                      {PREFERRED_ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    
                    <select
                      value={editForm.availability}
                      onChange={(e) => setEditForm({...editForm, availability: e.target.value})}
                      className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="">Select Availability</option>
                      {AVAILABILITY_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    
                    <input
                      type="number"
                      value={editForm.previous_hackathons}
                      onChange={(e) => setEditForm({...editForm, previous_hackathons: parseInt(e.target.value) || 0})}
                      className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 text-white text-sm"
                      placeholder="Previous hackathons"
                      min="0"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Main Content - Right Columns */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Contact Information */}
              <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white font-pixelify mb-4 flex items-center space-x-2">
                  <Mail size={20} />
                  <span>Contact Information</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Email Address
                      <span className="text-xs text-purple-400 ml-2">(Private - not shown publicly)</span>
                    </label>
                    {isEditing ? (
                      <div className="flex items-center space-x-2 text-white bg-purple-900/30 border border-purple-500/30 rounded-lg px-3 py-2">
                        <Mail size={16} className="text-purple-400" />
                        <span className="text-purple-300">{profile.email}</span>
                        <span className="text-xs text-purple-400">(Read-only)</span>
                      </div>
                    ) : (
                      <div className="text-purple-400 text-sm italic">
                        Email hidden for privacy
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Phone
                      <span className="text-xs text-purple-400 ml-2">(Private - not shown publicly)</span>
                    </label>
                    {!isEditing ? (
                      <div className="text-purple-400 text-sm italic">
                        Phone hidden for privacy
                      </div>
                    ) : (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 text-white"
                        placeholder="+65 9123 4567"
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Location
                    </label>
                    {!isEditing ? (
                      <div className="flex items-center space-x-2 text-white">
                        <MapPin size={16} className="text-purple-400" />
                        <span>{profile.location || 'Not provided'}</span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 text-white"
                        placeholder="Singapore"
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Timezone
                    </label>
                    {!isEditing ? (
                      <div className="flex items-center space-x-2 text-white">
                        <Calendar size={16} className="text-purple-400" />
                        <span>{profile.timezone}</span>
                      </div>
                    ) : (
                      <select
                        value={editForm.timezone}
                        onChange={(e) => setEditForm({...editForm, timezone: e.target.value})}
                        className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="UTC+8">UTC+8 (Singapore)</option>
                        <option value="UTC+9">UTC+9 (Tokyo)</option>
                        <option value="UTC+7">UTC+7 (Bangkok)</option>
                        <option value="UTC+5:30">UTC+5:30 (Mumbai)</option>
                        <option value="UTC+11">UTC+11 (Sydney)</option>
                        <option value="UTC-8">UTC-8 (San Francisco)</option>
                        <option value="UTC-5">UTC-5 (New York)</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white font-pixelify mb-4 flex items-center space-x-2">
                  <Globe size={20} />
                  <span>Social Links</span>
                </h3>
                
                {!isEditing ? (
                  <div className="flex flex-wrap gap-3">
                    {/* GitHub Button */}
                    {profile.github_url && (
                      <a 
                        href={profile.github_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors border border-gray-600"
                      >
                        <Github size={18} />
                        <span className="font-medium">GitHub</span>
                      </a>
                    )}
                    
                    {/* Twitter/X Button */}
                    {profile.twitter_url && (
                      <a 
                        href={profile.twitter_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <MessageCircle size={18} />
                        <span className="font-medium">Twitter</span>
                      </a>
                    )}
                    
                    {/* Discord Button */}
                    {profile.discord_username && (
                      <div className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg">
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                        <span className="font-medium">{profile.discord_username}</span>
                      </div>
                    )}
                    
                    {/* Telegram Button */}
                    {profile.telegram_username && (
                      <a 
                        href={`https://t.me/${profile.telegram_username.replace('@', '')}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472c-.18 1.898-.962 6.502-1.36 8.627c-.168.9-.499 1.201-.82 1.23c-.696.065-1.225-.46-1.9-.902c-1.056-.693-1.653-1.124-2.678-1.8c-1.185-.78-.417-1.21.258-1.91c.177-.184 3.247-2.977 3.307-3.23c.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345c-.48.33-.913.49-1.302.48c-.428-.008-1.252-.241-1.865-.44c-.752-.245-1.349-.374-1.297-.789c.027-.216.325-.437.893-.663c3.498-1.524 5.83-2.529 6.998-3.014c3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                        <span className="font-medium">Telegram</span>
                      </a>
                    )}
                    
                    {/* Website Button */}
                    {profile.website_url && (
                      <a 
                        href={profile.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Globe size={18} />
                        <span className="font-medium">Website</span>
                      </a>
                    )}
                    
                    {/* Empty state */}
                    {!profile.github_url && !profile.twitter_url && !profile.discord_username && !profile.telegram_username && !profile.website_url && (
                      <div className="text-purple-300 text-sm italic">
                        No social links added yet. Click edit to add your social profiles.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* GitHub */}
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2 flex items-center space-x-2">
                        <Github size={16} />
                        <span>GitHub</span>
                      </label>
                      <input
                        type="url"
                        value={editForm.github_url}
                        onChange={(e) => setEditForm({...editForm, github_url: e.target.value})}
                        className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 text-white"
                        placeholder="https://github.com/username"
                      />
                    </div>
                    
                    {/* Twitter/X */}
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2 flex items-center space-x-2">
                        <MessageCircle size={16} />
                        <span>Twitter/X</span>
                      </label>
                      <input
                        type="url"
                        value={editForm.twitter_url}
                        onChange={(e) => setEditForm({...editForm, twitter_url: e.target.value})}
                        className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 text-white"
                        placeholder="https://x.com/username"
                      />
                    </div>
                    
                    {/* Discord */}
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2 flex items-center space-x-2">
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                        <span>Discord</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.discord_username}
                        onChange={(e) => setEditForm({...editForm, discord_username: e.target.value})}
                        className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 text-white"
                        placeholder="username#1234"
                      />
                    </div>
                    
                    {/* Telegram */}
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2 flex items-center space-x-2">
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472c-.18 1.898-.962 6.502-1.36 8.627c-.168.9-.499 1.201-.82 1.23c-.696.065-1.225-.46-1.9-.902c-1.056-.693-1.653-1.124-2.678-1.8c-1.185-.78-.417-1.21.258-1.91c.177-.184 3.247-2.977 3.307-3.23c.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345c-.48.33-.913.49-1.302.48c-.428-.008-1.252-.241-1.865-.44c-.752-.245-1.349-.374-1.297-.789c.027-.216.325-.437.893-.663c3.498-1.524 5.83-2.529 6.998-3.014c3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                        <span>Telegram</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.telegram_username}
                        onChange={(e) => setEditForm({...editForm, telegram_username: e.target.value})}
                        className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 text-white"
                        placeholder="@username"
                      />
                    </div>
                    
                    {/* Website */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-purple-300 mb-2 flex items-center space-x-2">
                        <Globe size={16} />
                        <span>Website</span>
                      </label>
                      <input
                        type="url"
                        value={editForm.website_url}
                        onChange={(e) => setEditForm({...editForm, website_url: e.target.value})}
                        className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 text-white"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Professional Information */}
              <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white font-pixelify mb-4 flex items-center space-x-2">
                  <Briefcase size={20} />
                  <span>Professional Information</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Company
                    </label>
                    {!isEditing ? (
                      <span className="text-white">{profile.company || 'Not provided'}</span>
                    ) : (
                      <input
                        type="text"
                        value={editForm.company}
                        onChange={(e) => setEditForm({...editForm, company: e.target.value})}
                        className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 text-white"
                        placeholder="Company name"
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Experience Level
                    </label>
                    {!isEditing ? (
                      <span className="text-white">{profile.experience_level}</span>
                    ) : (
                      <select
                        value={editForm.experience_level}
                        onChange={(e) => setEditForm({...editForm, experience_level: e.target.value})}
                        className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="">Select Level</option>
                        {EXPERIENCE_LEVELS.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Education
                    </label>
                    {!isEditing ? (
                      <span className="text-white">{profile.education || 'Not provided'}</span>
                    ) : (
                      <input
                        type="text"
                        value={editForm.education}
                        onChange={(e) => setEditForm({...editForm, education: e.target.value})}
                        className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 text-white"
                        placeholder="e.g., Computer Science, NUS"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Skills & Technologies */}
              <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white font-pixelify mb-4 flex items-center space-x-2">
                  <Code size={20} />
                  <span>Skills & Technologies</span>
                </h3>
                
                {!isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-purple-300 mb-2">Core Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {(profile.skills || []).map((skill, index) => (
                          <span key={index} className="bg-purple-600/50 text-purple-200 px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-purple-300 mb-2">Programming Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {(profile.programming_languages || []).map((lang, index) => (
                          <span key={index} className="bg-blue-600/50 text-blue-200 px-3 py-1 rounded-full text-sm">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-purple-300 mb-2">Frameworks & Tools</h4>
                      <div className="flex flex-wrap gap-2">
                        {(profile.frameworks || []).map((framework, index) => (
                          <span key={index} className="bg-green-600/50 text-green-200 px-3 py-1 rounded-full text-sm">
                            {framework}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-purple-300 mb-2">Core Skills</h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(editForm.skills || []).map((skill, index) => (
                          <span key={index} className="bg-purple-600/50 text-purple-200 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                            <span>{skill}</span>
                            <button
                              onClick={() => removeSkill(skill)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addSkill(newSkill)}
                          className="flex-1 bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 text-white text-sm"
                          placeholder="Add a skill"
                        />
                        <button
                          onClick={() => addSkill(newSkill)}
                          className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg text-white"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {POPULAR_SKILLS.filter(skill => !(editForm.skills || []).includes(skill)).slice(0, 8).map(skill => (
                          <button
                            key={skill}
                            onClick={() => addSkill(skill)}
                            className="bg-purple-700/30 hover:bg-purple-600/50 text-purple-200 px-2 py-1 rounded text-xs transition-colors"
                          >
                            + {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Gaming & Experience */}
              <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white font-pixelify mb-4 flex items-center space-x-2">
                  <Gamepad2 size={20} />
                  <span>Gaming & Game Development</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Game Development Experience
                    </label>
                    {!isEditing ? (
                      <p className="text-white">{profile.game_dev_experience}</p>
                    ) : (
                      <textarea
                        value={editForm.game_dev_experience}
                        onChange={(e) => setEditForm({...editForm, game_dev_experience: e.target.value})}
                        className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 text-white resize-none"
                        rows={3}
                        placeholder="Describe your game development experience..."
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Favorite Games
                    </label>
                    {!isEditing ? (
                      <div className="flex flex-wrap gap-2">
                        {(profile.favorite_games || []).map((game, index) => (
                          <span key={index} className="bg-yellow-600/50 text-yellow-200 px-3 py-1 rounded-full text-sm">
                            {game}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={editForm.favorite_games.join(', ')}
                        onChange={(e) => setEditForm({...editForm, favorite_games: e.target.value.split(', ').filter(Boolean)})}
                        className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 text-white"
                        placeholder="Valorant, League of Legends, Minecraft (comma separated)"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white font-pixelify mb-4 flex items-center space-x-2">
                  <Settings size={20} />
                  <span>Account Actions</span>
                </h3>
                
                <div className="space-y-3">
                  <button
                    onClick={handleSignOut}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 