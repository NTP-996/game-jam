'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ApiClient } from '@/lib/apiClient'

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
      <div className="ml-0 lg:ml-64 p-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
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
      <div className="ml-0 lg:ml-64 p-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
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
      <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-yellow-400 pixelify-sans mb-4">
          Pending Invitations ({pendingInvitations.length})
        </h2>
        <div className="space-y-3">
          {pendingInvitations.map((invitation) => (
            <div key={invitation.id} className="flex items-center justify-between bg-yellow-500/10 rounded-lg p-4">
              <div>
                <h3 className="font-semibold text-white">{invitation.team_name}</h3>
                <p className="text-yellow-200 text-sm">
                  Invited by {invitation.invited_by_name}
                </p>
                <p className="text-yellow-300 text-xs">
                  Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleInvitationResponse(invitation.id, 'accept')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleInvitationResponse(invitation.id, 'decline')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // User doesn't have a team - show team finding interface
  if (!userTeam) {
    return (
      <div className="ml-0 lg:ml-64 p-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white pixelify-sans mb-2">
                Team Management
              </h1>
              <p className="text-purple-200">
                Form a team or join existing teams to participate in the hackathon
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-lg p-6">
              <div className="text-2xl text-blue-400 mb-2">👥</div>
              <h3 className="text-lg font-bold text-blue-400 pixelify-sans">{teamStats.totalTeams}</h3>
              <p className="text-sm text-purple-200">Teams Formed</p>
            </div>
            <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
              <div className="text-2xl text-green-400 mb-2">🔍</div>
              <h3 className="text-lg font-bold text-green-400 pixelify-sans">{teamStats.recruitingTeams}</h3>
              <p className="text-sm text-purple-200">Looking for Members</p>
            </div>
            <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-6">
              <div className="text-2xl text-yellow-400 mb-2">⏰</div>
              <h3 className="text-lg font-bold text-yellow-400 pixelify-sans">{teamStats.daysUntilLock} days</h3>
              <p className="text-sm text-purple-200">Until Team Lock</p>
            </div>
          </div>

          {/* Toggle Between Create and Join */}
          <div className="flex space-x-4">
            <button
              onClick={() => { setShowCreateForm(true); setShowJoinTeams(false) }}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                showCreateForm 
                  ? 'bg-green-600 text-white' 
                  : 'bg-purple-800/50 text-purple-300 hover:text-white'
              }`}
            >
              Create New Team
            </button>
            <button
              onClick={() => { setShowCreateForm(false); setShowJoinTeams(true) }}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
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
            <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">
                Create Your Team
              </h2>
              <form onSubmit={handleCreateTeam} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createTeamData.name}
                    onChange={(e) => setCreateTeamData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                    placeholder="Enter your team name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={createTeamData.description}
                    onChange={(e) => setCreateTeamData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
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
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                    placeholder="e.g., Unity Developer, Smart Contract Developer, UI/UX Designer (comma separated)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Max Team Size
                    </label>
                    <select 
                      value={createTeamData.max_members}
                      onChange={(e) => setCreateTeamData(prev => ({ ...prev, max_members: parseInt(e.target.value) }))}
                      className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
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
                      className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
                    >
                      <option value="public">Public (anyone can join)</option>
                      <option value="private">Private (invite only)</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Create Team
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="bg-purple-700 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Browse Teams */}
          {showJoinTeams && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-white pixelify-sans">
                  Available Teams ({filteredTeams.length})
                </h2>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="Search teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-2 text-white placeholder-purple-400"
                  />
                  <select 
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    className="bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-2 text-white"
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
                <div className="text-center py-12">
                  <p className="text-purple-200 mb-4">No teams found matching your criteria.</p>
                  <button
                    onClick={() => { setSearchTerm(''); setSkillFilter('') }}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredTeams.map((team) => (
                    <div key={team.id} className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white pixelify-sans">
                            {team.name}
                          </h3>
                          <p className="text-sm text-purple-300">
                            {team.member_count}/{team.max_members} members
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          team.member_count < team.max_members
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {team.member_count < team.max_members ? 'Recruiting' : 'Full'}
                        </span>
                      </div>

                      <p className="text-purple-200 mb-4">
                        {team.description}
                      </p>

                      {team.looking_for && Array.isArray(team.looking_for) && team.looking_for.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-purple-300 mb-2">Looking for:</h4>
                          <div className="flex flex-wrap gap-2">
                                                      {team.looking_for.map((skill, index) => (
                            <span key={index} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
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
                          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded-lg font-semibold transition-colors"
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
    <div className="ml-0 lg:ml-64 p-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Team Header */}
        <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white pixelify-sans mb-2">
                {userTeam.name}
              </h1>
              <p className="text-purple-200 mb-4">
                {userTeam.description}
              </p>
              <div className="flex items-center space-x-4">
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
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
            <div className="flex space-x-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Manage Team
              </button>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                Leave Team
              </button>
            </div>
          </div>
        </div>

        {/* Team Members & Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Team Members */}
          <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white pixelify-sans mb-6">
              Team Members ({userTeam.member_count})
            </h2>
            
            {userTeam.members && userTeam.members.length > 0 ? (
              <div className="space-y-4">
                {userTeam.members.map((member) => (
                  <div key={member.user_id} className="flex items-center space-x-4 p-4 bg-purple-700/30 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-purple-600 overflow-hidden">
                      {member.avatar_url ? (
                        <Image
                          src={member.avatar_url}
                          alt={member.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold">
                          {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{member.name || 'Unknown Member'}</h3>
                      <p className="text-purple-300 text-sm">{member.role || 'Member'}</p>

                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-purple-300 text-center py-8">
                Loading team members...
              </p>
            )}
            
            {userTeam.member_count < userTeam.max_members && (
              <button 
                onClick={() => {
                  console.log('Invite button clicked, current modal state:', showInviteModal)
                  setShowInviteModal(true)
                  console.log('Modal state set to true')
                }}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                + Invite Member
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white pixelify-sans mb-4">
                Team Actions
              </h2>
              <div className="space-y-3">
                <Link
                  href="/dashboard/project"
                  className="flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🎮</span>
                    <span className="font-semibold">Project Submission</span>
                  </div>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Project Submission Status */}
        <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">
            Project Submission
          </h2>

          {teamSubmission ? (
            <div className="space-y-6">
              {/* Submission Status Banner */}
              <div className={`backdrop-blur-sm border rounded-lg p-6 ${
                teamSubmission.status === 'submitted' 
                  ? 'bg-green-500/20 border-green-500/30' 
                  : teamSubmission.status === 'approved'
                  ? 'bg-blue-500/20 border-blue-500/30'
                  : teamSubmission.status === 'featured'
                  ? 'bg-purple-500/20 border-purple-500/30'
                  : teamSubmission.status === 'rejected'
                  ? 'bg-red-500/20 border-red-500/30'
                  : 'bg-yellow-500/20 border-yellow-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">
                      {teamSubmission.status === 'submitted' ? '✅' 
                       : teamSubmission.status === 'approved' ? '🏆'
                       : teamSubmission.status === 'featured' ? '🌟'
                       : teamSubmission.status === 'rejected' ? '❌'
                       : '📝'}
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold pixelify-sans ${
                        teamSubmission.status === 'submitted' 
                          ? 'text-green-400' 
                          : teamSubmission.status === 'approved'
                          ? 'text-blue-400'
                          : teamSubmission.status === 'featured'
                          ? 'text-purple-400'
                          : teamSubmission.status === 'rejected'
                          ? 'text-red-400'
                          : 'text-yellow-400'
                      }`}>
                        {teamSubmission.status === 'draft' ? 'Draft Saved'
                         : teamSubmission.status === 'submitted' ? 'Submission Complete'
                         : teamSubmission.status === 'approved' ? 'Approved!'
                         : teamSubmission.status === 'featured' ? 'Featured!'
                         : 'Rejected'}
                      </h3>
                      <p className={`${
                        teamSubmission.status === 'submitted' 
                          ? 'text-green-200' 
                          : teamSubmission.status === 'approved'
                          ? 'text-blue-200'
                          : teamSubmission.status === 'featured'
                          ? 'text-purple-200'
                          : teamSubmission.status === 'rejected'
                          ? 'text-red-200'
                          : 'text-yellow-200'
                      }`}>
                        {teamSubmission.submitted_at 
                          ? `Submitted ${new Date(teamSubmission.submitted_at).toLocaleDateString()}`
                          : `Last updated ${new Date(teamSubmission.updated_at).toLocaleDateString()}`
                        }
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/project"
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    {teamSubmission.status === 'draft' ? 'Continue Editing' : 'View Details'}
                  </Link>
                </div>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Project Info</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-purple-300 text-sm">Project Name</p>
                      <p className="text-white font-semibold">{teamSubmission.project_name}</p>
                    </div>
                    {teamSubmission.category && (
                      <div>
                        <p className="text-purple-300 text-sm">Category</p>
                        <p className="text-white">{teamSubmission.category}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-purple-300 text-sm">Description</p>
                      <p className="text-white text-sm line-clamp-3">{teamSubmission.project_description}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Links & Resources</h4>
                  <div className="space-y-2">
                    {teamSubmission.github_url && (
                      <a 
                        href={teamSubmission.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        <span>📂</span>
                        <span>GitHub Repository</span>
                      </a>
                    )}
                    {teamSubmission.demo_url && (
                      <a 
                        href={teamSubmission.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        <span>🌐</span>
                        <span>Live Demo</span>
                      </a>
                    )}
                    {teamSubmission.video_url && (
                      <a 
                        href={teamSubmission.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        <span>🎥</span>
                        <span>Demo Video</span>
                      </a>
                    )}
                  </div>

                  {teamSubmission.tech_stack && Array.isArray(teamSubmission.tech_stack) && teamSubmission.tech_stack.length > 0 && (
                    <div className="mt-4">
                      <p className="text-purple-300 text-sm mb-2">Technologies</p>
                      <div className="flex flex-wrap gap-2">
                        {teamSubmission.tech_stack.map((tech, index) => (
                          <span key={index} className="bg-purple-600/50 text-purple-200 px-2 py-1 rounded text-xs">
                            {tech || 'Unknown Tech'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {teamSubmission.features && Array.isArray(teamSubmission.features) && teamSubmission.features.length > 0 && (
                    <div className="mt-4">
                      <p className="text-purple-300 text-sm mb-2">Features</p>
                      <div className="flex flex-wrap gap-2">
                        {teamSubmission.features.map((feature, index) => (
                          <span key={index} className="bg-orange-600/50 text-orange-200 px-2 py-1 rounded text-xs">
                            {feature || 'Unknown Feature'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-white mb-3">Ready to Submit Your Project?</h3>
              <p className="text-purple-200 mb-6">
                Upload your game, provide project details, and showcase your Solana integration.
              </p>
              <Link
                href="/dashboard/project"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
              >
                Start Project Submission
              </Link>
            </div>
          )}
        </div>

        {/* Invite Member Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-purple-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white pixelify-sans">
                    Invite Team Member
                  </h2>
                  <button
                    onClick={() => {
                      setShowInviteModal(false)
                      setSearchTerm2('')
                      setSearchResults([])
                      setInviteMessage('')
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Search Section */}
                <div className="mb-6">
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
                    className="w-full bg-purple-800/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  />
                  {isSearching && (
                    <p className="text-purple-300 text-sm mt-2">Searching...</p>
                  )}
                </div>

                {/* Looking For Skills */}
                {userTeam?.looking_for && Array.isArray(userTeam.looking_for) && userTeam.looking_for.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Looking for:</h3>
                    <div className="flex flex-wrap gap-2">
                      {userTeam.looking_for.map((skill, index) => (
                        <span key={index} className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                          {skill || 'Unknown Skill'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Message */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Invitation Message (Optional)
                  </label>
                  <textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder={`Hi! We'd love for you to join our team ${userTeam?.name}. We're working on an exciting project and think you'd be a great fit!`}
                    rows={3}
                    className="w-full bg-purple-800/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  />
                </div>

                {/* Search Results */}
                <div className="space-y-4">
                  {searchResults.length > 0 && (
                    <h3 className="text-lg font-semibold text-white">Search Results ({searchResults.length})</h3>
                  )}
                  
                  {searchResults.map((profile) => (
                    <div key={profile.id} className="bg-purple-800/30 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-purple-600 overflow-hidden">
                          {profile.avatar_url ? (
                            <Image
                              src={profile.avatar_url}
                              alt={profile.full_name || 'User'}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold">
                              {(profile.full_name || profile.username || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">
                            {profile.full_name || profile.username}
                          </h4>
                          {profile.job_title && (
                            <p className="text-purple-300 text-sm">{profile.job_title}</p>
                          )}
                          {profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {profile.skills.slice(0, 5).map((skill: string, index: number) => (
                                <span key={index} className="bg-purple-600/50 text-purple-200 px-2 py-1 rounded text-xs">
                                  {skill || 'Unknown Skill'}
                                </span>
                              ))}
                              {profile.skills.length > 5 && (
                                <span className="text-purple-400 text-xs">+{profile.skills.length - 5} more</span>
                              )}
                            </div>
                          )}
                          {profile.experience_level && (
                            <p className="text-purple-400 text-xs mt-1">
                              {profile.experience_level} level
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleInviteUser(profile.id, profile.full_name || profile.username)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Send Invite
                      </button>
                    </div>
                  ))}

                  {searchTerm2.length >= 2 && !isSearching && searchResults.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-purple-300">No users found matching your search.</p>
                      <p className="text-purple-400 text-sm mt-1">Try searching for different keywords or skills.</p>
                    </div>
                  )}

                  {searchTerm2.length < 2 && (
                    <div className="text-center py-8">
                      <p className="text-purple-300">Start typing to search for developers...</p>
                      <p className="text-purple-400 text-sm mt-1">Search by name, skills, or experience level.</p>
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