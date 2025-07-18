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

// Mock data for visual representation
const mockProjects: Project[] = [
  {
    id: 'mock-1',
    project_name: 'Stellar Warriors',
    project_description: 'An epic space combat game built on Solana with NFT ships and real-time battles.',
    category: 'Action/Adventure',
    tech_stack: ['Unity', 'Solana', 'Anchor', 'C#'],

    banner_url: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=400&fit=crop',
    logo_url: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=200&h=200&fit=crop',
    screenshot_urls: ['https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=400&fit=crop'],
    game_host_url: 'https://stellar-warriors.game',
    github_url: 'https://github.com/team/stellar-warriors',
    video_url: 'https://youtube.com/watch?v=demo',
    created_at: '2024-01-15T10:00:00Z',
    team: { id: 'team-1', name: 'Cosmic Devs' }
  },
  {
    id: 'mock-2',
    project_name: 'DeFi Dungeon',
    project_description: 'Roguelike dungeon crawler where loot is minted as NFTs and trading happens on-chain.',
    category: 'RPG/MMORPG',
    tech_stack: ['Godot', 'Rust', 'Solana', 'Metaplex'],
    banner_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
    logo_url: 'https://images.unsplash.com/photo-1578662996440-48f60103fc96?w=200&h=200&fit=crop',
    screenshot_urls: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop'],
    game_host_url: 'https://defi-dungeon.app',
    github_url: 'https://github.com/team/defi-dungeon',
    video_url: '',
    created_at: '2024-01-14T15:30:00Z',
    team: { id: 'team-2', name: 'Blockchain Builders' }
  },
  {
    id: 'mock-3',
    project_name: 'Solana Speedway',
    project_description: 'High-speed racing game with tokenized cars and track ownership on Solana.',
    category: 'Racing',
    tech_stack: ['Unreal Engine', 'TypeScript', 'Anchor', 'React'],
    banner_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
    logo_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&h=200&fit=crop',
    screenshot_urls: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop'],
    game_host_url: 'https://solana-speedway.racing',
    github_url: 'https://github.com/team/solana-speedway',
    video_url: 'https://youtube.com/watch?v=demo2',
    created_at: '2024-01-13T09:15:00Z',
    creator_profile: { full_name: 'Alex Racing', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' }
  },
  {
    id: 'mock-4',
    project_name: 'Crypto Puzzle Quest',
    project_description: 'Mind-bending puzzle game where solutions unlock cryptocurrency rewards.',
    category: 'Puzzle',
    tech_stack: ['Phaser', 'JavaScript', 'Solana Web3.js'],
    banner_url: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&h=400&fit=crop',
    logo_url: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=200&h=200&fit=crop',
    screenshot_urls: ['https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=600&h=400&fit=crop'],
    game_host_url: 'https://crypto-puzzle-quest.com',
    github_url: 'https://github.com/team/crypto-puzzle',
    video_url: '',
    created_at: '2024-01-12T14:20:00Z',
    team: { id: 'team-3', name: 'Puzzle Masters' }
  }
]

const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Cosmic Devs',
    description: 'Passionate game developers creating the next generation of space-themed blockchain games.',
    member_count: 4,
    avatar_url: 'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=200&h=200&fit=crop',
    skills: ['Unity', 'Solana', 'Game Design', 'NFTs'],
    github_url: 'https://github.com/cosmic-devs',
    discord_server: 'https://discord.gg/cosmic-devs'
  },
  {
    id: 'team-2',
    name: 'Blockchain Builders',
    description: 'Full-stack developers specializing in DeFi gaming experiences and smart contract development.',
    member_count: 3,
    avatar_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&h=200&fit=crop',
    skills: ['Rust', 'Anchor', 'Godot', 'DeFi'],
    github_url: 'https://github.com/blockchain-builders',
    website_url: 'https://blockchainbuilders.dev'
  },
  {
    id: 'team-3',
    name: 'Puzzle Masters',
    description: 'Creative minds focused on innovative puzzle mechanics and cryptocurrency integration.',
    member_count: 2,
    avatar_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=200&fit=crop',
    skills: ['JavaScript', 'Phaser', 'Game Logic', 'Web3'],
    github_url: 'https://github.com/puzzle-masters',
    discord_server: 'https://discord.gg/puzzle-masters'
  },
  {
    id: 'team-4',
    name: 'Web3 Warriors',
    description: 'Veteran game developers transitioning to blockchain gaming with years of AAA experience.',
    member_count: 5,
    avatar_url: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=200&h=200&fit=crop',
    skills: ['Unreal Engine', 'C++', 'Solana', 'Multiplayer'],
    github_url: 'https://github.com/web3-warriors',
    website_url: 'https://web3warriors.gg'
  }
]

export default function CataloguePage() {
  const [activeTab, setActiveTab] = useState<'games' | 'teams'>('games')
  const [projects, setProjects] = useState<Project[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
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

      // Combine real data with mock data for visual representation
      const allProjects = [...realProjects, ...mockProjects]
      setProjects(allProjects)
      setTeams([...realTeams, ...mockTeams])
      
      // Randomly select a featured game from all projects
      if (allProjects.length > 0) {
        const randomIndex = Math.floor(Math.random() * allProjects.length)
        setFeaturedGame(allProjects[randomIndex])
      }
      
    } catch (error) {
      console.error('Error loading catalogue data:', error)
      // Use mock data if API fails
      setProjects(mockProjects)
      setTeams(mockTeams)
      
      // Randomly select a featured game from mock data
      if (mockProjects.length > 0) {
        const randomIndex = Math.floor(Math.random() * mockProjects.length)
        setFeaturedGame(mockProjects[randomIndex])
      }
    } finally {
      setLoading(false)
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
            Discover amazing games and talented teams from the Solana Game Jam
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
        {activeTab === 'games' && filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold text-white mb-2">No games found</h3>
            <p className="text-purple-300">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {activeTab === 'teams' && filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-white mb-2">No teams found</h3>
            <p className="text-purple-300">Try adjusting your search criteria</p>
          </div>
        )}

      </div>
    </div>
  )
} 