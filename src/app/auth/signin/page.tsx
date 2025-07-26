'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function SignInPage() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden flex items-center justify-center">
      {/* Floating Elements Background */}
      <div className="absolute inset-0">
        <div className="floating-star" style={{top: '10%', left: '10%', animationDelay: '0s'}}></div>
        <div className="floating-star" style={{top: '20%', right: '15%', animationDelay: '2s'}}></div>
        <div className="floating-star" style={{bottom: '30%', left: '20%', animationDelay: '4s'}}></div>
        <div className="floating-star" style={{bottom: '20%', right: '10%', animationDelay: '6s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded font-pixelify flex items-center justify-center text-purple-900 font-bold text-xl">
              S
            </div>
            <span className="text-white font-bold font-pixelify text-xl">Game Jam</span>
          </Link>
        </div>

        {/* Sign In Form */}
        <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white font-pixelify mb-2">
              Welcome Back
            </h1>
            <p className="text-purple-200">
              Sign in to continue your hackathon journey
            </p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-purple-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg pl-12 pr-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-purple-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg pl-12 pr-12 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-500 rounded bg-purple-900/50"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-purple-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/auth/reset-password" className="text-purple-400 hover:text-purple-300">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-purple-300">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-semibold">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
} 