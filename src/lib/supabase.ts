import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({
      email,
      password,
    })
  },
  
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    })
  },
  
  signOut: async () => {
    return await supabase.auth.signOut()
  },
  
  resetPassword: async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email)
  },
  
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },
  
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }
} 