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
        const randomIndex = Math.floor(Math.random() * realProjects.length)
        setFeaturedGame(realProjects[randomIndex])
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 pb-20 lg:pb-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/90 to-blue-900/90 border-b border-purple-500/30">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-16">
          <div className="relative z-10">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-2 md:mb-4 font-pixelify tracking-wider break-words">
              Game Catalogue
            </h1>
            <p className="text-sm md:text-lg lg:text-xl text-purple-200 max-w-2xl">
              Discover amazing games, teams, and projects from our hackathons
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6 md:mb-8">
          <button
            onClick={() => setActiveTab('games')}
            className={`px-4 py-3 rounded-lg font-semibold transition-all text-sm md:text-base ${
              activeTab === 'games'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50 hover:text-white'
            }`}
          >
            🎮 Games ({filteredProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-3 rounded-lg font-semibold transition-all text-sm md:text-base ${
              activeTab === 'teams'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50 hover:text-white'
            }`}
          >
            👥 Teams ({filteredTeams.length})
          </button>
          <button
            onClick={() => setActiveTab('supergamejam2024')}
            className={`px-4 py-3 rounded-lg font-semibold transition-all text-sm md:text-base ${
              activeTab === 'supergamejam2024'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50 hover:text-white'
            }`}
          >
            🏆 Game Jam 2024 (26)
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
            <input
              type="text"
              placeholder="Search games, teams, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-purple-800/50 border border-purple-500/50 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
            />
          </div>
          
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-purple-800/50 border border-purple-500/50 rounded-lg text-white focus:outline-none focus:border-purple-400"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-purple-800">
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-purple-800/50 border border-purple-500/50 rounded-lg text-white focus:outline-none focus:border-purple-400"
            >
              <option value="newest" className="bg-purple-800">Newest First</option>
              <option value="name" className="bg-purple-800">Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Content Based on Active Tab */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-purple-300">Loading catalogue...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Games Tab */}
            {activeTab === 'games' && (
              <div>
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🎮</div>
                    <h3 className="text-2xl font-bold text-white mb-4">No Games Found</h3>
                    <p className="text-purple-300">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                      <div key={project.id} className="bg-purple-800/30 rounded-lg border border-purple-500/30 hover:border-purple-400/50 transition-all hover:scale-105">
                        <div className="aspect-square bg-purple-900/20 rounded-t-lg flex items-center justify-center p-4">
                          <Image
                            src={project.banner_url || '/assets/prize/1st-prize.svg'}
                            alt={project.project_name}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            quality={90}
                            priority={false}
                          />
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-white mb-2">{project.project_name}</h3>
                          <p className="text-purple-200 text-sm mb-4 line-clamp-3">{project.project_description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.tech_stack.slice(0, 3).map((tech, idx) => (
                              <span key={idx} className="px-2 py-1 bg-purple-600/50 text-purple-200 text-xs rounded">
                                {tech}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex gap-2">
                            <Link href={project.game_host_url} target="_blank" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-center transition-colors">
                              <Play size={16} className="inline mr-2" />
                              Play
                            </Link>
                            <Link href={project.github_url} target="_blank" className="px-4 py-2 bg-purple-800/50 hover:bg-purple-700/50 text-purple-200 hover:text-white rounded-lg transition-colors">
                              <Github size={16} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Teams Tab */}
            {activeTab === 'teams' && (
              <div>
                {filteredTeams.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-2xl font-bold text-white mb-4">No Teams Found</h3>
                    <p className="text-purple-300">Try adjusting your search</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeams.map((team) => (
                      <div key={team.id} className="bg-purple-800/30 rounded-lg border border-purple-500/30 p-6 hover:border-purple-400/50 transition-all">
                        <h3 className="text-xl font-bold text-white mb-2">{team.name}</h3>
                        <p className="text-purple-200 text-sm mb-4">{team.description}</p>
                        <div className="flex items-center gap-4 text-sm text-purple-300">
                          <span><Users size={16} className="inline mr-1" />{team.member_count} members</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Super Game Jam 2024 Tab */}
            {activeTab === 'supergamejam2024' && (
              <div>
                {jamLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                      <p className="text-purple-300">Loading Game Jam 2024 projects...</p>
                    </div>
                  </div>
                ) : filteredSuperGameJam2024Projects.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🏆</div>
                                         <h3 className="text-2xl font-bold text-white mb-4">No Game Jam 2024 Projects Found</h3>
                     <p className="text-purple-300">Historical projects from the Solana Game Jam 2024 will appear here</p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-8 text-center">
                                             <h2 className="text-3xl font-bold text-white mb-4 font-pixelify">🏆 Solana Game Jam 2024 Projects</h2>
                       <p className="text-purple-200">Discover the amazing games built during the Solana Game Jam 2024 hackathon featuring innovation and creativity</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredSuperGameJam2024Projects.map((project) => (
                        <div key={project.id} className="bg-gradient-to-br from-purple-800/40 to-blue-800/40 rounded-lg border border-purple-500/30 hover:border-purple-400/50 transition-all hover:scale-105 hover:shadow-xl">
                          <div className="aspect-square bg-purple-900/20 rounded-t-lg flex items-center justify-center p-4 relative">
                            <Image
                              src={project.banner_url || '/assets/prize/1st-prize.svg'}
                              alt={project.project_name}
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              quality={90}
                              priority={false}
                            />
                            <div className="absolute top-2 right-2 bg-yellow-500 text-purple-900 px-2 py-1 rounded text-xs font-bold">
                              Game Jam 2024
                            </div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-2">{project.project_name}</h3>
                            <p className="text-purple-200 text-sm mb-4 line-clamp-3">{project.project_description}</p>
                            
                            <div className="mb-4">
                              <span className="inline-block px-3 py-1 bg-purple-600/50 text-purple-200 text-xs rounded-full">
                                {project.category}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              {project.tech_stack.slice(0, 4).map((tech, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-600/50 text-blue-200 text-xs rounded">
                                  {tech}
                                </span>
                              ))}
                            </div>
                            
                            <div className="flex gap-2">
                              <Link 
                                href={project.game_host_url} 
                                target="_blank" 
                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-center transition-all transform hover:scale-105"
                              >
                                <Play size={16} className="inline mr-2" />
                                Play Game
                              </Link>
                              <Link 
                                href={project.github_url} 
                                target="_blank" 
                                className="px-4 py-2 bg-purple-800/50 hover:bg-purple-700/50 text-purple-200 hover:text-white rounded-lg transition-colors"
                              >
                                <Github size={16} />
                              </Link>
                              {project.video_url && (
                                <Link 
                                  href={project.video_url} 
                                  target="_blank" 
                                  className="px-4 py-2 bg-purple-800/50 hover:bg-purple-700/50 text-purple-200 hover:text-white rounded-lg transition-colors"
                                >
                                  <ExternalLink size={16} />
                                </Link>
                              )}
                            </div>
                            
                            {project.creator_profile && (
                              <div className="mt-4 pt-4 border-t border-purple-500/30">
                                <p className="text-purple-300 text-xs">
                                  Created by {project.creator_profile.full_name}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 