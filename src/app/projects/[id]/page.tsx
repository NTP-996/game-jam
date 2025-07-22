'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Github, ExternalLink, Calendar, User, Code, Star } from 'lucide-react'
import DashboardNav from '@/components/dashboard/DashboardNav'
import MobileBottomNav from '@/components/dashboard/MobileBottomNav'
import ProfileButton from '@/components/ProfileButton'
import FloatingElements from '@/components/FloatingElements/FloatingElements'

interface Project {
  id: string
  creator_id: string
  team_id: string | null
  project_name: string
  project_description: string
  category: string
  solana_integration: string
  tech_stack: string[]
  github_url: string
  demo_url?: string
  game_host_url: string
  video_url: string
  banner_url: string
  logo_url: string
  screenshot_urls: string[]
  challenges?: string
  features: string[]
  status: 'draft' | 'submitted' | 'approved' | 'featured' | 'rejected'
  is_final: boolean
  hackathon_edition: string
  created_at: string
  submitted_at: string | null
  updated_at: string
  team?: {
    id: string
    name: string
    description: string
    max_members: number
    is_public: boolean
    is_recruiting: boolean
    looking_for: string[]
    tags: string[]
    project_idea?: string
    leader_id: string
    github_url?: string
    discord_server?: string
    website_url?: string
    created_at: string
    updated_at: string
    members?: TeamMember[]
  }
  creator_profile?: {
    id: string
    email?: string
    full_name: string
    username: string
    avatar_url: string | null
    bio?: string
    github_url?: string
    twitter_url?: string
    discord_username?: string
    telegram_username?: string
    linkedin_url?: string
    website_url?: string
    location?: string
    timezone?: string
    birth_date?: string
    phone?: string
    job_title?: string
    company?: string
    experience_level?: string
    education?: string
    skills?: string[]
    interests?: string[]
    programming_languages?: string[]
    frameworks?: string[]
    previous_hackathons?: number
    preferred_role?: string
    availability?: string
    looking_for_team?: boolean
    favorite_games?: string[]
    game_dev_experience?: string
    created_at: string
    updated_at: string
  }
}

interface TeamMember {
  id: string
  user_id: string
  role: string
  status: string
  can_invite: boolean
  can_manage_submissions: boolean
  joined_at: string
  profiles: {
    id: string
    full_name: string
    username: string
    avatar_url: string | null
    bio?: string
    job_title?: string
    experience_level?: string
    skills?: string[]
    programming_languages?: string[]
    frameworks?: string[]
    github_url?: string
    twitter_url?: string
    discord_username?: string
    website_url?: string
    location?: string
  } | null
}

export default function ProjectShowcase() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMedia, setSelectedMedia] = useState({ type: 'image', url: '' })

  useEffect(() => {
    if (projectId) {
      loadProject()
    }
  }, [projectId])

  const loadProject = async () => {
    try {
      setLoading(true)
      setError(null)

      // Public API call (no authentication required)
      const response = await fetch(`/api/projects/${projectId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Project not found or not publicly available')
        } else {
          setError('Failed to load project')
        }
        return
      }

      const data = await response.json()
      const projectData = data.project



      setProject(projectData)
      
      // Set initial media
      if (projectData.screenshot_urls && projectData.screenshot_urls.length > 0) {
        setSelectedMedia({ type: 'image', url: projectData.screenshot_urls[0] })
      } else if (projectData.video_url) {
        setSelectedMedia({ type: 'video', url: projectData.video_url })
      }

    } catch (err) {
      console.error('Error loading project:', err)
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900/20 via-transparent to-blue-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-200">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900/20 via-transparent to-blue-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-white mb-4">Project Not Found</h1>
          <p className="text-purple-300 mb-6">{error || 'This project may not be publicly available'}</p>
          <Link href="/dashboard/catalogue" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors">
            Back to Catalogue
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingElements />
      
      <div className="relative z-10 flex">
        <DashboardNav />
        
        <main className="flex-1 bg-gradient-to-b from-purple-900/20 via-transparent to-blue-900/20">
          {/* Hero Section - Game Banner */}
      <div className="relative aspect-[16/9] sm:aspect-[16/9] md:aspect-[21/9] max-h-[35vh] sm:max-h-[30vh] md:max-h-[40vh] overflow-hidden mx-auto">
        {project.banner_url ? (
          <div className="absolute inset-0">
            <Image
              src={project.banner_url}
              alt="Game banner"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800" />
        )}

        {/* Hero Content - Desktop Only */}
        <div className="relative h-full hidden lg:flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-4 md:px-6 pb-6 sm:pb-8 md:pb-16">
            <div className="flex flex-col lg:flex-row items-center lg:items-end gap-4 sm:gap-4 md:gap-8">
              {/* Game Logo */}
              {project.logo_url && (
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border-2 md:border-4 border-white/20 backdrop-blur-sm">
                    <Image
                      src={project.logo_url}
                      alt="Game logo"
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Game Info */}
              <div className="flex-1 space-y-3 sm:space-y-3 md:space-y-4 text-center lg:text-left">
                <div className="flex flex-col lg:flex-row lg:items-center gap-2 sm:gap-2 lg:gap-4">
                  <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-6xl font-bold text-white pixelify-sans drop-shadow-2xl leading-tight">
                    {project.project_name}
                  </h1>
                  <div className={`px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-2 rounded-full backdrop-blur-sm border font-bold text-xs md:text-sm lg:text-base mx-auto lg:mx-0 w-fit ${
                    project.status === 'submitted' 
                      ? 'bg-green-500/20 border-green-400/50 text-green-400' 
                      : project.status === 'approved'
                      ? 'bg-blue-500/20 border-blue-400/50 text-blue-400'
                      : project.status === 'featured'
                      ? 'bg-purple-500/20 border-purple-400/50 text-purple-400'
                      : 'bg-gray-500/20 border-gray-400/50 text-gray-400'
                  }`}>
                    {project.status === 'submitted' ? '⏳ Under Review'
                     : project.status === 'approved' ? '✅ Approved'
                     : project.status === 'featured' ? '🌟 Featured'
                     : '📝 Draft'}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 md:gap-6 text-white/90 text-sm sm:text-sm md:text-base">
                  <span className="bg-purple-600/30 backdrop-blur-sm px-3 md:px-3 py-1 sm:py-1 rounded border border-purple-400/30 text-sm sm:text-sm">
                    {project.category}
                  </span>
                  <span className="hidden sm:inline text-sm md:text-lg">•</span>
                  <span className="text-center text-sm sm:text-sm md:text-base">
                    {project.submitted_at 
                      ? `Submitted ${new Date(project.submitted_at).toLocaleDateString()}`
                      : `Created ${new Date(project.created_at).toLocaleDateString()}`
                    }
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 md:gap-4 pt-4 sm:pt-2 md:pt-4">
                  {project.game_host_url ? (
                    <a
                      href={project.game_host_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 sm:px-6 md:px-8 py-3 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-base md:text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-2 md:gap-3"
                    >
                      <span className="text-lg sm:text-xl md:text-2xl">🎮</span>
                      <span className="text-sm sm:text-base md:text-lg">PLAY NOW</span>
                    </a>
                  ) : (
                    <div className="bg-gray-600 text-gray-400 px-6 sm:px-6 md:px-8 py-3 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-base md:text-lg flex items-center justify-center gap-2 sm:gap-2 md:gap-3 cursor-not-allowed">
                      <span className="text-lg sm:text-xl md:text-2xl">🎮</span>
                      <span className="text-sm sm:text-base md:text-lg">COMING SOON</span>
                    </div>
                  )}
                  
                  {project.video_url && (
                    <a
                      href={project.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-4 sm:px-4 md:px-6 py-3 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-2 md:gap-3"
                    >
                      <span className="text-base sm:text-lg md:text-xl">▶️</span>
                      <span className="hidden sm:inline text-sm md:text-base">Watch Trailer</span>
                      <span className="sm:hidden text-sm">Trailer</span>
                    </a>
                  )}

                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 hover:bg-gray-700/50 text-gray-200 hover:text-white px-4 sm:px-4 md:px-6 py-3 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-2 md:gap-3"
                    >
                      <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline text-sm md:text-base">Source Code</span>
                      <span className="sm:hidden text-sm">Code</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Game Info Section - Separate from Banner */}
      <div className="lg:hidden bg-gradient-to-br from-gray-900/95 via-purple-900/30 to-blue-900/30 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            {/* Mobile Logo */}
            {project.logo_url && (
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-xl border-2 border-white/20">
                  <Image
                    src={project.logo_url}
                    alt="Game logo"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            {/* Mobile Title & Status */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white pixelify-sans leading-tight mb-1">
                {project.project_name}
              </h1>
              <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                project.status === 'submitted' 
                  ? 'bg-green-500/20 border border-green-400/50 text-green-400' 
                  : project.status === 'approved'
                  ? 'bg-blue-500/20 border border-blue-400/50 text-blue-400'
                  : project.status === 'featured'
                  ? 'bg-purple-500/20 border border-purple-400/50 text-purple-400'
                  : 'bg-gray-500/20 border border-gray-400/50 text-gray-400'
              }`}>
                {project.status === 'submitted' ? '⏳ Under Review'
                 : project.status === 'approved' ? '✅ Approved'
                 : project.status === 'featured' ? '🌟 Featured'
                 : '📝 Draft'}
              </div>
            </div>
          </div>

          {/* Mobile Meta Info */}
          <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-white/90">
            <span className="bg-purple-600/30 backdrop-blur-sm px-3 py-1 rounded border border-purple-400/30">
              {project.category}
            </span>
            <span className="text-white/70">
              {project.submitted_at 
                ? `Submitted ${new Date(project.submitted_at).toLocaleDateString()}`
                : `Created ${new Date(project.created_at).toLocaleDateString()}`
              }
            </span>
          </div>

          {/* Mobile Action Buttons */}
          <div className="grid grid-cols-1 gap-3">
            {project.game_host_url ? (
              <a
                href={project.game_host_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-4 rounded-xl font-bold text-base shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <span className="text-xl">🎮</span>
                PLAY NOW
              </a>
            ) : (
              <div className="bg-gray-600 text-gray-400 px-6 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 cursor-not-allowed">
                <span className="text-xl">🎮</span>
                COMING SOON
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              {project.video_url && (
                <a
                  href={project.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-4 py-3 rounded-xl font-semibold shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span className="text-lg">▶️</span>
                  <span className="text-sm">Trailer</span>
                </a>
              )}

              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 hover:bg-gray-700/50 text-gray-200 hover:text-white px-4 py-3 rounded-xl font-semibold shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  <span className="text-sm">Code</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Steam-Style Media Player */}
        {((project.screenshot_urls && project.screenshot_urls.filter(url => url.trim()).length > 0) || project.video_url) && (
          <div className="bg-gray-900 rounded-lg md:rounded-xl overflow-hidden">
            {/* Main Media Display */}
            <div className="aspect-video bg-black relative">
              {selectedMedia.type === 'video' && project.video_url ? (
                project.video_url.includes('youtube.com') || project.video_url.includes('youtu.be') ? (
                  <iframe
                    src={project.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    title="Game Trailer"
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <video
                    src={project.video_url}
                    controls
                    className="w-full h-full object-cover"
                    poster={project.banner_url}
                  />
                )
              ) : (
                <Image
                  src={selectedMedia.url}
                  alt="Game media"
                  fill
                  className="object-contain"
                />
              )}
            </div>

            {/* Media Thumbnails */}
            <div className="bg-gray-800 p-2 sm:p-3 md:p-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {/* Video Thumbnail */}
                {project.video_url && (
                  <div
                    onClick={() => setSelectedMedia({ type: 'video', url: project.video_url })}
                    className={`relative w-16 h-10 sm:w-20 sm:h-12 md:w-24 md:h-16 bg-black rounded cursor-pointer flex-shrink-0 border-2 transition-all ${
                      selectedMedia.type === 'video' ? 'border-blue-500' : 'border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Image
                      src={project.banner_url || '/api/placeholder/96/64'}
                      alt="Video thumbnail"
                      fill
                      className="object-contain rounded"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-white/80 rounded-full flex items-center justify-center">
                        <span className="text-black text-xs">▶</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Screenshot Thumbnails */}
                {project.screenshot_urls && project.screenshot_urls.filter(url => url.trim()).map((url, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedMedia({ type: 'image', url: url })}
                    className={`relative w-16 h-10 sm:w-20 sm:h-12 md:w-24 md:h-16 bg-gray-700 rounded cursor-pointer flex-shrink-0 border-2 transition-all ${
                      selectedMedia.type === 'image' && selectedMedia.url === url ? 'border-blue-500' : 'border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`Screenshot ${index + 1}`}
                      fill
                      className="object-contain rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Game Description & Features - Split Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-4 sm:space-y-6 md:space-y-8">
            {/* About Section */}
            <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl md:rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-4 md:p-6 border-b border-gray-700/50">
                <h2 className="text-xl md:text-3xl font-bold text-white pixelify-sans flex items-center gap-3 md:gap-4">
                  <span className="text-2xl md:text-4xl">🎮</span>
                  About This Game
                </h2>
              </div>
              <div className="p-4 md:p-8">
                <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6 md:mb-8 font-medium">
                  {project.project_description}
                </p>
                
                {/* Key Features Grid */}
                {project.features && project.features.length > 0 && (
                  <div className="space-y-4 md:space-y-6">
                    <h3 className="text-lg md:text-2xl font-bold text-white pixelify-sans flex items-center gap-2 md:gap-3">
                      <span className="text-xl md:text-2xl">⭐</span>
                      Key Features
                    </h3>
                    <div className="grid grid-cols-1 gap-3 md:gap-4">
                      {project.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 md:p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                          <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs md:text-sm font-bold">✓</span>
                          </div>
                          <span className="text-gray-200 font-medium text-sm md:text-base">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Solana Integration Showcase */}
            <div className="relative bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-purple-900/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl md:rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div>
              <div className="relative p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl md:text-3xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white pixelify-sans">Powered by Solana</h3>
                    <p className="text-purple-200">Next-generation blockchain gaming</p>
                  </div>
                </div>
                <p className="text-purple-100 text-base md:text-lg leading-relaxed">
                  {project.solana_integration}
                </p>
              </div>
            </div>

            {/* Development Insights */}
            {project.challenges && (
              <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl md:rounded-3xl p-6 md:p-8">
                <h3 className="text-2xl md:text-3xl font-bold text-white pixelify-sans mb-6 flex items-center gap-4">
                  <span className="text-3xl md:text-4xl">🛠️</span>
                  Development Journey
                </h3>
                <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                  {project.challenges}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
            {/* Game Stats Card */}
            <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl md:rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-4 md:p-6 border-b border-gray-700/50">
                <h3 className="text-lg md:text-2xl font-bold text-white pixelify-sans flex items-center gap-2 md:gap-3">
                  <span className="text-2xl md:text-3xl">📊</span>
                  Game Info
                </h3>
              </div>
              <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                {/* Category */}
                <div className="flex items-center justify-between p-3 md:p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-gray-400 font-medium text-sm md:text-base">Genre</span>
                  <span className="bg-purple-600/30 text-purple-300 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold">
                    {project.category}
                  </span>
                </div>
                
                {/* Submission Date */}
                <div className="flex items-center justify-between p-3 md:p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-gray-400 font-medium text-sm md:text-base">Published</span>
                  <span className="text-white font-semibold text-sm md:text-base text-right">
                    {project.submitted_at 
                      ? new Date(project.submitted_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })
                      : new Date(project.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })
                    }
                  </span>
                </div>

                {project.hackathon_edition && (
                  <div className="flex items-center justify-between p-3 md:p-4 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-gray-400 font-medium text-sm md:text-base">Event</span>
                    <span className="bg-yellow-500/30 text-yellow-300 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold">
                      {project.hackathon_edition}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tech Stack */}
            {project.tech_stack && project.tech_stack.length > 0 && (
              <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl md:rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-4 md:p-6 border-b border-gray-700/50">
                  <h3 className="text-lg md:text-2xl font-bold text-white pixelify-sans flex items-center gap-2 md:gap-3">
                    <span className="text-2xl md:text-3xl">⚙️</span>
                    Tech Stack
                  </h3>
                </div>
                <div className="p-4 md:p-6">
                  <div className="flex flex-wrap gap-3">
                    {project.tech_stack.map((tech, index) => (
                      <div key={index} className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-blue-300 px-3 md:px-4 py-2 md:py-3 rounded-xl font-bold text-xs md:text-sm hover:from-blue-500/30 hover:to-cyan-500/30 hover:scale-105 transition-all duration-300 cursor-default">
                        {tech}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Team Section - Full Width */}
        <div className="bg-gradient-to-br from-gray-900/95 via-purple-900/20 to-blue-900/20 backdrop-blur-xl border border-gray-700/50 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600/30 via-blue-600/30 to-purple-600/30 p-4 sm:p-6 md:p-8 border-b border-gray-700/50">
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <div className="w-2 sm:w-3 h-8 sm:h-12 md:h-16 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white pixelify-sans text-center">
                {project.team ? 'Meet the Team' : 'Meet the Creator'}
              </h2>
              <div className="w-2 sm:w-3 h-8 sm:h-12 md:h-16 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 md:p-8">
            
             {project.team && project.team.members && project.team.members.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                 {project.team.members.map((member) => {
                   const profile = member.profiles
                   if (!profile) {
                     return (
                       <div key={member.id} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                         <div className="text-center space-y-3 sm:space-y-4">
                           <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full mx-auto flex items-center justify-center text-white text-lg sm:text-2xl font-bold border-2 border-gray-500/30">
                             ?
                           </div>
                           <div>
                             <h5 className="text-base sm:text-lg font-bold text-white">Unknown Member</h5>
                             <p className="text-gray-400 text-xs sm:text-sm">{member.role}</p>
                           </div>
                         </div>
                       </div>
                     )
                   }

                   return (
                     <div key={member.id} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-purple-500/30 hover:scale-105 transition-all duration-300">
                       <div className="text-center space-y-3 sm:space-y-4">
                         <div className="relative">
                           {profile.avatar_url ? (
                             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mx-auto border-2 border-purple-500/30">
                               <Image
                                 src={profile.avatar_url}
                                 alt={profile.full_name}
                                 width={80}
                                 height={80}
                                 className="w-full h-full object-cover"
                               />
                             </div>
                           ) : (
                             <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto flex items-center justify-center text-white text-lg sm:text-2xl font-bold border-2 border-purple-500/30">
                               {profile.full_name.charAt(0).toUpperCase()}
                             </div>
                           )}
                           <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                             <span className="text-white text-xs">✓</span>
                           </div>
                           {member.user_id === project.team?.leader_id && (
                             <div className="absolute -top-1 -left-1 w-6 h-6 bg-yellow-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                               <span className="text-white text-xs">👑</span>
                             </div>
                           )}
                         </div>
                         
                         <div>
                           <h5 className="text-base sm:text-lg font-bold text-white break-words">
                             {profile.full_name}
                           </h5>
                           <p className="text-purple-300 text-xs sm:text-sm font-medium">
                             {member.user_id === project.team?.leader_id ? 'Team Leader' : member.role}
                           </p>
                           {profile.job_title && (
                             <p className="text-gray-400 text-xs">
                               {profile.job_title}
                             </p>
                           )}
                         </div>

                         {/* Member Skills */}
                         {profile.skills && profile.skills.length > 0 && (
                           <div className="flex flex-wrap gap-1 justify-center">
                             {profile.skills.slice(0, 3).map((skill, skillIndex) => (
                               <span key={skillIndex} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                 {skill}
                               </span>
                             ))}
                             {profile.skills.length > 3 && (
                               <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs">
                                 +{profile.skills.length - 3}
                               </span>
                             )}
                           </div>
                         )}

                         {/* Programming Languages */}
                         {profile.programming_languages && profile.programming_languages.length > 0 && (
                           <div className="flex flex-wrap gap-1 justify-center">
                             {profile.programming_languages.slice(0, 2).map((lang, langIndex) => (
                               <span key={langIndex} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                                 {lang}
                               </span>
                             ))}
                             {profile.programming_languages.length > 2 && (
                               <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-xs">
                                 +{profile.programming_languages.length - 2}
                               </span>
                             )}
                           </div>
                         )}

                         {/* Social Links */}
                         <div className="flex justify-center gap-2 pt-2">
                           {profile.github_url && (
                             <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-colors">
                               <Github className="w-4 h-4" />
                             </a>
                           )}
                           {profile.twitter_url && (
                             <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-colors">
                               <span className="text-sm">𝕏</span>
                             </a>
                           )}
                           {profile.website_url && (
                             <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-colors">
                               <ExternalLink className="w-4 h-4" />
                             </a>
                           )}
                         </div>
                       </div>
                     </div>
                   )
                 })}
              </div>
            ) : project.creator_profile ? (
              /* Solo Creator Display */
              <div className="max-w-md mx-auto">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-purple-500/30 transition-all duration-300">
                  <div className="text-center space-y-6">
                    <div className="relative">
                      {project.creator_profile.avatar_url ? (
                        <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-purple-500/30">
                          <Image
                            src={project.creator_profile.avatar_url}
                            alt={project.creator_profile.full_name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold border-2 border-purple-500/30">
                          {project.creator_profile.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-2xl font-bold text-white">
                        {project.creator_profile.full_name}
                      </h5>
                      <p className="text-purple-300 text-base font-medium">
                        @{project.creator_profile.username}
                      </p>
                      {project.creator_profile.job_title && (
                        <p className="text-gray-400 text-sm mt-1">
                          {project.creator_profile.job_title}
                        </p>
                      )}
                      {project.creator_profile.bio && (
                        <p className="text-gray-300 text-sm mt-3 leading-relaxed">
                          {project.creator_profile.bio}
                        </p>
                      )}
                    </div>

                    {/* Creator Skills */}
                    {project.creator_profile.skills && project.creator_profile.skills.length > 0 && (
                      <div>
                        <p className="text-purple-300 text-sm mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {project.creator_profile.skills.map((skill, skillIndex) => (
                            <span key={skillIndex} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Programming Languages */}
                    {project.creator_profile.programming_languages && project.creator_profile.programming_languages.length > 0 && (
                      <div>
                        <p className="text-purple-300 text-sm mb-2">Languages</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {project.creator_profile.programming_languages.map((lang, langIndex) => (
                            <span key={langIndex} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Social Links */}
                    <div className="flex justify-center gap-3 pt-4">
                      {project.creator_profile.github_url && (
                        <a href={project.creator_profile.github_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-xl transition-colors">
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                      {project.creator_profile.twitter_url && (
                        <a href={project.creator_profile.twitter_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-xl transition-colors">
                          <span className="text-lg">𝕏</span>
                        </a>
                      )}
                      {project.creator_profile.website_url && (
                        <a href={project.creator_profile.website_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-xl transition-colors">
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">Creator information not available</p>
              </div>
            )}
          </div>
        </div>

          {/* Back to Catalogue */}
          <div className="text-center pt-4 sm:pt-6 md:pt-8 pb-4 sm:pb-0">
            <Link href="/dashboard/catalogue" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base">
              ← Back to Catalogue
            </Link>
          </div>
        </div>
        </main>
      </div>
      
      {/* Profile Button */}
      <ProfileButton />
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
} 