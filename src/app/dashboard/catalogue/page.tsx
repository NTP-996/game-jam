'use client'

import { useState, useEffect } from 'react'
import { ApiClient } from '@/lib/apiClient'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Filter, Star, Users, Calendar, Play, Github, ExternalLink } from 'lucide-react'

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

// Speedrun 2024 game interface (from database)
interface Speedrun2024Game {
  id: string
  name: string
  description: string
  developer_name: string
  itch_url: string
  github_url?: string
  demo_url?: string
  thumbnail_url: string
  banner_url?: string
  screenshot_urls: string[]
  tech_stack: string[]
  category?: string
  tags: string[]
  published_date?: string
  downloads_count: number
  rating: number
  rating_count: number
  solana_features: string[]
  is_featured: boolean
  display_order: number
}

// Production version - only real submissions, no mock data

// Note: Speedrun 2024 games are now loaded from the API instead of hardcoded data

export default function CataloguePage() {
  const [activeTab, setActiveTab] = useState<'games' | 'teams' | 'speedrun2024'>('games')
  const [projects, setProjects] = useState<Project[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [speedrun2024Games, setSpeedrun2024Games] = useState<Speedrun2024Game[]>([])
  const [loading, setLoading] = useState(true)
  const [speedrunLoading, setSpeedrunLoading] = useState(false)
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
    if (activeTab === 'speedrun2024' && speedrun2024Games.length === 0) {
      loadSpeedrun2024Games()
    }
  }, [activeTab])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load real projects
      const projectsResponse = await ApiClient.get('/api/projects?view=all')
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

      // Production: Use only real data
      setProjects(realProjects)
      setTeams(realTeams)
      
      // Randomly select a featured game from real projects
      if (realProjects.length > 0) {
        const randomIndex = Math.floor(Math.random() * realProjects.length)
        setFeaturedGame(realProjects[randomIndex])
      } else {
        // If no real projects yet, try to get a random Speedrun 2024 game for featured display
        try {
          const speedrunResponse = await fetch('/api/speedrun-2024-games/random')
          if (speedrunResponse.ok) {
            const speedrunData = await speedrunResponse.json()
            if (speedrunData.game) {
              // Convert Speedrun 2024 game to Project format for featured display
              const convertedGame: Project = {
                id: speedrunData.game.id,
                project_name: speedrunData.game.name,
                project_description: speedrunData.game.description,
                category: speedrunData.game.category || 'Historical',
                tech_stack: speedrunData.game.tech_stack || [],
                banner_url: speedrunData.game.banner_url || speedrunData.game.thumbnail_url,
                logo_url: speedrunData.game.thumbnail_url,
                screenshot_urls: speedrunData.game.screenshot_urls || [],
                game_host_url: speedrunData.game.itch_url,
                github_url: speedrunData.game.github_url || '',
                video_url: speedrunData.game.video_url || '',
                created_at: speedrunData.game.published_date || new Date().toISOString(),
                creator_profile: { full_name: speedrunData.game.developer_name, avatar_url: null }
              }
              setFeaturedGame(convertedGame)
            }
          }
        } catch (speedrunError) {
          console.log('Could not load Speedrun 2024 game for featured display')
        }
      }
      
    } catch (error) {
      console.error('Error loading catalogue data:', error)
      // If API fails, set empty arrays
      setProjects([])
      setTeams([])
      setFeaturedGame(null)
    } finally {
      setLoading(false)
    }
  }

  const loadSpeedrun2024Games = async () => {
    try {
      setSpeedrunLoading(true)
      
      const response = await fetch('/api/speedrun-2024-games')
      if (!response.ok) {
        throw new Error('Failed to fetch Speedrun 2024 games')
      }
      
      const data = await response.json()
      setSpeedrun2024Games(data.games || [])
      
    } catch (error) {
      console.error('Error loading Speedrun 2024 games:', error)
      // You could add a fallback to mock data here if needed
    } finally {
      setSpeedrunLoading(false)
    }
  }


  const filteredProjects = projects
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
        case 'featured':
          return 0
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

  const filteredSpeedrun2024Games = speedrun2024Games
    .filter(game => {
      const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           game.developer_name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.published_date || '').getTime() - new Date(a.published_date || '').getTime()
        case 'featured':
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)
        case 'rating':
          return b.rating - a.rating
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return a.display_order - b.display_order
      }
    })

  if (loading) {
    return (
      <div className="ml-0 lg:ml-64 p-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-purple-200 mt-4">Loading catalogue...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ml-0 lg:ml-64 p-6 transition-all duration-300 min-h-screen bg-gradient-to-b from-purple-900/20 via-transparent to-blue-900/20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white pixelify-sans mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Game Catalogue
          </h1>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Discover amazing games and talented teams from the Solana Game Jam 2025, plus historical entries from previous hackathons
          </p>
        </div>

        {/* Featured Game Hero */}
        {featuredGame && (
          <div className="relative aspect-[21/9] max-h-[50vh] overflow-hidden rounded-3xl mb-8">
            {(() => {
              return (
                <>
                  <Image
                    src={featuredGame.banner_url}
                    alt={featuredGame.project_name}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-end gap-6">
                      {featuredGame.logo_url && (
                        <Image
                          src={featuredGame.logo_url}
                          alt="Game logo"
                          width={120}
                          height={120}
                          className="rounded-2xl border-4 border-white/20"
                        />
                      )}
                      <div className="flex-1">
                                                 <div className="flex items-center gap-3 mb-2">
                           <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-sm font-bold">
                             🎮 GAME SPOTLIGHT
                           </span>
                         </div>
                        <h2 className="text-4xl font-bold text-white pixelify-sans mb-2">
                          {featuredGame.project_name}
                        </h2>
                        <p className="text-purple-200 mb-4 max-w-2xl">
                          {featuredGame.project_description}
                        </p>
                        <div className="flex gap-4">
                          <a
                            href={featuredGame.game_host_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
                          >
                            <Play className="w-5 h-5" />
                            Play Now
                          </a>
                          <Link
                            href={`/dashboard/project/${featuredGame.id}`}
                            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition-colors border border-white/20"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
            <button
              onClick={() => setActiveTab('games')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'games'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              🎮 Games ({filteredProjects.length})
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'teams'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              👥 Teams ({filteredTeams.length})
            </button>
            <button
              onClick={() => setActiveTab('speedrun2024')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'speedrun2024'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              🏆 Speedrun 2024 ({speedrun2024Games.length})
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-purple-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
              />
            </div>

            {activeTab === 'games' && (
              <>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-gray-800">
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="newest" className="bg-gray-800">Newest First</option>
                  <option value="featured" className="bg-gray-800">Featured First</option>
                  <option value="name" className="bg-gray-800">Name A-Z</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* Games Grid */}
        {activeTab === 'games' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:scale-105 hover:border-purple-500/50 transition-all duration-300 group">
                {/* Game Image */}
                <div className="relative aspect-video bg-gray-800">
                                     <Image
                     src={(project.screenshot_urls && project.screenshot_urls[0]) || project.banner_url || '/api/placeholder/400/225'}
                     alt={project.project_name}
                     fill
                     className="object-cover group-hover:scale-110 transition-transform duration-500"
                   />
                  
                  <div className="absolute top-3 right-3 bg-purple-600/30 text-purple-300 px-2 py-1 rounded-lg text-xs font-medium">
                    {project.category}
                  </div>
                </div>

                {/* Game Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white pixelify-sans mb-2 line-clamp-1">
                    {project.project_name}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {project.project_description}
                  </p>

                  {/* Team/Creator */}
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 text-sm">
                      {project.team?.name || project.creator_profile?.full_name || 'Solo Developer'}
                    </span>
                  </div>

                                     {/* Tech Stack */}
                   <div className="flex flex-wrap gap-1 mb-4">
                     {(project.tech_stack || []).slice(0, 3).map((tech, index) => (
                       <span key={index} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                         {tech}
                       </span>
                     ))}
                     {(project.tech_stack || []).length > 3 && (
                       <span className="text-blue-400 text-xs">+{(project.tech_stack || []).length - 3}</span>
                     )}
                   </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <a
                      href={project.game_host_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                    >
                      Play
                    </a>
                    <Link
                      href={`/dashboard/project/${project.id}`}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Speedrun 2024 Games Grid */}
        {activeTab === 'speedrun2024' && (
          <div className="space-y-6">
            {/* Header for Speedrun 2024 */}
            <div className="text-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6">
              <h2 className="text-3xl font-bold text-white pixelify-sans mb-2">
                🏆 Solana Speedrun 3 (2024)
              </h2>
              <p className="text-yellow-200 mb-4">
                Games from the previous Solana hackathon showcasing innovation and creativity
              </p>
              <a
                href="https://itch.io/jam/solana-speedrun-3/entries"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
              >
                View on itch.io
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {speedrunLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
                <p className="text-yellow-200 mt-4">Loading Speedrun 2024 games...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSpeedrun2024Games.map((game) => (
                  <div key={game.id} className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl overflow-hidden hover:scale-105 hover:border-yellow-400/50 transition-all duration-300 group">
                    {/* Game Image */}
                    <div className="relative aspect-video bg-gray-800">
                      <Image
                        src={game.thumbnail_url || game.banner_url || '/api/placeholder/400/225'}
                        alt={game.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/api/placeholder/400/225';
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-lg text-xs font-bold">
                          🏆 Speedrun 2024
                        </span>
                      </div>
                      {game.category && (
                        <div className="absolute top-3 right-3 bg-purple-600/30 text-purple-300 px-2 py-1 rounded-lg text-xs font-medium">
                          {game.category}
                        </div>
                      )}
                      {game.is_featured && (
                        <div className="absolute bottom-3 left-3">
                          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            Featured
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Game Info */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-white pixelify-sans line-clamp-1">
                          {game.name}
                        </h3>
                        <p className="text-yellow-300 text-sm">by {game.developer_name}</p>
                      </div>
                      
                      <p className="text-yellow-200 text-sm line-clamp-2">
                        {game.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-yellow-300">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          {game.rating.toFixed(1)} ({game.rating_count})
                        </span>
                        <span className="flex items-center gap-1">
                          📥 {game.downloads_count}
                        </span>
                      </div>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-1">
                        {game.tech_stack.slice(0, 3).map((tech, idx) => (
                          <span key={idx} className="bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded text-xs">
                            {tech}
                          </span>
                        ))}
                        {game.tech_stack.length > 3 && (
                          <span className="text-yellow-400 text-xs">+{game.tech_stack.length - 3}</span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <a
                          href={game.itch_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                        >
                          View on itch.io
                        </a>
                        {game.github_url && (
                          <a
                            href={game.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Teams Grid */}
        {activeTab === 'teams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <div key={team.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-purple-500/50 transition-all duration-300 group">
                {/* Team Avatar */}
                <div className="flex items-center gap-4 mb-4">
                  {team.avatar_url ? (
                    <Image
                      src={team.avatar_url}
                      alt={team.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/30"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {team.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white pixelify-sans">
                      {team.name}
                    </h3>
                    <p className="text-purple-300 text-sm flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {team.member_count} members
                    </p>
                  </div>
                </div>

                {/* Team Description */}
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {team.description}
                </p>

                                 {/* Skills */}
                 <div className="flex flex-wrap gap-2 mb-4">
                   {(team.skills || []).slice(0, 4).map((skill, index) => (
                     <span key={index} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                       {skill}
                     </span>
                   ))}
                   {(team.skills || []).length > 4 && (
                     <span className="text-purple-400 text-xs">+{(team.skills || []).length - 4}</span>
                   )}
                 </div>

                {/* Social Links */}
                <div className="flex gap-2">
                  {team.github_url && (
                    <a
                      href={team.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                      title="GitHub"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {team.discord_server && (
                    <a
                      href={team.discord_server}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors"
                      title="Discord"
                    >
                      💬
                    </a>
                  )}
                  {team.website_url && (
                    <a
                      href={team.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                      title="Website"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <Link
                    href={`/dashboard/team/${team.id}`}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                  >
                    View Team
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty States */}
        {activeTab === 'games' && filteredProjects.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {searchTerm || selectedCategory !== 'all' ? 'No games found' : 'No games submitted yet'}
            </h3>
            <p className="text-purple-300 mb-6">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Be the first to submit your game to the Solana Game Jam 2025!'
              }
            </p>
            {(!searchTerm && selectedCategory === 'all') && (
              <Link
                href="/dashboard/project"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
              >
                🚀 Submit Your Game
              </Link>
            )}
          </div>
        )}

        {activeTab === 'teams' && filteredTeams.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {searchTerm ? 'No teams found' : 'No teams formed yet'}
            </h3>
            <p className="text-purple-300 mb-6">
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : 'Create a team or join forces with other developers!'
              }
            </p>
            {!searchTerm && (
              <Link
                href="/dashboard/team"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
              >
                👥 Create Team
              </Link>
            )}
          </div>
        )}

        {activeTab === 'speedrun2024' && !speedrunLoading && filteredSpeedrun2024Games.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Speedrun 2024 games found</h3>
            <p className="text-yellow-300 mb-4">
              {speedrun2024Games.length === 0 
                ? "Games are being loaded from the database. Please check back soon!"
                : "Try adjusting your search or filter criteria"
              }
            </p>
            <a
              href="https://itch.io/jam/solana-speedrun-3/entries"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
            >
              View on itch.io
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

      </div>
    </div>
  )
} 