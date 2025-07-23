'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ApiClient } from '@/lib/apiClient'
import useFormPersistence from '@/hooks/useFormPersistence'
import FixMembershipButton from './fix-membership'

interface TeamMember {
  user_id: string
  name: string
  avatar_url?: string
  role: string
  permissions: {
    can_invite: boolean
    can_manage_submissions: boolean
  }
  skills: string[]
  github?: string
  twitter?: string
}

interface Team {
  id: string
  name: string
  description: string
  looking_for: string[]
  max_members: number
  is_public: boolean
  created_at: string
  member_count: number
  members?: TeamMember[]
  leader_id?: string // Added leader_id
}

interface TeamSubmission {
  id: string
  team_id: string
  creator_id: string
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
  submitted_at?: string
  updated_at: string
  creator_profile?: {
    full_name: string
    avatar_url?: string
    username: string
  }
  team?: {
    id: string
    name: string
    description: string
  }
}

interface TeamInvitation {
  id: string
  team_id: string
  team_name: string
  invited_by: string
  invited_by_name: string
  status: 'pending' | 'accepted' | 'declined'
  expires_at: string
  created_at: string
}

interface CreateTeamData {
  name: string
  description: string
  looking_for: string
  max_members: number
  is_public: boolean
}

export default function TeamPage() {
  const { user } = useAuth()
  const [userTeam, setUserTeam] = useState<Team | null>(null)
  const [teamSubmission, setTeamSubmission] = useState<TeamSubmission | null>(null)
  const [availableTeams, setAvailableTeams] = useState<Team[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<TeamInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinTeams, setShowJoinTeams] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [teamStats, setTeamStats] = useState({
    totalTeams: 0,
    recruitingTeams: 0,
    daysUntilLock: 6
  })

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchTerm2, setSearchTerm2] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [inviteMessage, setInviteMessage] = useState('')

  // Form state for creating teams
  const [createTeamData, setCreateTeamData] = useState<CreateTeamData>({
    name: '',
    description: '',
    looking_for: '',
    max_members: 4,
    is_public: true
  })

  // Form persistence hook for team creation
  const { loadPersistedData, clearPersistedData } = useFormPersistence({
    key: `team_create_${user?.id || 'anonymous'}`,
    data: createTeamData,
    enabled: showCreateForm && !userTeam, // Only persist when creating new team
    debounceMs: 500
  })

  // Load persisted data when starting to create a team
  useEffect(() => {
    if (user && showCreateForm && !userTeam) {
      const persisted = loadPersistedData()
      if (persisted) {
        setCreateTeamData(persisted)
      }
    }
  }, [user, showCreateForm, userTeam])

  useEffect(() => {
    if (user) {
      loadInitialData()
    }
  }, [user])



  const loadInitialData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadUserTeam(),
        loadAvailableTeams(),
        loadPendingInvitations(),
        loadTeamStats()
      ])
    } catch (err) {
      console.error('Error loading team data:', err)
      setError('Failed to load team data')
    } finally {
      setLoading(false)
    }
  }

  const loadUserTeam = async () => {
    try {
      // First try to get teams where user is a member
      const response = await ApiClient.get('/api/teams?mode=my')
      
      if (response.ok) {
        const data = await response.json()
        
        // API returns { teams: [...] }, get the first team for user
        const team = data.teams?.[0] || null
        setUserTeam(team)
        
        // If user has a team, load their submission
        if (team) {
          await loadTeamSubmission(team.id)
        }
      }
    } catch (err) {
      console.error('Error loading user team:', err)
      setError('Failed to load your team information')
    }
  }

  const loadTeamSubmission = async (teamId: string) => {
    try {
      const response = await ApiClient.get(`/api/teams/submissions?team_id=${teamId}`)
      
      if (response.ok) {
        const data = await response.json()
        setTeamSubmission(data.submissions?.[0] || null)
      }
    } catch (err) {
      console.error('Error loading team submission:', err)
      // Don't set error here as submission might not exist yet
    }
  }

  // Temporary fix function to convert individual project to team project
  const fixProjectTeamAssignment = async () => {
    try {
      setError(null)
      console.log('🔧 Attempting to fix project team assignment...')
      
      // First, get user's individual projects
      const response = await ApiClient.get('/api/projects?view=user')
      if (response.ok) {
        const data = await response.json()
        const individualProjects = data.projects || []
        
        console.log('📄 Found individual projects:', individualProjects.length)
        
        if (individualProjects.length > 0) {
          const project = individualProjects[0]
          console.log('🎯 Converting project to team project:', project.project_name)
          
          // Update the project to assign it to the team
          const updateResponse = await ApiClient.put(`/api/projects/${project.id}`, {
            convertToTeamProject: true
          })
          
          if (updateResponse.ok) {
            console.log('✅ Project successfully converted to team project!')
            alert('✅ Project successfully converted to team project! Refreshing...')
            // Reload the team data
            loadInitialData()
          } else {
            const errorData = await updateResponse.json()
            console.error('❌ Failed to convert project:', errorData)
            setError(`Failed to convert project: ${errorData.error}`)
          }
        } else {
          console.log('❌ No individual projects found to convert')
          setError('No individual projects found to convert')
        }
      }
    } catch (err) {
      console.error('Error fixing project team assignment:', err)
      setError('Failed to fix project team assignment')
    }
  }

  const loadAvailableTeams = async () => {
    try {
      const response = await ApiClient.get('/api/teams?mode=available')
      if (response.ok) {
        const data = await response.json()
        setAvailableTeams(data.teams || [])
      }
    } catch (err) {
      console.error('Error loading available teams:', err)
    }
  }

  const loadPendingInvitations = async () => {
    try {
      const response = await ApiClient.get('/api/teams/invitations')
      if (response.ok) {
        const data = await response.json()
        setPendingInvitations(data.invitations || [])
      }
    } catch (err) {
      console.error('Error loading invitations:', err)
    }
  }

  const loadTeamStats = async () => {
    try {
      // For now, get public teams and calculate stats
      const response = await ApiClient.get('/api/teams?mode=public')
      if (response.ok) {
        const data = await response.json()
        const teams = data.teams || []
        const recruitingTeams = teams.filter((team: Team) => team.member_count < team.max_members)
        
        setTeamStats({
          totalTeams: teams.length,
          recruitingTeams: recruitingTeams.length,
          daysUntilLock: 6 // This would come from your hackathon configuration
        })
      }
    } catch (err) {
      console.error('Error loading team stats:', err)
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError(null)
      
      const lookingForArray = createTeamData.looking_for
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0)

      const response = await ApiClient.post('/api/teams', {
        ...createTeamData,
        looking_for: lookingForArray
      })

      if (response.ok) {
        const data = await response.json()
        setUserTeam(data.team)
        setShowCreateForm(false)
        // Clear persisted data on successful team creation
        clearPersistedData()
        setCreateTeamData({
          name: '',
          description: '',
          looking_for: '',
          max_members: 4,
          is_public: true
        })
        // Refresh available teams
        loadAvailableTeams()
      } else {
        const errorData = await response.json()
        console.error('Team creation error:', errorData)
        setError(errorData.error || `Failed to create team (${response.status})`)
      }
    } catch (err) {
      console.error('Error creating team:', err)
      if (err instanceof Error && err.message === 'Not authenticated') {
        setError('Please sign in again to create a team')
      } else {
        setError('Failed to create team. Please try again.')
      }
    }
  }

  const handleJoinTeam = async (teamId: string) => {
    try {
      setError(null)
      
      const response = await ApiClient.post('/api/teams/invitations', {
        team_id: teamId,
        type: 'join_request'
      })

      if (response.ok) {
        alert('Join request sent successfully!')
        // Refresh data
        loadAvailableTeams()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to send join request')
      }
    } catch (err) {
      console.error('Error joining team:', err)
      setError('Failed to send join request')
    }
  }

  const handleInvitationResponse = async (invitationId: string, action: 'accept' | 'decline') => {
    try {
      setError(null)
      
      const response = await ApiClient.put(`/api/teams/invitations/${invitationId}`, { action })

      if (response.ok) {
        // Refresh data
        await Promise.all([
          loadUserTeam(),
          loadPendingInvitations()
        ])
        
        if (action === 'accept') {
          alert('Successfully joined the team!')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || `Failed to ${action} invitation`)
      }
    } catch (err) {
      console.error(`Error ${action}ing invitation:`, err)
      setError(`Failed to ${action} invitation`)
    }
  }

  // Search for users to invite
  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      setIsSearching(true)
      const response = await ApiClient.post('/api/profile/search', {
        query,
        skills: userTeam?.looking_for || []
      })

      if (response.ok) {
        const data = await response.json()
        // Filter out current team members
        const currentMemberIds = userTeam?.members?.map(m => m.user_id) || []
        const filteredResults = (data.profiles || []).filter(
          (profile: any) => !currentMemberIds.includes(profile.id)
        )
        setSearchResults(filteredResults)
      }
    } catch (err) {
      console.error('Error searching users:', err)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Send invitation to user
  const handleInviteUser = async (userId: string, userName: string) => {
    try {
      setError(null)
      
      const response = await ApiClient.post('/api/teams/invitations', {
        team_id: userTeam?.id,
        invitee_id: userId,
        role: 'Member', // Default role for invited users
        message: inviteMessage || `Join our team ${userTeam?.name}!`
      })

      if (response.ok) {
        alert(`Invitation sent to ${userName}!`)
        setShowInviteModal(false)
        setSearchTerm2('')
        setSearchResults([])
        setInviteMessage('')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to send invitation')
      }
    } catch (err) {
      console.error('Error sending invitation:', err)
      setError('Failed to send invitation')
    }
  }

  // Remove team member
  const handleRemoveMember = async (userId: string, userName: string) => {
    try {
      setError(null)
      
      if (!confirm(`Are you sure you want to remove ${userName} from the team?`)) {
        return
      }
      
      const response = await ApiClient.delete(`/api/teams/members/${userId}`)
      
      if (response.ok) {
        alert(`${userName} has been removed from the team.`)
        // Refresh team data
        loadUserTeam()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to remove team member')
      }
    } catch (err) {
      console.error('Error removing team member:', err)
      setError('Failed to remove team member')
    }
  }

  // Filter teams based on search and skill filter
  const filteredTeams = availableTeams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSkill = !skillFilter || 
                        team.looking_for.some(skill => 
                          skill.toLowerCase().includes(skillFilter.toLowerCase())
                        )
    
    return matchesSearch && matchesSkill
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 pb-20 lg:pb-6">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-purple-200">Loading team data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 pb-20 lg:pb-6">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
          <div className="text-center py-12">
            <p className="text-purple-200 mb-4">Please sign in to access team management.</p>
            <Link href="/auth/signin" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show pending invitations at the top if any
  const InvitationsSection = () => {
    if (pendingInvitations.length === 0) return null

    return (
      <div className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 backdrop-blur-sm border border-yellow-500/40 rounded-xl p-6 mb-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xl">📧</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-yellow-400 pixelify-sans">
            Team Invitations ({pendingInvitations.length})
          </h2>
        </div>
        <div className="space-y-4">
          {pendingInvitations.map((invitation) => (
            <div key={invitation.id} className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-5 hover:border-yellow-400/50 transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">👥</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{invitation.team_name}</h3>
                      <p className="text-yellow-200 text-sm">
                        Invited by <span className="font-semibold">{invitation.invited_by_name}</span>
                      </p>
                    </div>
                  </div>
                  <div className="ml-13">
                    <p className="text-yellow-300 text-sm flex items-center gap-1">
                      <span>⏰</span>
                      Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                    </p>
                    <p className="text-gray-300 text-xs mt-1">
                      Created: {new Date(invitation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleInvitationResponse(invitation.id, 'accept')}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <span>✅</span>
                    Accept
                  </button>
                  <button
                    onClick={() => handleInvitationResponse(invitation.id, 'decline')}
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <span>❌</span>
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-400/20 rounded-lg">
          <p className="text-yellow-200 text-sm flex items-center gap-2">
            <span>💡</span>
            <span>You can only be a member of one team at a time. Accepting an invitation will leave your current team.</span>
          </p>
        </div>
      </div>
    )
  }

  // User doesn't have a team - show team finding interface
  if (!userTeam) {
    return (
      <div className="ml-0 lg:ml-64 min-h-screen bg-gradient-to-b from-purple-900/20 via-transparent to-blue-900/20 pb-20 lg:pb-6">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-8 space-y-4 md:space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <div>
              <h1 className="text-lg md:text-4xl font-bold text-white pixelify-sans mb-1 md:mb-2">
                Team Management
              </h1>
              <p className="text-purple-200 text-xs md:text-base">
                Form teams to participate
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 md:px-6 md:py-3 rounded font-semibold transition-colors text-xs md:text-base w-full md:w-auto"
            >
              🚀 Create Team
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <InvitationsSection />

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 md:gap-6">
            <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded p-3 md:p-6">
              <div className="text-lg md:text-2xl text-blue-400 mb-1">👥</div>
              <h3 className="text-sm md:text-lg font-bold text-blue-400 pixelify-sans">{teamStats.totalTeams}</h3>
              <p className="text-xs text-purple-200">Teams</p>
            </div>
            <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded p-3 md:p-6">
              <div className="text-lg md:text-2xl text-green-400 mb-1">🔍</div>
              <h3 className="text-sm md:text-lg font-bold text-green-400 pixelify-sans">{teamStats.recruitingTeams}</h3>
              <p className="text-xs text-purple-200">Recruiting</p>
            </div>
            <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded p-3 md:p-6">
              <div className="text-lg md:text-2xl text-yellow-400 mb-1">⏰</div>
              <h3 className="text-sm md:text-lg font-bold text-yellow-400 pixelify-sans">{teamStats.daysUntilLock}</h3>
              <p className="text-xs text-purple-200">Days</p>
            </div>
          </div>

          {/* Toggle Between Create and Join */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              onClick={() => { setShowCreateForm(true); setShowJoinTeams(false) }}
              className={`px-4 py-3 rounded-lg font-semibold transition-colors text-sm ${
                showCreateForm 
                  ? 'bg-green-600 text-white' 
                  : 'bg-purple-800/50 text-purple-300 hover:text-white'
              }`}
            >
              Create New Team
            </button>
            <button
              onClick={() => { setShowCreateForm(false); setShowJoinTeams(true) }}
              className={`px-4 py-3 rounded-lg font-semibold transition-colors text-sm ${
                showJoinTeams 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-purple-800/50 text-purple-300 hover:text-white'
              }`}
            >
              Browse Teams
            </button>
          </div>

          {/* Create Team Form */}
          {showCreateForm && (
            <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-white pixelify-sans mb-4 md:mb-6">
                Create Your Team
              </h2>
              <form onSubmit={handleCreateTeam} className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createTeamData.name}
                    onChange={(e) => setCreateTeamData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 md:px-4 md:py-3 text-white placeholder-purple-400 text-sm md:text-base"
                    placeholder="Enter your team name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={createTeamData.description}
                    onChange={(e) => setCreateTeamData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 md:px-4 md:py-3 text-white placeholder-purple-400 text-sm md:text-base"
                    placeholder="Describe your project idea and goals"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Looking for (Skills/Roles)
                  </label>
                  <input
                    type="text"
                    value={createTeamData.looking_for}
                    onChange={(e) => setCreateTeamData(prev => ({ ...prev, looking_for: e.target.value }))}
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 md:px-4 md:py-3 text-white placeholder-purple-400 text-sm md:text-base"
                    placeholder="e.g., Unity Developer, Smart Contract Developer, UI/UX Designer (comma separated)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Max Team Size
                    </label>
                    <select 
                      value={createTeamData.max_members}
                      onChange={(e) => setCreateTeamData(prev => ({ ...prev, max_members: parseInt(e.target.value) }))}
                      className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 md:px-4 md:py-3 text-white text-sm md:text-base"
                    >
                      <option value={2}>2 members</option>
                      <option value={3}>3 members</option>
                      <option value={4}>4 members</option>
                      <option value={5}>5 members</option>
                      <option value={6}>6 members</option>
                      <option value={7}>7 members</option>
                      <option value={8}>8 members</option>
                      <option value={9}>9 members</option>
                      <option value={10}>10 members</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Visibility
                    </label>
                    <select 
                      value={createTeamData.is_public ? 'public' : 'private'}
                      onChange={(e) => setCreateTeamData(prev => ({ ...prev, is_public: e.target.value === 'public' }))}
                      className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 md:px-4 md:py-3 text-white text-sm md:text-base"
                    >
                      <option value="public">Public (anyone can join)</option>
                      <option value="private">Private (invite only)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-sm md:text-base"
                  >
                    Create Team
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="bg-purple-700 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-sm md:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Browse Teams */}
          {showJoinTeams && (
            <div className="space-y-4 md:space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-white pixelify-sans">
                  Available Teams ({filteredTeams.length})
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <input
                    type="text"
                    placeholder="Search teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 md:px-4 text-white placeholder-purple-400 text-sm md:text-base flex-1 sm:w-48"
                  />
                  <select 
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    className="bg-purple-900/50 border border-purple-500/50 rounded-lg px-3 py-2 md:px-4 text-white text-sm md:text-base flex-1 sm:w-auto"
                  >
                    <option value="">All Skills</option>
                    <option value="Unity">Unity Developer</option>
                    <option value="Smart Contract">Smart Contract</option>
                    <option value="UI/UX">UI/UX Designer</option>
                    <option value="Frontend">Frontend Developer</option>
                    <option value="Backend">Backend Developer</option>
                    <option value="Game Design">Game Designer</option>
                  </select>
                </div>
              </div>

              {filteredTeams.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <p className="text-purple-200 mb-4">No teams found matching your criteria.</p>
                  <button
                    onClick={() => { setSearchTerm(''); setSkillFilter('') }}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  {filteredTeams.map((team) => (
                    <div key={team.id} className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 md:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg md:text-xl font-bold text-white pixelify-sans truncate">
                            {team.name}
                          </h3>
                          <p className="text-sm text-purple-300">
                            {team.member_count}/{team.max_members} members
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs flex-shrink-0 ml-2 ${
                          team.member_count < team.max_members
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {team.member_count < team.max_members ? 'Recruiting' : 'Full'}
                        </span>
                      </div>

                      <p className="text-purple-200 mb-4 text-sm md:text-base">
                        {team.description}
                      </p>

                      {team.looking_for && Array.isArray(team.looking_for) && team.looking_for.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-purple-300 mb-2">Looking for:</h4>
                          <div className="flex flex-wrap gap-1 md:gap-2">
                                                      {team.looking_for.map((skill, index) => (
                            <span key={index} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                              {skill || 'Unknown Skill'}
                            </span>
                          ))}
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleJoinTeam(team.id)}
                          disabled={team.member_count >= team.max_members}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded-lg font-semibold transition-colors text-sm"
                        >
                          {team.member_count >= team.max_members ? 'Team Full' : 'Request to Join'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // User has a team - show team dashboard
  return (
    <div className="ml-0 lg:ml-64 min-h-screen bg-gradient-to-b from-purple-900/20 via-transparent to-blue-900/20 pb-20 lg:pb-6">
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8 space-y-4 md:space-y-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Team Header */}
        <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 md:p-8">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-4xl font-bold text-white pixelify-sans mb-2 break-words">
                  {userTeam.name}
                </h1>
                <p className="text-purple-200 mb-3 text-sm md:text-base break-words">
                  {userTeam.description}
                </p>
              </div>
              <div className="flex justify-start sm:justify-end flex-shrink-0">
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                  Leave Team
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm w-fit">
                Active Team
              </span>
              <span className="text-purple-300 text-sm">
                {userTeam.member_count}/{userTeam.max_members} members
              </span>
              <span className="text-purple-300 text-sm">
                Created {new Date(userTeam.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Fix membership button if user is team leader but no members showing */}
        {userTeam.leader_id === user?.id && (!userTeam.members || userTeam.members.length === 0) && (
          <FixMembershipButton />
        )}

        {/* Team Members & Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {/* Team Members */}
          <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-white pixelify-sans mb-4 md:mb-6">
              Team Members ({userTeam.member_count})
            </h2>
            
            {userTeam.members && userTeam.members.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {userTeam.members.map((member) => (
                  <div key={member.user_id} className="flex items-center justify-between gap-3 p-3 bg-purple-700/30 rounded-lg">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-purple-600 overflow-hidden flex-shrink-0">
                        {member.avatar_url ? (
                          <Image
                            src={member.avatar_url}
                            alt={member.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                            {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">{member.name || 'Unknown Member'}</h3>
                        <p className="text-purple-300 text-xs">{member.role || 'Member'}</p>
                      </div>
                    </div>
                    
                    {/* Show remove button only if current user is team leader and member is not the leader */}
                    {userTeam.leader_id === user?.id && member.user_id !== user?.id && (
                      <button 
                        onClick={() => handleRemoveMember(member.user_id, member.name)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex-shrink-0"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-purple-300 text-center py-6 md:py-8 text-sm">
                Loading team members...
              </p>
            )}
            
            {userTeam.member_count < userTeam.max_members && (
              <button 
                onClick={() => {
                  setShowInviteModal(true)
                }}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors text-sm"
              >
                + Invite Member
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4 md:space-y-6">
            <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-white pixelify-sans mb-4">
                Team Actions
              </h2>
              <div className="space-y-3">
                {!teamSubmission && (
                  <Link
                    href="/dashboard/project"
                    className="flex items-center justify-between p-3 md:p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg md:text-xl">🎮</span>
                      <span className="font-semibold text-sm md:text-base">Project Submission</span>
                    </div>
                    <span className="text-lg md:text-xl">→</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Project Submission Status */}
        <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 md:p-8">
          <h2 className="text-lg md:text-2xl font-bold text-white pixelify-sans mb-4 md:mb-6">
            Team Project Submission
          </h2>

          {teamSubmission ? (
            <div className="space-y-4 md:space-y-6">
              {/* Simple Project Card */}
              <Link
                href="/dashboard/project"
                className="block bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-xl p-4 md:p-6 transition-all duration-200 hover:transform hover:scale-[1.02]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6">
                  {/* Project Logo */}
                  {teamSubmission.logo_url && (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-white/10 border border-purple-500/30 p-2 flex-shrink-0 mx-auto sm:mx-0">
                      <Image
                        src={teamSubmission.logo_url}
                        alt={`${teamSubmission.project_name} logo`}
                        width={64}
                        height={64}
                        className="w-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Project Info */}
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mb-2">
                      <h3 className="text-lg md:text-2xl font-bold text-white pixelify-sans break-words">
                        {teamSubmission.project_name}
                      </h3>
                      {/* Status Badge */}
                      <span className={`px-2 py-1 rounded-full text-xs md:text-sm font-medium inline-block mt-1 sm:mt-0 ${
                        teamSubmission.status === 'submitted' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : teamSubmission.status === 'approved'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : teamSubmission.status === 'featured'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : teamSubmission.status === 'rejected'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {teamSubmission.status === 'draft' ? 'Draft'
                         : teamSubmission.status === 'submitted' ? 'Submitted'
                         : teamSubmission.status === 'approved' ? 'Approved'
                         : teamSubmission.status === 'featured' ? 'Featured'
                         : 'Rejected'}
                      </span>
                    </div>
                    <p className="text-purple-200 text-sm md:text-lg mb-3 line-clamp-2 break-words">
                      {teamSubmission.project_description}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs md:text-sm text-purple-300">
                      <span className="bg-purple-600/30 px-2 py-1 rounded">
                        {teamSubmission.category}
                      </span>
                      {teamSubmission.tech_stack && teamSubmission.tech_stack.length > 0 && (
                        <span>
                          {teamSubmission.tech_stack.length} technologies
                        </span>
                      )}
                      <span>
                        {teamSubmission.submitted_at 
                          ? `Submitted ${new Date(teamSubmission.submitted_at).toLocaleDateString()}`
                          : `Updated ${new Date(teamSubmission.updated_at).toLocaleDateString()}`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <div className="text-purple-300 text-xl md:text-2xl flex-shrink-0 mx-auto sm:mx-0">
                    →
                  </div>
                </div>
              </Link>
            </div>
          ) : (
            <div className="text-center py-8 md:py-16">
              <div className="text-4xl md:text-8xl mb-4 md:mb-6">🚀</div>
              <h3 className="text-xl md:text-3xl font-bold text-white mb-3 md:mb-4 pixelify-sans">Ready to Submit Your Project?</h3>
              <p className="text-sm md:text-xl text-purple-200 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
                Upload your game, provide project details, and showcase your Solana integration to compete for amazing prizes!
              </p>
              
              {/* Temporary fix button */}
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 md:p-6 mb-6 md:mb-8 max-w-2xl mx-auto">
                <h4 className="text-yellow-400 font-semibold mb-2 text-sm md:text-base">🔧 Already have a project?</h4>
                <p className="text-yellow-200 text-xs md:text-sm mb-4">
                  If you already submitted a project but it's not showing here, it might be linked as an individual project instead of a team project. Click below to fix this:
                </p>
                <button
                  onClick={fixProjectTeamAssignment}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold transition-colors text-sm md:text-base"
                >
                  🔧 Convert Individual Project to Team Project
                </button>
              </div>
              
              <Link
                href="/dashboard/project"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 md:px-10 md:py-4 rounded-xl font-bold text-sm md:text-lg transition-all transform hover:scale-105 inline-flex items-center gap-2 md:gap-3"
              >
                <span>🎮</span>
                Start Project Submission
              </Link>
            </div>
          )}
        </div>

        {/* Invite Member Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 z-50">
            <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 border border-purple-500/30 rounded-xl max-w-2xl w-full max-h-[90vh] md:max-h-[80vh] overflow-y-auto shadow-2xl">
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">👥</span>
                    </div>
                    <h2 className="text-lg md:text-2xl font-bold text-white pixelify-sans">
                      Invite Team Member
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowInviteModal(false)
                      setSearchTerm2('')
                      setSearchResults([])
                      setInviteMessage('')
                    }}
                    className="text-gray-400 hover:text-white transition-colors flex-shrink-0 ml-2 p-1 rounded-lg hover:bg-white/10"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Team Info */}
                <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-4 mb-6">
                  <h3 className="text-white font-semibold mb-1">Inviting to: <span className="text-purple-300">{userTeam?.name}</span></h3>
                  <p className="text-purple-200 text-sm">Current members: {userTeam?.member_count || 0}/{userTeam?.max_members || 5}</p>
                </div>

                {/* Search Section */}
                <div className="mb-4 md:mb-6">
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Search for developers
                  </label>
                  <input
                    type="text"
                    value={searchTerm2}
                    onChange={(e) => {
                      setSearchTerm2(e.target.value)
                      searchUsers(e.target.value)
                    }}
                    placeholder="Search by name, skills, or username..."
                    className="w-full bg-purple-800/50 border border-purple-500/50 rounded-lg px-3 py-2 md:px-4 md:py-3 text-white placeholder-purple-400 text-sm md:text-base"
                  />
                  {isSearching && (
                    <p className="text-purple-300 text-sm mt-2">Searching...</p>
                  )}
                </div>

                {/* Looking For Skills */}
                {userTeam?.looking_for && Array.isArray(userTeam.looking_for) && userTeam.looking_for.length > 0 && (
                  <div className="mb-4 md:mb-6">
                    <h3 className="text-base md:text-lg font-semibold text-white mb-2">Looking for:</h3>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {userTeam.looking_for.map((skill, index) => (
                        <span key={index} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs md:text-sm">
                          {skill || 'Unknown Skill'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Message */}
                <div className="mb-4 md:mb-6">
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Invitation Message (Optional)
                  </label>
                  <textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder={`Hi! We'd love for you to join our team ${userTeam?.name}. We're working on an exciting project and think you'd be a great fit!`}
                    rows={3}
                    className="w-full bg-purple-800/50 border border-purple-500/50 rounded-lg px-3 py-2 md:px-4 md:py-3 text-white placeholder-purple-400 text-sm md:text-base"
                  />
                </div>

                {/* Search Results */}
                <div className="space-y-3 md:space-y-4">
                  {searchResults.length > 0 && (
                    <h3 className="text-base md:text-lg font-semibold text-white">Search Results ({searchResults.length})</h3>
                  )}
                  
                  {searchResults.map((profile) => (
                    <div key={profile.id} className="bg-purple-800/30 rounded-lg p-3 md:p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-600 overflow-hidden flex-shrink-0">
                          {profile.avatar_url ? (
                            <Image
                              src={profile.avatar_url}
                              alt={profile.full_name || 'User'}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                              {(profile.full_name || profile.username || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-white text-sm truncate">
                                {profile.full_name || profile.username}
                              </h4>
                              {profile.job_title && (
                                <p className="text-purple-300 text-xs">{profile.job_title}</p>
                              )}
                              {profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {profile.skills.slice(0, 3).map((skill: string, index: number) => (
                                    <span key={index} className="bg-purple-600/50 text-purple-200 px-2 py-1 rounded text-xs">
                                      {skill || 'Unknown Skill'}
                                    </span>
                                  ))}
                                  {profile.skills.length > 3 && (
                                    <span className="text-purple-400 text-xs">+{profile.skills.length - 3} more</span>
                                  )}
                                </div>
                              )}
                              {profile.experience_level && (
                                <p className="text-purple-400 text-xs mt-1">
                                  {profile.experience_level} level
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleInviteUser(profile.id, profile.full_name || profile.username)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 w-full sm:w-auto"
                            >
                              Send Invite
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {searchTerm2.length >= 2 && !isSearching && searchResults.length === 0 && (
                    <div className="text-center py-6 md:py-8">
                      <p className="text-purple-300 text-sm">No users found matching your search.</p>
                      <p className="text-purple-400 text-xs mt-1">Try searching for different keywords or skills.</p>
                    </div>
                  )}

                  {searchTerm2.length < 2 && (
                    <div className="text-center py-6 md:py-8">
                      <p className="text-purple-300 text-sm">Start typing to search for developers...</p>
                      <p className="text-purple-400 text-xs mt-1">Search by name, skills, or experience level.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}