import ApiClient from './apiClient'

export interface ProjectSubmission {
  id?: string
  user_id?: string
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
  features?: string[]
  team_members?: string[]
  status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'featured'
  is_final?: boolean
  hackathon_edition?: string
  created_at?: string
  submitted_at?: string
  updated_at?: string
}

export interface ProjectCatalogueItem {
  id: string
  project_name: string
  project_description: string
  category: string
  banner_url: string
  logo_url: string
  game_host_url: string
  demo_url?: string
  video_url: string
  tech_stack: string[]
  features?: string[]
  status: string
  submitted_at: string
  creator_name: string
  creator_username: string
  creator_avatar: string
}

export class ProjectsApiClient {
  
  // Get user's own projects
  static async getUserProjects(): Promise<ProjectSubmission[]> {
    const response = await ApiClient.get('/api/projects?view=user')
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch projects')
    }
    
    const data = await response.json()
    return data.projects
  }

  // Get public project catalogue
  static async getProjectCatalogue(options?: {
    category?: string
    tech?: string
    limit?: number
  }): Promise<ProjectCatalogueItem[]> {
    const params = new URLSearchParams({ view: 'catalogue' })
    
    if (options?.category) params.append('category', options.category)
    if (options?.tech) params.append('tech', options.tech)
    if (options?.limit) params.append('limit', options.limit.toString())

    const response = await fetch(`/api/projects?${params.toString()}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch project catalogue')
    }
    
    const data = await response.json()
    return data.projects
  }

  // Get featured projects
  static async getFeaturedProjects(limit = 6): Promise<ProjectCatalogueItem[]> {
    const response = await fetch(`/api/projects?view=featured&limit=${limit}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch featured projects')
    }
    
    const data = await response.json()
    return data.projects
  }

  // Get specific project (public or authenticated)
  static async getProject(projectId: string, authenticated = false): Promise<ProjectSubmission | ProjectCatalogueItem> {
    let response: Response
    
    if (authenticated) {
      response = await ApiClient.get(`/api/projects/${projectId}`)
    } else {
      response = await fetch(`/api/projects/${projectId}`)
    }
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch project')
    }
    
    const data = await response.json()
    return data.project
  }

  // Create new project
  static async createProject(projectData: Omit<ProjectSubmission, 'id' | 'user_id' | 'status' | 'is_final' | 'created_at' | 'updated_at' | 'submitted_at'>): Promise<ProjectSubmission> {
    const response = await ApiClient.post('/api/projects', projectData)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create project')
    }
    
    const data = await response.json()
    return data.project
  }

  // Update project
  static async updateProject(projectId: string, updates: Partial<ProjectSubmission>): Promise<ProjectSubmission> {
    const response = await ApiClient.put(`/api/projects/${projectId}`, updates)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update project')
    }
    
    const data = await response.json()
    return data.project
  }

  // Delete project (only drafts)
  static async deleteProject(projectId: string): Promise<void> {
    const response = await ApiClient.delete(`/api/projects/${projectId}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete project')
    }
  }

  // Submit project for judging
  static async submitProject(projectId: string): Promise<ProjectSubmission> {
    const response = await ApiClient.post(`/api/projects/${projectId}/submit`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to submit project')
    }
    
    const data = await response.json()
    return data.project
  }

  // Search projects by technology
  static async searchProjectsByTech(technologies: string[]): Promise<ProjectCatalogueItem[]> {
    const techParam = technologies.join(',')
    const response = await fetch(`/api/projects?view=catalogue&tech=${encodeURIComponent(techParam)}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to search projects')
    }
    
    const data = await response.json()
    return data.projects
  }

  // Get projects by category
  static async getProjectsByCategory(category: string): Promise<ProjectCatalogueItem[]> {
    const response = await fetch(`/api/projects?view=catalogue&category=${encodeURIComponent(category)}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch projects by category')
    }
    
    const data = await response.json()
    return data.projects
  }

  // Helper: Validate project data before submission
  static validateProjectForSubmission(project: ProjectSubmission): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    const requiredFields = [
      'project_name', 'project_description', 'category', 'solana_integration',
      'github_url', 'game_host_url', 'video_url', 'banner_url', 'logo_url'
    ]
    
    for (const field of requiredFields) {
      if (!project[field as keyof ProjectSubmission]) {
        errors.push(`${field} is required`)
      }
    }
    
    if (!project.tech_stack || project.tech_stack.length === 0) {
      errors.push('Tech stack is required')
    }
    
    if (!project.screenshot_urls || project.screenshot_urls.length === 0) {
      errors.push('At least one screenshot is required')
    }
    
    // Validate URLs
    const urlFields = ['github_url', 'game_host_url', 'video_url', 'banner_url', 'logo_url']
    for (const field of urlFields) {
      const url = project[field as keyof ProjectSubmission] as string
      if (url && !this.isValidUrl(url)) {
        errors.push(`${field} must be a valid URL`)
      }
    }
    
    // Validate screenshot URLs
    if (project.screenshot_urls) {
      project.screenshot_urls.forEach((url, index) => {
        if (url && !this.isValidUrl(url)) {
          errors.push(`Screenshot ${index + 1} must be a valid URL`)
        }
      })
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
  
  // Helper: Check if string is valid URL
  private static isValidUrl(string: string): boolean {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }
  
  // Helper: Parse tech stack from comma-separated string
  static parseTechStack(techStackString: string): string[] {
    return techStackString
      .split(',')
      .map(tech => tech.trim())
      .filter(tech => tech.length > 0)
  }
  
  // Helper: Format tech stack for display
  static formatTechStack(techStack: string[]): string {
    return techStack.join(', ')
  }
  
  // Helper: Get project status display info
  static getStatusInfo(status: string): { label: string; color: string; description: string } {
    switch (status) {
      case 'draft':
        return {
          label: 'Draft',
          color: 'text-gray-400',
          description: 'Project is being worked on'
        }
      case 'submitted':
        return {
          label: 'Submitted',
          color: 'text-blue-400',
          description: 'Project has been submitted for review'
        }
      case 'under_review':
        return {
          label: 'Under Review',
          color: 'text-yellow-400',
          description: 'Project is being reviewed by judges'
        }
      case 'approved':
        return {
          label: 'Approved',
          color: 'text-green-400',
          description: 'Project has been approved and is publicly visible'
        }
      case 'featured':
        return {
          label: 'Featured',
          color: 'text-purple-400',
          description: 'Project is featured in the catalogue'
        }
      case 'rejected':
        return {
          label: 'Rejected',
          color: 'text-red-400',
          description: 'Project needs revisions'
        }
      default:
        return {
          label: 'Unknown',
          color: 'text-gray-400',
          description: 'Status unknown'
        }
    }
  }
} 