'use client'

import { useState, useEffect } from 'react'
import { ApiClient } from '@/lib/apiClient'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Filter, Star, Users, Calendar, Play, Github, ExternalLink, Heart, Clock, Trophy, Zap, ArrowRight, Tag } from 'lucide-react'

interface Project {
  id: string
  project_name: string
  project_description: string
  category: string
  tech_stack: string[]
  banner_url: string
  logo_url: string
  screenshot_urls: string[]
  game_host_url: string
  github_url: string
  video_url: string
  created_at: string
  status?: string
  hackathon_edition?: string
  team?: {
    id: string
    name: string
  }
  creator_profile?: {
    full_name: string
    avatar_url: string | null
  }
}

interface Team {
  id: string
  name: string
  description: string
  member_count: number
  avatar_url?: string
  skills: string[]
  github_url?: string
  discord_server?: string
  website_url?: string
}

export default function CataloguePage() {
  const [activeTab, setActiveTab] = useState<'games' | 'teams' | 'supergamejam2024'>('games')
  const [projects, setProjects] = useState<Project[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [superGameJam2024Projects, setSuperGameJam2024Projects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [jamLoading, setJamLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [featuredGame, setFeaturedGame] = useState<Project | null>(null)

  const categories = [
    'all',
    'Action/Adventure',
    'RPG/MMORPG', 
    'Strategy',
    'Puzzle',
    'Racing',
    'Sports',
    'Simulation',
    'Casual/Mobile',
    'Educational'
  ]

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (activeTab === 'supergamejam2024') {
      loadSuperGameJam2024Projects()
    }
  }, [activeTab])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load real projects from the projects table (not project_catalogue)
      const projectsResponse = await ApiClient.get('/api/projects?view=catalogue')
      let realProjects: Project[] = []
      
      if (projectsResponse.ok) {
        const data = await projectsResponse.json()
        realProjects = data.projects || []
      }

      // Load real teams
      const teamsResponse = await ApiClient.get('/api/teams?mode=all')
      let realTeams: Team[] = []
      
      if (teamsResponse.ok) {
        const data = await teamsResponse.json()
        realTeams = data.teams || []
      }

      setProjects(realProjects)
      setTeams(realTeams)
      
      if (realProjects.length > 0) {
        // Prioritize featured/approved projects for hero
        const featuredProjects = realProjects.filter(p => p.status === 'featured' || p.status === 'approved')
        const projectsPool = featuredProjects.length > 0 ? featuredProjects : realProjects
        
        // Advanced cycling system - ensures different game on each refresh
        const now = Date.now()
        const sessionRandom = Math.random() * 10000
        const cycleBase = Math.floor((now / 1000) / 60) // Changes every minute
        const seed = (cycleBase + sessionRandom + Math.random() * 1000) % projectsPool.length
        const randomIndex = Math.floor(seed)
        
        setFeaturedGame(projectsPool[randomIndex])
      }
      
    } catch (error) {
      console.error('Error loading catalogue data:', error)
      setProjects([])
      setTeams([])
      setFeaturedGame(null)
    } finally {
      setLoading(false)
    }
  }

  const loadSuperGameJam2024Projects = async () => {
    try {
      setJamLoading(true)
      
      // Load from speedrun-2024-games API endpoint
      const response = await fetch('/api/speedrun-2024-games')
      if (response.ok) {
        const data = await response.json()
        // Convert speedrun games to Project format for display
        const convertedProjects = (data.games || []).map((game: any) => ({
          id: game.id,
          project_name: game.name,
          project_description: game.description,
          category: game.category,
          tech_stack: game.tech_stack || [],
          banner_url: game.banner_url || game.thumbnail_url,
          logo_url: game.thumbnail_url,
          screenshot_urls: game.screenshot_urls || [],
          game_host_url: game.itch_url,
          github_url: game.github_url || '',
          video_url: game.demo_url || '',
          created_at: game.published_date || new Date().toISOString(),
          hackathon_edition: 'SGJ2024',
          creator_profile: { 
            full_name: game.developer_name, 
            avatar_url: null 
          }
        }))
        setSuperGameJam2024Projects(convertedProjects)
      }
      
    } catch (error) {
      console.error('Error loading Super Game Jam 2024 projects:', error)
      setSuperGameJam2024Projects([])
    } finally {
      setJamLoading(false)
    }
  }

  const filteredProjects = projects
    .filter(project => {
      // Exclude Super Game Jam 2024 projects from the general games tab
      const isNotSuperGameJam2024 = project.hackathon_edition !== 'SGJ2024'
      const matchesSearch = project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.project_description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory
      return isNotSuperGameJam2024 && matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'name':
          return a.project_name.localeCompare(b.project_name)
        default:
          return 0
      }
    })

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredSuperGameJam2024Projects = superGameJam2024Projects
    .filter(project => {
      const matchesSearch = project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.project_description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'name':
          return a.project_name.localeCompare(b.project_name)
        default:
          return 0
      }
    })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Featured Game Hero Section - Steam Style */}
      {featuredGame && activeTab === 'games' && (
        <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
          {/* Background Banner with Overlay */}
          <div className="absolute inset-0">
            <Image
              src={featuredGame.banner_url || '/assets/prize/1st-prize.svg'}
              alt={featuredGame.project_name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative h-full flex items-end">
            <div className="container mx-auto px-4 md:px-6 pb-8 md:pb-16">
              <div className="max-w-2xl">
                {/* Featured Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-full">
                    <span className="text-white font-bold text-sm">⭐ FEATURED</span>
                  </div>
                  {featuredGame.status && (
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      featuredGame.status === 'featured' 
                        ? 'bg-purple-500/20 border border-purple-400/50 text-purple-400'
                        : featuredGame.status === 'approved'
                        ? 'bg-green-500/20 border border-green-400/50 text-green-400'
                        : 'bg-blue-500/20 border border-blue-400/50 text-blue-400'
                    }`}>
                      {featuredGame.status === 'featured' ? '🌟 Featured'
                       : featuredGame.status === 'approved' ? '✅ Approved'
                       : '🎮 Available'}
                    </div>
                  )}
                </div>

                {/* Game Title */}
                <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-4 font-pixelify leading-tight drop-shadow-2xl">
                  {featuredGame.project_name}
                </h1>

                {/* Game Description */}
                <p className="text-lg md:text-xl text-gray-200 mb-6 leading-relaxed max-w-xl">
                  {featuredGame.project_description}
                </p>

                {/* Game Meta */}
                <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span className="bg-purple-600/30 px-3 py-1 rounded border border-purple-400/30">
                      {featuredGame.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(featuredGame.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {featuredGame.team && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Team: {featuredGame.team.name}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {featuredGame.game_host_url ? (
                    <a
                      href={featuredGame.game_host_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      PLAY NOW
                    </a>
                  ) : (
                    <div className="bg-gray-600 text-gray-400 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 cursor-not-allowed">
                      <Play className="w-6 h-6" />
                      COMING SOON
                    </div>
                  )}
                  
                  <Link 
                    href={`/projects/${featuredGame.id}`}
                    className="group bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    VIEW DETAILS
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Store Navigation */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-6 py-4">
          {/* Navigation Tabs */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <button
              onClick={() => setActiveTab('games')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all text-sm md:text-base flex items-center gap-2 ${
                activeTab === 'games'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <Play className="w-4 h-4" />
              Games ({filteredProjects.length})
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all text-sm md:text-base flex items-center gap-2 ${
                activeTab === 'teams'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Teams ({filteredTeams.length})
            </button>
            <button
              onClick={() => setActiveTab('supergamejam2024')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all text-sm md:text-base flex items-center gap-2 ${
                activeTab === 'supergamejam2024'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Game Jam 2024 (26)
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search games, teams, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:bg-slate-800/70 transition-all text-sm md:text-base"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:bg-slate-800/70 transition-all text-sm md:text-base min-w-[160px]"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="bg-slate-800">
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:bg-slate-800/70 transition-all text-sm md:text-base min-w-[140px]"
              >
                <option value="newest" className="bg-slate-800">Newest First</option>
                <option value="name" className="bg-slate-800">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Content Based on Active Tab */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-purple-500 mx-auto mb-6"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 animate-pulse"></div>
              </div>
              <p className="text-slate-400 text-lg">Loading amazing games...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Games Tab */}
            {activeTab === 'games' && (
              <div>
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-6">🎮</div>
                    <h3 className="text-2xl font-bold text-white mb-4">No Games Found</h3>
                    <p className="text-slate-400 text-lg">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <>
                    {/* Section Header */}
                    <div className="mb-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Zap className="w-8 h-8 text-purple-500" />
                        All Games
                      </h2>
                      <p className="text-slate-400">Discover incredible games built by our community</p>
                    </div>

                    {/* Games Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredProjects.map((project) => (
                        <div key={project.id} className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10 overflow-hidden">
                          {/* Game Image */}
                          <Link href={`/projects/${project.id}`} className="block relative">
                            <div className="aspect-[16/9] relative overflow-hidden">
                              <Image
                                src={project.banner_url || '/assets/prize/1st-prize.svg'}
                                alt={project.project_name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              
                              {/* Status Badge */}
                              {project.status && (
                                <div className="absolute top-3 right-3">
                                  <div className={`px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                                    project.status === 'featured' 
                                      ? 'bg-purple-500/80 text-white'
                                      : project.status === 'approved'
                                      ? 'bg-green-500/80 text-white'
                                      : 'bg-blue-500/80 text-white'
                                  }`}>
                                    {project.status === 'featured' ? '⭐ Featured'
                                     : project.status === 'approved' ? '✅ Approved'
                                     : '🎮 Available'}
                                  </div>
                                </div>
                              )}

                              {/* Play Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-4">
                                  <Play className="w-8 h-8 text-white" fill="white" />
                                </div>
                              </div>
                            </div>
                          </Link>

                          {/* Game Info */}
                          <div className="p-6">
                            <Link href={`/projects/${project.id}`} className="block group-hover:text-purple-300 transition-colors">
                              <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{project.project_name}</h3>
                            </Link>
                            <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.project_description}</p>
                            
                            {/* Category & Meta */}
                            <div className="flex items-center justify-between mb-4">
                              <span className="bg-purple-600/20 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-full text-xs font-medium">
                                {project.category}
                              </span>
                              <span className="text-slate-500 text-xs">
                                {new Date(project.created_at).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Tech Stack */}
                            <div className="flex flex-wrap gap-1 mb-4">
                              {(project.tech_stack || []).slice(0, 3).map((tech, idx) => (
                                <span key={idx} className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded text-xs">
                                  {tech}
                                </span>
                              ))}
                              {(project.tech_stack || []).length > 3 && (
                                <span className="bg-slate-700/30 text-slate-400 px-2 py-1 rounded text-xs">
                                  +{(project.tech_stack || []).length - 3}
                                </span>
                              )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <Link 
                                href={`/projects/${project.id}`} 
                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-center transition-all text-sm font-medium flex items-center justify-center gap-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                View Game
                              </Link>
                              {project.game_host_url ? (
                                <a 
                                  href={project.game_host_url} 
                                  target="_blank" 
                                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                  <Play className="w-4 h-4" />
                                </a>
                              ) : (
                                <div className="px-3 py-2 bg-slate-700 text-slate-400 rounded-lg cursor-not-allowed">
                                  <Play className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Teams Tab */}
            {activeTab === 'teams' && (
              <div>
                {filteredTeams.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-6">👥</div>
                    <h3 className="text-2xl font-bold text-white mb-4">No Teams Found</h3>
                    <p className="text-slate-400 text-lg">Try adjusting your search</p>
                  </div>
                ) : (
                  <>
                    {/* Section Header */}
                    <div className="mb-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-500" />
                        Developer Teams
                      </h2>
                      <p className="text-slate-400">Connect with talented teams building the future</p>
                    </div>

                    {/* Teams Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredTeams.map((team) => (
                        <div key={team.id} className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 p-6">
                          <div className="flex items-start gap-4 mb-4">
                            {team.avatar_url ? (
                              <Image
                                src={team.avatar_url}
                                alt={team.name}
                                width={48}
                                height={48}
                                className="rounded-lg"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">{team.name}</h3>
                              <p className="text-slate-400 text-sm">{team.member_count} members</p>
                            </div>
                          </div>
                          
                          <p className="text-slate-300 text-sm mb-4 line-clamp-3">{team.description}</p>
                          
                          {/* Skills */}
                          <div className="flex flex-wrap gap-1 mb-4">
                            {team.skills.slice(0, 4).map((skill, idx) => (
                              <span key={idx} className="bg-blue-600/20 border border-blue-500/30 text-blue-300 px-2 py-1 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                            {team.skills.length > 4 && (
                              <span className="bg-slate-700/30 text-slate-400 px-2 py-1 rounded text-xs">
                                +{team.skills.length - 4}
                              </span>
                            )}
                          </div>

                          {/* Team Links */}
                          <div className="flex gap-2">
                            <div className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-center transition-all text-sm font-medium flex items-center justify-center gap-2">
                              <Users className="w-4 h-4" />
                              View Team
                            </div>
                            {team.github_url && (
                              <a 
                                href={team.github_url} 
                                target="_blank" 
                                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                              >
                                <Github className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Super Game Jam 2024 Tab */}
            {activeTab === 'supergamejam2024' && (
              <div>
                {jamLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-yellow-500 mx-auto mb-6"></div>
                      <p className="text-slate-400 text-lg">Loading Game Jam 2024 projects...</p>
                    </div>
                  </div>
                ) : filteredSuperGameJam2024Projects.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-6">🏆</div>
                    <h3 className="text-2xl font-bold text-white mb-4">No Game Jam 2024 Projects Found</h3>
                    <p className="text-slate-400 text-lg">Historical projects from the Solana Game Jam 2024 will appear here</p>
                  </div>
                ) : (
                  <>
                    {/* Section Header */}
                    <div className="mb-8 text-center">
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                        <Trophy className="w-10 h-10 text-yellow-500" />
                        Solana Game Jam 2024
                      </h2>
                      <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Discover the incredible games built during the Solana Game Jam 2024 hackathon - 
                        showcasing innovation, creativity, and the power of Web3 gaming
                      </p>
                    </div>
                    
                    {/* Games Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredSuperGameJam2024Projects.map((project) => (
                        <div key={project.id} className="group bg-gradient-to-br from-yellow-900/20 via-slate-800/50 to-slate-900/50 rounded-2xl border border-yellow-500/30 hover:border-yellow-400/60 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/10 overflow-hidden">
                          {/* Game Image */}
                          <div className="relative">
                            <div className="aspect-[16/9] relative overflow-hidden">
                              <Image
                                src={project.banner_url || '/assets/prize/1st-prize.svg'}
                                alt={project.project_name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              
                              {/* Game Jam Badge */}
                              <div className="absolute top-3 left-3">
                                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                                  🏆 Game Jam 2024
                                </div>
                              </div>

                              {/* Play Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/30 rounded-full p-4">
                                  <Play className="w-8 h-8 text-yellow-400" fill="currentColor" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Game Info */}
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-yellow-300 transition-colors">
                              {project.project_name}
                            </h3>
                            <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.project_description}</p>
                            
                            {/* Category */}
                            <div className="mb-4">
                              <span className="bg-yellow-600/20 border border-yellow-500/30 text-yellow-300 px-3 py-1 rounded-full text-xs font-medium">
                                {project.category}
                              </span>
                            </div>

                            {/* Tech Stack */}
                            <div className="flex flex-wrap gap-1 mb-4">
                              {(project.tech_stack || []).slice(0, 3).map((tech, idx) => (
                                <span key={idx} className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded text-xs">
                                  {tech}
                                </span>
                              ))}
                              {(project.tech_stack || []).length > 3 && (
                                <span className="bg-slate-700/30 text-slate-400 px-2 py-1 rounded text-xs">
                                  +{(project.tech_stack || []).length - 3}
                                </span>
                              )}
                            </div>
                            
                            {/* Creator */}
                            {project.creator_profile && (
                              <div className="mb-4 pb-4 border-b border-slate-700/50">
                                <p className="text-slate-400 text-xs">
                                  By <span className="text-yellow-400 font-medium">{project.creator_profile.full_name}</span>
                                </p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              {project.game_host_url ? (
                                <a 
                                  href={project.game_host_url} 
                                  target="_blank" 
                                  className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg text-center transition-all text-sm font-medium flex items-center justify-center gap-2"
                                >
                                  <Play className="w-4 h-4" />
                                  Play Game
                                </a>
                              ) : (
                                <div className="flex-1 bg-slate-700 text-slate-400 px-4 py-2 rounded-lg text-center text-sm font-medium cursor-not-allowed">
                                  Coming Soon
                                </div>
                              )}
                              
                              {project.github_url && (
                                <a 
                                  href={project.github_url} 
                                  target="_blank" 
                                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                                >
                                  <Github className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 