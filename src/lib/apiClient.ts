import { supabase } from './supabase'

export class ApiClient {
  private static async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      throw new Error('Not authenticated')
    }

    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  }

  static async get(url: string) {
    const headers = await this.getAuthHeaders()
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    })

    return response
  }

  static async post(url: string, data?: any) {
    const headers = await this.getAuthHeaders()
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined
    })

    return response
  }

  static async put(url: string, data?: any) {
    const headers = await this.getAuthHeaders()
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined
    })

    return response
  }

  static async delete(url: string) {
    const headers = await this.getAuthHeaders()
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    })

    return response
  }

  // Special method for form data (like file uploads)
  static async postFormData(url: string, formData: FormData) {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData
    })

    return response
  }
}

export default ApiClient 