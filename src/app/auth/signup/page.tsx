'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react'

export default function SignUpPage() {
  const { signUp } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // User can manually navigate to dashboard after email confirmation
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <div className="floating-star" style={{top: '10%', left: '10%', animationDelay: '0s'}}></div>
          <div className="floating-star" style={{top: '20%', right: '15%', animationDelay: '2s'}}></div>
          <div className="floating-star" style={{bottom: '30%', left: '20%', animationDelay: '4s'}}></div>
          <div className="floating-star" style={{bottom: '20%', right: '10%', animationDelay: '6s'}}></div>
        </div>

        <div className="relative z-10 w-full max-w-md px-6">
          <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-500/30 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l4 4 4-4m0 4V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002-2h8a2 2 0 002-2V8" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white font-pixelify mb-2">
              Check Your Email! 📧
            </h1>
            <p className="text-blue-200 mb-4">
              <strong>Almost there!</strong> We've sent a verification email to:
            </p>
            <p className="text-white font-semibold mb-6 bg-purple-800/30 px-4 py-2 rounded-lg border border-purple-500/30">
              {email}
            </p>
            <p className="text-blue-200 mb-6 text-sm">
              Click the confirmation link in the email to activate your account and start building amazing games on Solana!
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <span>Continue to Dashboard</span>
              <ArrowRight size={20} />
            </Link>
            
            <div className="mt-4 text-center">
              <p className="text-blue-300 text-xs">
                Didn't receive the email? Check your spam folder or{' '}
                <button className="text-blue-400 hover:text-blue-300 underline">
                  resend verification
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
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

        {/* Sign Up Form */}
        <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white font-pixelify mb-2">
              Join the Game Jam
            </h1>
            <p className="text-purple-200">
              Create your account and start building the future
            </p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-purple-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg pl-12 pr-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

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
                  placeholder="Create a password"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg pl-12 pr-12 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-500 rounded bg-purple-900/50"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-purple-300">
                I agree to the{' '}
                <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                  Privacy Policy
                </Link>
              </label>
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
                  <span>Create Account</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-purple-300">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-purple-400 hover:text-purple-300 font-semibold">
                Sign in here
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