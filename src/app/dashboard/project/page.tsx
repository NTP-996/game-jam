'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ApiClient } from '@/lib/apiClient'
import Image from 'next/image'
import ImageUpload from '@/components/uploads/ImageUpload'
import VideoUrlInput from '@/components/uploads/VideoUrlInput'

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
  demo_url: string | null
  game_host_url: string
  video_url: string
  banner_url: string
  logo_url: string
  screenshot_urls: string[]
  challenges: string | null
  features: string[]
  status: 'draft' | 'submitted' | 'approved' | 'featured' | 'rejected'
  is_final: boolean
  hackathon_edition: string
  created_at: string
  submitted_at: string | null
  updated_at: string
  creator_profile?: {
    full_name: string
    avatar_url: string | null
    username: string
  }
  team?: {
    id: string
  name: string
  description: string
    github_url?: string
    discord_server?: string
    website_url?: string
  }
}

interface ProjectFormData {
  project_name: string
  project_description: string
  category: string
  solana_integration: string
  tech_stack: string[]
  github_url: string
  demo_url: string
  game_host_url: string
  video_url: string
  banner_url: string
  logo_url: string
  screenshot_urls: string[]
  challenges: string
  features: string[]
}

export default function ProjectPage() {
  const { user } = useAuth()
  const [existingProject, setExistingProject] = useState<Project | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const totalSteps = 4

  const [formData, setFormData] = useState<ProjectFormData>({
    project_name: '',
    project_description: '',
    category: '',
    solana_integration: '',
    tech_stack: [],
    github_url: '',
    demo_url: '',
    game_host_url: '',
    video_url: '',
    banner_url: '',
    logo_url: '',
    screenshot_urls: ['', '', ''],
    challenges: '',
    features: []
  })

  const categories = [
    'Action/Adventure',
    'RPG/MMORPG',
    'Strategy',
    'Puzzle',
    'Racing',
    'Sports',
    'Simulation',
    'Casual/Mobile',
    'Educational',
    'Other'
  ]

  const [techStackInput, setTechStackInput] = useState('')
  const [selectedMedia, setSelectedMedia] = useState({ type: 'image', url: '' })

  useEffect(() => {
    if (user) {
      loadUserProject()
    }
  }, [user])

  const loadUserProject = async () => {
    try {
      setLoading(true)
      
      // Always get team data first since we need it for the team section
      const teamResponse = await ApiClient.get('/api/teams?mode=my')
      let userTeam = null
      if (teamResponse.ok) {
        const teamData = await teamResponse.json()
        userTeam = teamData.teams?.[0] || null
      }

      // Get individual projects
      const response = await ApiClient.get('/api/projects?view=user')
      let project = null
      
      if (response.ok) {
        const data = await response.json()
        project = data.projects?.[0] || null
      }
      
      // If no individual project, check for team projects
      if (!project && userTeam) {
        try {
          const teamSubmissionResponse = await ApiClient.get('/api/teams/submissions')
          if (teamSubmissionResponse.ok) {
            const teamData = await teamSubmissionResponse.json()
            project = teamData.submissions?.[0] || null
          }
        } catch (teamErr) {
          console.error('Error loading team project:', teamErr)
        }
      }
      
              if (project) {
          // Always attach team data if we have it
          if (userTeam) {
            project.team = userTeam
          }
          
          // Set initial media
          if (project.screenshot_urls && project.screenshot_urls.length > 0) {
            setSelectedMedia({ type: 'image', url: project.screenshot_urls[0] })
          } else if (project.video_url) {
            setSelectedMedia({ type: 'video', url: project.video_url })
          }
        
        // If individual project, fetch creator profile
        if (!project.team_id && project.creator_id) {
          try {
            const profileResponse = await ApiClient.get(`/api/profile/${project.creator_id}`)
            if (profileResponse.ok) {
              const profileData = await profileResponse.json()
              project.creator_profile = profileData.profile
            }
          } catch (profileErr) {
            console.error('Error loading creator profile:', profileErr)
          }
        }
        
        setExistingProject(project)
        // Populate form with existing data
        setFormData({
          project_name: project.project_name,
          project_description: project.project_description,
          category: project.category,
          solana_integration: project.solana_integration,
          tech_stack: project.tech_stack,
          github_url: project.github_url,
          demo_url: project.demo_url || '',
          game_host_url: project.game_host_url,
          video_url: project.video_url,
          banner_url: project.banner_url,
          logo_url: project.logo_url,
          screenshot_urls: project.screenshot_urls.length > 0 ? project.screenshot_urls : ['', '', ''],
          challenges: project.challenges || '',
          features: project.features
        })
        setTechStackInput(project.tech_stack.join(', '))
      } else if (userTeam) {
        // No project but we have team data - create a minimal project object with team
        setExistingProject({ 
          team: userTeam,
          // Add required project fields as null/empty
          id: '',
          creator_id: '',
          team_id: userTeam.id,
          project_name: '',
          project_description: '',
          category: '',
          solana_integration: '',
          tech_stack: [],
          github_url: '',
          demo_url: '',
          game_host_url: '',
          video_url: '',
          banner_url: '',
          logo_url: '',
          screenshot_urls: [],
          challenges: '',
          features: [],
          status: 'draft',
          is_final: false,
          created_at: '',
          updated_at: '',
          submitted_at: null
        } as any)
      }
    } catch (err) {
      console.error('Error loading project:', err)
      setError('Failed to load project data')
    } finally {
      setLoading(false)
    }
  }

  const handleTechStackChange = (value: string) => {
    setTechStackInput(value)
    const technologies = value.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0)
    setFormData({...formData, tech_stack: technologies})
  }

  const handleSaveDraft = async () => {
    try {
      setSaving(true)
      setError(null)

      // Validate required fields for draft
      if (!formData.project_name.trim()) {
        setError('Project name is required')
        return
      }

      const projectData = {
        ...formData,
        screenshot_urls: formData.screenshot_urls.filter(url => url.trim().length > 0)
      }

      let response
      if (existingProject) {
        // Update existing project
        response = await ApiClient.put(`/api/projects/${existingProject.id}`, projectData)
      } else {
        // Create new project
        response = await ApiClient.post('/api/projects', projectData)
      }

      if (response.ok) {
        const data = await response.json()
        setExistingProject(data.project)
        alert('Project saved as draft successfully!')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save project')
      }
    } catch (err) {
      console.error('Error saving project:', err)
      setError('Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitProject = async () => {
    try {
      setSubmitting(true)
      setError(null)

      // Validate all required fields
      const requiredFields = [
        'project_name', 'project_description', 'category', 'solana_integration',
        'github_url', 'game_host_url', 'video_url', 'banner_url', 'logo_url'
      ]

      for (const field of requiredFields) {
        if (!formData[field as keyof ProjectFormData]) {
          setError(`Missing required field: ${field.replace('_', ' ')}`)
          return
        }
      }

      if (formData.tech_stack.length === 0) {
        setError('Tech stack is required')
        return
      }

      const validScreenshots = formData.screenshot_urls.filter(url => url.trim().length > 0)
      if (validScreenshots.length === 0) {
        setError('At least one screenshot is required')
        return
      }

      // First save the project if not exists or update it
      const projectData = {
        ...formData,
        screenshot_urls: validScreenshots
      }

      let projectId = existingProject?.id

      if (!existingProject) {
        // Create project first
        const createResponse = await ApiClient.post('/api/projects', projectData)
        if (!createResponse.ok) {
          const errorData = await createResponse.json()
          setError(errorData.error || 'Failed to create project')
          return
        }
        const createData = await createResponse.json()
        projectId = createData.project.id
        setExistingProject(createData.project)
      } else {
        // Update existing project
        const updateResponse = await ApiClient.put(`/api/projects/${existingProject.id}`, projectData)
        if (!updateResponse.ok) {
          const errorData = await updateResponse.json()
          setError(errorData.error || 'Failed to update project')
          return
        }
      }

      // Now submit the project
      const submitResponse = await ApiClient.post(`/api/projects/${projectId}/submit`, {})
      
      if (submitResponse.ok) {
        const data = await submitResponse.json()
        setExistingProject(data.project)
        setIsEditing(false)
        alert('Project submitted successfully!')
      } else {
        const errorData = await submitResponse.json()
        setError(errorData.error || 'Failed to submit project')
      }
    } catch (err) {
      console.error('Error submitting project:', err)
      setError('Failed to submit project')
    } finally {
      setSubmitting(false)
    }
  }

  const addScreenshotField = () => {
    setFormData({
      ...formData,
      screenshot_urls: [...formData.screenshot_urls, '']
    })
  }

  const updateScreenshotUrl = (index: number, value: string) => {
    const newUrls = [...formData.screenshot_urls]
    newUrls[index] = value
    setFormData({
      ...formData,
      screenshot_urls: newUrls
    })
  }

  const removeScreenshotField = (index: number) => {
    if (formData.screenshot_urls.length > 1) {
      const newUrls = formData.screenshot_urls.filter((_, i) => i !== index)
      setFormData({
        ...formData,
        screenshot_urls: newUrls
      })
    }
  }

  if (loading) {
    return (
      <div className="ml-0 lg:ml-64 p-6 transition-all duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-purple-200">Loading project data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show submitted project view - Epic Steam-like showcase
  if (existingProject && ['submitted', 'approved', 'featured', 'rejected'].includes(existingProject.status) && !isEditing) {
    return (
      <div className="ml-0 lg:ml-64 min-h-screen bg-gradient-to-b from-purple-900/20 via-transparent to-blue-900/20">
        {/* Hero Section - Game Banner */}
        <div className="relative aspect-[21/9] max-h-[40vh] overflow-hidden mx-auto">
          {existingProject.banner_url ? (
            <div className="absolute inset-0">
              <Image
                src={existingProject.banner_url}
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

          {/* Hero Content */}
          <div className="relative h-full flex items-end">
            <div className="w-full max-w-7xl mx-auto px-6 pb-16">
              <div className="flex flex-col lg:flex-row items-end gap-8">
                {/* Game Logo */}
                {existingProject.logo_url && (
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-sm">
                      <Image
                        src={existingProject.logo_url}
                        alt="Game logo"
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Game Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <h1 className="text-4xl lg:text-6xl font-bold text-white pixelify-sans drop-shadow-2xl">
                      {existingProject.project_name}
              </h1>
                    <div className={`px-4 py-2 rounded-full backdrop-blur-sm border font-bold text-sm lg:text-base ${
                      existingProject.status === 'submitted' 
                        ? 'bg-green-500/20 border-green-400/50 text-green-400' 
                        : existingProject.status === 'approved'
                        ? 'bg-blue-500/20 border-blue-400/50 text-blue-400'
                        : existingProject.status === 'featured'
                        ? 'bg-purple-500/20 border-purple-400/50 text-purple-400'
                        : 'bg-red-500/20 border-red-400/50 text-red-400'
                    }`}>
                      {existingProject.status === 'submitted' ? '⏳ Under Review'
                       : existingProject.status === 'approved' ? '✅ Approved'
                       : existingProject.status === 'featured' ? '🌟 Featured'
                       : '❌ Rejected'}
            </div>
                  </div>

                  <div className="flex items-center gap-6 text-white/90">
                    <span className="bg-purple-600/30 backdrop-blur-sm px-3 py-1 rounded-lg border border-purple-400/30">
                      {existingProject.category}
                    </span>
                    <span className="text-lg">•</span>
                    <span>
                      {existingProject.submitted_at 
                        ? `Submitted ${new Date(existingProject.submitted_at).toLocaleDateString()}`
                        : `Updated ${new Date(existingProject.updated_at).toLocaleDateString()}`
                      }
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    <a
                      href={existingProject.game_host_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
                    >
                      <span className="text-2xl">🎮</span>
                      PLAY NOW
                    </a>
                    
                    {existingProject.video_url && (
                      <a
                        href={existingProject.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-6 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
                      >
                        <span className="text-xl">▶️</span>
                        Watch Trailer
                      </a>
                    )}

                    {existingProject.status === 'submitted' && (
              <button
                onClick={() => setIsEditing(true)}
                        className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/50 hover:bg-blue-500/30 text-blue-400 px-6 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
              >
                        <span className="text-xl">✏️</span>
                Edit Submission
              </button>
                    )}
            </div>
          </div>
              </div>
              </div>
            </div>
          </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
                </div>
          )}

          {/* Epic Game Content - Steam Style */}
          <div className="space-y-12">
            {/* Steam-Style Media Player */}
            {((existingProject.screenshot_urls && existingProject.screenshot_urls.filter(url => url.trim()).length > 0) || existingProject.video_url) && (
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                {/* Main Media Display */}
                <div className="aspect-video bg-black relative">
                  {selectedMedia.type === 'video' && existingProject.video_url ? (
                    existingProject.video_url.includes('youtube.com') || existingProject.video_url.includes('youtu.be') ? (
                      <iframe
                        src={existingProject.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        title="Game Trailer"
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    ) : (
                      <video
                        src={existingProject.video_url}
                        controls
                        className="w-full h-full object-cover"
                        poster={existingProject.banner_url}
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
                <div className="bg-gray-800 p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {/* Video Thumbnail */}
                    {existingProject.video_url && (
                      <div
                        onClick={() => setSelectedMedia({ type: 'video', url: existingProject.video_url })}
                        className={`relative w-24 h-16 bg-black rounded cursor-pointer flex-shrink-0 border-2 transition-all ${
                          selectedMedia.type === 'video' ? 'border-blue-500' : 'border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <Image
                          src={existingProject.banner_url || '/api/placeholder/96/64'}
                          alt="Video thumbnail"
                          fill
                          className="object-contain rounded"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                            <span className="text-black text-xs">▶</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Screenshot Thumbnails */}
                    {existingProject.screenshot_urls && existingProject.screenshot_urls.filter(url => url.trim()).map((url, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedMedia({ type: 'image', url: url })}
                        className={`relative w-24 h-16 bg-gray-700 rounded cursor-pointer flex-shrink-0 border-2 transition-all ${
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
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
              {/* Main Content */}
              <div className="xl:col-span-3 space-y-8">
                {/* About Section */}
                <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 border-b border-gray-700/50">
                    <h2 className="text-3xl font-bold text-white pixelify-sans flex items-center gap-4">
                      <span className="text-4xl">🎮</span>
                      About This Game
                    </h2>
                  </div>
                  <div className="p-8">
                    <p className="text-gray-300 text-lg leading-relaxed mb-8 font-medium">
                      {existingProject.project_description}
                    </p>
                    
                    {/* Key Features Grid */}
                    {existingProject.features && existingProject.features.length > 0 && (
                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white pixelify-sans flex items-center gap-3">
                          <span className="text-2xl">⭐</span>
                          Key Features
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {existingProject.features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                              <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-sm font-bold">✓</span>
                              </div>
                              <span className="text-gray-200 font-medium">{feature}</span>
                      </div>
                    ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Solana Integration Showcase */}
                <div className="relative bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-purple-900/90 backdrop-blur-xl border border-purple-500/30 rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div>
                  <div className="relative p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                        <span className="text-3xl">⚡</span>
                      </div>
                <div>
                        <h3 className="text-3xl font-bold text-white pixelify-sans">Powered by Solana</h3>
                        <p className="text-purple-200">Next-generation blockchain gaming</p>
                      </div>
                    </div>
                    <p className="text-purple-100 text-lg leading-relaxed">
                      {existingProject.solana_integration}
                    </p>
                  </div>
                </div>

                {/* Development Insights */}
                {existingProject.challenges && (
                  <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
                    <h3 className="text-3xl font-bold text-white pixelify-sans mb-6 flex items-center gap-4">
                      <span className="text-4xl">🛠️</span>
                      Development Journey
                    </h3>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {existingProject.challenges}
                    </p>
                  </div>
                )}
              </div>

              {/* Epic Sidebar */}
              <div className="xl:col-span-2 space-y-6">
                {/* Game Stats Card */}
                <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-6 border-b border-gray-700/50">
                    <h3 className="text-2xl font-bold text-white pixelify-sans flex items-center gap-3">
                      <span className="text-3xl">📊</span>
                      Game Info
                    </h3>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Category */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-gray-400 font-medium">Genre</span>
                      <span className="bg-purple-600/30 text-purple-300 px-3 py-1 rounded-full text-sm font-bold">
                        {existingProject.category}
                      </span>
                  </div>
                    
                    {/* Submission Date */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-gray-400 font-medium">Submitted</span>
                      <span className="text-white font-semibold">
                        {existingProject.submitted_at 
                          ? new Date(existingProject.submitted_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })
                          : new Date(existingProject.updated_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })
                        }
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-gray-400 font-medium">Status</span>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                        existingProject.status === 'submitted' 
                          ? 'bg-yellow-500/20 text-yellow-400' 
                          : existingProject.status === 'approved'
                          ? 'bg-green-500/20 text-green-400'
                          : existingProject.status === 'featured'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {existingProject.status === 'submitted' ? 'Under Review'
                         : existingProject.status === 'approved' ? 'Approved'
                         : existingProject.status === 'featured' ? 'Featured'
                         : 'Rejected'}
                      </div>
                </div>
              </div>
            </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-6 border-b border-gray-700/50">
                    <h3 className="text-2xl font-bold text-white pixelify-sans flex items-center gap-3">
                      <span className="text-3xl">🚀</span>
                      Quick Actions
                </h3>
                  </div>
                  <div className="p-6 space-y-4">
                  <a
                      href={existingProject.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-700/50 to-gray-600/50 hover:from-gray-600/50 hover:to-gray-500/50 rounded-2xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 hover:scale-105 group"
                  >
                      <div className="w-12 h-12 bg-gray-700 group-hover:bg-gray-600 rounded-xl flex items-center justify-center transition-colors">
                        <span className="text-xl">📂</span>
                    </div>
                      <div className="flex-1">
                        <p className="text-white font-bold">Source Code</p>
                        <p className="text-gray-400 text-sm">View on GitHub</p>
                      </div>
                      <div className="text-gray-400 group-hover:text-white transition-colors">
                        <span className="text-xl">→</span>
                      </div>
                    </a>

                    {existingProject.demo_url && existingProject.demo_url !== existingProject.game_host_url && (
                      <a
                        href={existingProject.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-700/50 to-blue-600/50 hover:from-blue-600/50 hover:to-blue-500/50 rounded-2xl border border-blue-600/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 group"
                  >
                        <div className="w-12 h-12 bg-blue-600 group-hover:bg-blue-500 rounded-xl flex items-center justify-center transition-colors">
                          <span className="text-xl">🌐</span>
                    </div>
                        <div className="flex-1">
                          <p className="text-white font-bold">Project Page</p>
                          <p className="text-blue-300 text-sm">View details</p>
                        </div>
                        <div className="text-blue-400 group-hover:text-white transition-colors">
                          <span className="text-xl">→</span>
                        </div>
                      </a>
                    )}

                    {/* Team Social Links */}
                    {existingProject.team?.github_url && (
                      <a
                        href={existingProject.team.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-700/50 to-gray-600/50 hover:from-gray-600/50 hover:to-gray-500/50 rounded-2xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 hover:scale-105 group"
                  >
                        <div className="w-12 h-12 bg-gray-700 group-hover:bg-gray-600 rounded-xl flex items-center justify-center transition-colors">
                          <span className="text-xl">👥</span>
                    </div>
                        <div className="flex-1">
                          <p className="text-white font-bold">Team GitHub</p>
                          <p className="text-gray-400 text-sm">Team repositories</p>
                        </div>
                        <div className="text-gray-400 group-hover:text-white transition-colors">
                          <span className="text-xl">→</span>
                        </div>
                      </a>
                    )}

                    {existingProject.team?.discord_server && (
                      <a
                        href={existingProject.team.discord_server}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-700/50 to-indigo-600/50 hover:from-indigo-600/50 hover:to-indigo-500/50 rounded-2xl border border-indigo-600/50 hover:border-indigo-500/50 transition-all duration-300 hover:scale-105 group"
                      >
                        <div className="w-12 h-12 bg-indigo-600 group-hover:bg-indigo-500 rounded-xl flex items-center justify-center transition-colors">
                          <span className="text-xl">💬</span>
                </div>
                        <div className="flex-1">
                          <p className="text-white font-bold">Team Discord</p>
                          <p className="text-indigo-300 text-sm">Join our server</p>
              </div>
                        <div className="text-indigo-400 group-hover:text-white transition-colors">
                          <span className="text-xl">→</span>
                        </div>
                      </a>
                    )}

                    {existingProject.team?.website_url && (
                      <a
                        href={existingProject.team.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-700/50 to-green-600/50 hover:from-green-600/50 hover:to-green-500/50 rounded-2xl border border-green-600/50 hover:border-green-500/50 transition-all duration-300 hover:scale-105 group"
                      >
                        <div className="w-12 h-12 bg-green-600 group-hover:bg-green-500 rounded-xl flex items-center justify-center transition-colors">
                          <span className="text-xl">🌐</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-bold">Team Website</p>
                          <p className="text-green-300 text-sm">Visit our site</p>
                        </div>
                        <div className="text-green-400 group-hover:text-white transition-colors">
                          <span className="text-xl">→</span>
                        </div>
                      </a>
                    )}
                  </div>
                </div>

                {/* Tech Stack */}
                {existingProject.tech_stack && existingProject.tech_stack.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-6 border-b border-gray-700/50">
                      <h3 className="text-2xl font-bold text-white pixelify-sans flex items-center gap-3">
                        <span className="text-3xl">⚙️</span>
                        Tech Stack
                </h3>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-3">
                        {existingProject.tech_stack.map((tech, index) => (
                          <div key={index} className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-blue-300 px-4 py-3 rounded-xl font-bold text-sm hover:from-blue-500/30 hover:to-cyan-500/30 hover:scale-105 transition-all duration-300 cursor-default">
                            {tech}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Epic Team/Creator Section */}
          <div className="bg-gradient-to-br from-gray-900/95 via-purple-900/20 to-blue-900/20 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600/30 via-blue-600/30 to-purple-600/30 p-8 border-b border-gray-700/50">
              <div className="flex items-center justify-center gap-4">
                <div className="w-3 h-16 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full"></div>
                <h2 className="text-4xl font-bold text-white pixelify-sans text-center">
                  {existingProject.team ? 'Meet the Team' : 'Meet the Creator'}
                </h2>
                <div className="w-3 h-16 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
              </div>
            </div>
            
            <div className="p-8">
              {/* Always show team information since this should be a team project */}
              <div className="space-y-8">
                {/* Team Members Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Display team members if available */}
                    {(existingProject.team as any)?.members && (existingProject.team as any).members.length > 0 ? (
                      (existingProject.team as any).members.map((member: any, index: number) => (
                        <div key={index} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-purple-500/30 hover:scale-105 transition-all duration-300">
                          <div className="text-center space-y-4">
                            <div className="relative">
                              {member.avatar_url ? (
                                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto border-2 border-purple-500/30">
                      <Image
                                    src={member.avatar_url}
                                    alt={member.name || 'Team member'}
                                    width={64}
                                    height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                              ) : (
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto flex items-center justify-center text-white text-xl font-bold border-2 border-purple-500/30">
                                  {(member.name || member.full_name || 'U').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="text-lg font-bold text-white">
                                {member.name || member.full_name || 'Team Member'}
                              </h5>
                              <p className="text-purple-300 text-sm font-medium">
                                {member.role || 'Developer'}
                              </p>
                            </div>

                            {/* Member Skills */}
                            {member.skills && Array.isArray(member.skills) && member.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 justify-center">
                                {member.skills.slice(0, 3).map((skill: string, skillIndex: number) => (
                                  <span key={skillIndex} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                    {skill}
                                  </span>
                  ))}
                </div>
                            )}
              </div>
                        </div>
                      ))
                    ) : (
                      /* Fallback team members if no team data is available */
                      <>
                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-purple-500/30 hover:scale-105 transition-all duration-300">
                          <div className="text-center space-y-4">
                            <div className="relative">
                              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto flex items-center justify-center text-white text-xl font-bold border-2 border-purple-500/30">
                                {existingProject.creator_profile?.full_name?.charAt(0) || 'C'}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
            </div>
          </div>

                <div>
                              <h5 className="text-lg font-bold text-white">
                                {existingProject.creator_profile?.full_name || 'Team Lead'}
                              </h5>
                              <p className="text-purple-300 text-sm font-medium">
                                Project Lead & Developer
                              </p>
                </div>

                            <div className="flex flex-wrap gap-1 justify-center">
                              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                Solana
                              </span>
                              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                Game Dev
                              </span>
                              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                Web3
                              </span>
              </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-purple-500/30 hover:scale-105 transition-all duration-300">
                          <div className="text-center space-y-4">
                            <div className="relative">
                              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mx-auto flex items-center justify-center text-white text-xl font-bold border-2 border-green-500/30">
                                D
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            </div>
                            
                <div>
                              <h5 className="text-lg font-bold text-white">
                                Frontend Developer
                              </h5>
                              <p className="text-purple-300 text-sm font-medium">
                                UI/UX Designer
                              </p>
                </div>

                            <div className="flex flex-wrap gap-1 justify-center">
                              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                React
                              </span>
                              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                Design
                              </span>
                              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                TypeScript
                              </span>
              </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-purple-500/30 hover:scale-105 transition-all duration-300">
                          <div className="text-center space-y-4">
                            <div className="relative">
                              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mx-auto flex items-center justify-center text-white text-xl font-bold border-2 border-orange-500/30">
                                B
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            </div>
                            
                <div>
                              <h5 className="text-lg font-bold text-white">
                                Blockchain Developer
                              </h5>
                              <p className="text-purple-300 text-sm font-medium">
                                Smart Contract Engineer
                              </p>
                </div>

                            <div className="flex flex-wrap gap-1 justify-center">
                              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                Rust
                              </span>
                              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                Anchor
                              </span>
                              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                Solana
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }



  // Submission form
  return (
    <div className="ml-0 lg:ml-64 p-6 transition-all duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white pixelify-sans mb-2">
              {isEditing ? 'Edit Project' : 'Submit Project'}
            </h1>
            <p className="text-purple-200">
              Provide your hosted game links and project details for judging
            </p>
          </div>
          {isEditing && (
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep > i + 1 
                    ? 'bg-green-500 text-white' 
                    : currentStep === i + 1 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-purple-600 text-purple-300'
                }`}>
                  {currentStep > i + 1 ? '✓' : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`w-16 h-1 mx-4 ${
                    currentStep > i + 1 ? 'bg-green-500' : 'bg-purple-600'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <span className="text-sm text-purple-300">Project Info</span>
            <span className="text-sm text-purple-300">Game Links</span>
            <span className="text-sm text-purple-300">Media & Assets</span>
            <span className="text-sm text-purple-300">Review & Submit</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">
                Project Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                    placeholder="Enter your game name"
                    value={formData.project_name}
                    onChange={(e) => setFormData({...formData, project_name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Category *
                  </label>
                  <select 
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Project Description *
                </label>
                <textarea
                  rows={6}
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="Describe your game, its mechanics, and what makes it unique..."
                  value={formData.project_description}
                  onChange={(e) => setFormData({...formData, project_description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Solana Integration *
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="Explain how your game uses Solana blockchain technology..."
                  value={formData.solana_integration}
                  onChange={(e) => setFormData({...formData, solana_integration: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Tech Stack
                </label>
                <p className="text-purple-400 text-sm mb-3">
                  Enter technologies used in your project, separated by commas
                </p>
                      <input
                  type="text"
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="Unity, Solana, React, TypeScript, Anchor, Godot, Phaser..."
                  value={techStackInput}
                  onChange={(e) => handleTechStackChange(e.target.value)}
                />
                {formData.tech_stack.length > 0 && (
                  <div className="mt-3">
                    <p className="text-purple-300 text-sm mb-2">Technologies ({formData.tech_stack.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.tech_stack.map((tech, index) => (
                        <span key={index} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                          {tech}
                        </span>
                  ))}
                </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">
                Game Links & Hosting
              </h2>

              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-blue-400 mb-3">
                  🌐 Hosting Information
                </h3>
                <p className="text-blue-200 mb-3">
                  Your game should be hosted online and accessible via browser. Popular hosting options include:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-blue-600/20 rounded p-2 text-center">
                    <div className="font-semibold text-blue-300">Vercel</div>
                    <div className="text-blue-400">vercel.app</div>
                </div>
                  <div className="bg-blue-600/20 rounded p-2 text-center">
                    <div className="font-semibold text-blue-300">Netlify</div>
                    <div className="text-blue-400">netlify.app</div>
              </div>
                  <div className="bg-blue-600/20 rounded p-2 text-center">
                    <div className="font-semibold text-blue-300">GitHub Pages</div>
                    <div className="text-blue-400">github.io</div>
                </div>
                  <div className="bg-blue-600/20 rounded p-2 text-center">
                    <div className="font-semibold text-blue-300">Itch.io</div>
                    <div className="text-blue-400">itch.io</div>
              </div>
            </div>
              </div>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                  Game Play URL *
                  </label>
                  <input
                    type="url"
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="https://yourgame.vercel.app/play"
                  value={formData.game_host_url}
                  onChange={(e) => setFormData({...formData, game_host_url: e.target.value})}
                />
                <p className="text-purple-400 text-xs mt-1">
                  Direct link to play your game (this should work in any modern browser)
                </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                  Project Demo URL
                  </label>
                  <input
                    type="url"
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="https://yourgame.vercel.app"
                  value={formData.demo_url}
                  onChange={(e) => setFormData({...formData, demo_url: e.target.value})}
                />
                <p className="text-purple-400 text-xs mt-1">
                  Landing page or project showcase (can be the same as game URL)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  GitHub Repository *
                </label>
                <input
                  type="url"
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="https://github.com/username/your-game"
                  value={formData.github_url}
                  onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                />
                <p className="text-purple-400 text-xs mt-1">
                  Public GitHub repository with your game's source code
                </p>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="text-yellow-400 font-semibold mb-2">⚠️ Important Notes:</h4>
                <ul className="text-yellow-200 text-sm space-y-1">
                  <li>• Your game must be playable directly in a web browser</li>
                  <li>• Ensure all links are publicly accessible (not behind authentication)</li>
                  <li>• Test your game URL in an incognito/private browser window</li>
                  <li>• GitHub repository must be public for judges to review</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">
                Media & Assets
              </h2>

              {/* Banner and Logo Upload */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Game Banner *</h3>
                  <ImageUpload
                    imageType="banner"
                    currentUrl={formData.banner_url}
                    onUpload={(url) => setFormData({...formData, banner_url: url})}
                    onDelete={() => setFormData({...formData, banner_url: ''})}
                    disabled={saving || submitting}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Game Logo *</h3>
                  <ImageUpload
                    imageType="logo"
                    currentUrl={formData.logo_url}
                    onUpload={(url) => setFormData({...formData, logo_url: url})}
                    onDelete={() => setFormData({...formData, logo_url: ''})}
                    disabled={saving || submitting}
                  />
                </div>
              </div>

              {/* Video URL Input */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Demo Video</h3>
                <VideoUrlInput
                  value={formData.video_url}
                  onChange={(url) => setFormData({...formData, video_url: url})}
                  disabled={saving || submitting}
                />
              </div>

              {/* Screenshots Upload */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Game Screenshots *</h3>
                <p className="text-purple-300 text-sm mb-6">
                  Upload at least 3 screenshots showing your game in action. You can upload more to better showcase your game.
                </p>
                
                <div className="space-y-6">
                  {formData.screenshot_urls.map((url, index) => (
                    <div key={index} className="bg-purple-700/30 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-purple-200 font-medium">Screenshot {index + 1}</h4>
                        {formData.screenshot_urls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeScreenshotField(index)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                            disabled={saving || submitting}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <ImageUpload
                        imageType="screenshot"
                        currentUrl={url}
                        onUpload={(uploadedUrl) => updateScreenshotUrl(index, uploadedUrl)}
                        onDelete={() => updateScreenshotUrl(index, '')}
                        disabled={saving || submitting}
                      />
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addScreenshotField}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    disabled={saving || submitting}
                  >
                    <span>+ Add Another Screenshot</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Challenges & Solutions
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="What challenges did you face during development and how did you solve them?"
                  value={formData.challenges}
                  onChange={(e) => setFormData({...formData, challenges: e.target.value})}
                />
              </div>

              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
                <h4 className="text-purple-300 font-semibold mb-2">💡 Tips for Great Visual Assets:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="text-purple-200 font-medium mb-2">Banner & Logo:</h5>
                    <ul className="text-purple-200 space-y-1">
                      <li>• Banner: Use 16:9 ratio (1920x1080 ideal)</li>
                      <li>• Logo: Square format (512x512 recommended)</li>
                      <li>• PNG format with transparent backgrounds preferred</li>
                      <li>• High contrast for readability in catalogues</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-purple-200 font-medium mb-2">Screenshots:</h5>
                    <ul className="text-purple-200 space-y-1">
                      <li>• Show gameplay in action, not menus</li>
                      <li>• Include UI elements and game features</li>
                      <li>• Showcase your Solana integration</li>
                      <li>• Upload to imgur.com or GitHub for hosting</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">
                Review & Submit
              </h2>
              
              <div className="bg-purple-700/30 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Project Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-purple-300 text-sm">Project Name</p>
                    <p className="text-white font-semibold">{formData.project_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Category</p>
                    <p className="text-white font-semibold">{formData.category || 'Not selected'}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Game URL</p>
                    <p className="text-white font-semibold break-all">{formData.game_host_url || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Tech Stack</p>
                    <p className="text-white font-semibold">{formData.tech_stack.length} technologies selected</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Demo Video</p>
                    <p className="text-white font-semibold">{formData.video_url ? '✓ Provided' : 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Screenshots</p>
                    <p className="text-white font-semibold">
                      {formData.screenshot_urls.filter(url => url.trim()).length} uploaded
                    </p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Banner Image</p>
                    <p className="text-white font-semibold">{formData.banner_url ? '✓ Uploaded' : 'Not uploaded'}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Logo Image</p>
                    <p className="text-white font-semibold">{formData.logo_url ? '✓ Uploaded' : 'Not uploaded'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6">
                <h3 className="text-lg font-bold text-yellow-400 mb-3">
                  ⚠️ Before Submitting
                </h3>
                <ul className="space-y-2 text-yellow-200">
                  <li>• Test your game URL in a private browser window to ensure it works</li>
                  <li>• Verify all links are working and publicly accessible</li>
                  <li>• Confirm your GitHub repository is public and contains your code</li>
                  <li>• Check that your demo video clearly shows gameplay and Solana features</li>
                  <li>• Ensure your banner and logo images have been uploaded and display correctly</li>
                  <li>• Verify all screenshots have been uploaded and showcase your game properly</li>
                  <li>• Ensure your Solana integration is properly documented in your README</li>
                  <li>• Confirm all uploaded images meet the recommended dimensions and file size limits</li>
                </ul>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  className="text-blue-500 bg-purple-900 border-purple-500"
                />
                <label htmlFor="terms" className="text-purple-200">
                  I confirm that this project was built during the hackathon period and complies with all rules
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-purple-500/30">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="bg-purple-700 hover:bg-purple-600 disabled:bg-purple-800 disabled:text-purple-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Previous
            </button>
            
            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
            )}

            {currentStep === totalSteps && (
              <button
                onClick={handleSubmitProject}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                {submitting ? 'Submitting...' : '🚀 Submit Project'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // Rest of the component - submission form
  return (
    <div className="ml-0 lg:ml-64 p-6 transition-all duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white pixelify-sans mb-2">
            {isEditing ? 'Edit Project' : (existingProject ? 'Update Project' : 'Create Project')}
          </h1>
          <p className="text-purple-200">
            {existingProject ? 'Update your project details' : 'Create a new project submission'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-200">
            Project form interface. For now you can test the save/submit functionality.
          </p>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handleSubmitProject}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Project'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 