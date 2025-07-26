'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-purple-900/90 backdrop-blur-sm border-b border-purple-500/30">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-purple-900 font-bold text-xl pixelify-sans">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white pixelify-sans">SOLANA GAME JAM</h1>
              <p className="text-sm text-purple-300">APAC 2024</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#about" className="text-purple-200 hover:text-yellow-400 transition-colors">
              About
            </a>

            <a href="#schedule" className="text-purple-200 hover:text-yellow-400 transition-colors">
              Schedule
            </a>
            <a href="#mentors" className="text-purple-200 hover:text-yellow-400 transition-colors">
              Mentors
            </a>
            <a href="#faq" className="text-purple-200 hover:text-yellow-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors pixelify-sans"
            >
              Dashboard
            </Link>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold transition-colors pixelify-sans">
              Register Now
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-500/30">
            <nav className="flex flex-col space-y-4">
              <a href="#about" className="text-purple-200 hover:text-yellow-400 transition-colors">
                About
              </a>

              <a href="#schedule" className="text-purple-200 hover:text-yellow-400 transition-colors">
                Schedule
              </a>
              <a href="#mentors" className="text-purple-200 hover:text-yellow-400 transition-colors">
                Mentors
              </a>
              <a href="#faq" className="text-purple-200 hover:text-yellow-400 transition-colors">
                FAQ
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <Link 
                  href="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors pixelify-sans text-center"
                >
                  Dashboard
                </Link>
                <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold transition-colors pixelify-sans">
                  Register Now
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 