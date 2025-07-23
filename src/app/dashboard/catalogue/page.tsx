'use client'

import Link from 'next/link'
import { Clock, ArrowRight } from 'lucide-react'

export default function CataloguePage() {
  return (
    <div className="ml-0 lg:ml-64 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center space-y-6 px-6">
        {/* Gaming Icons */}
        <div className="flex justify-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <span className="text-3xl">🎮</span>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
            <span className="text-3xl">🚀</span>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <span className="text-3xl">⭐</span>
          </div>
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white pixelify-sans">
            Game Catalogue
          </h1>
          <div className="inline-flex items-center space-x-2 bg-yellow-500/20 border border-yellow-500/50 rounded-full px-6 py-3">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-300 font-semibold text-lg">Coming Soon...</span>
          </div>
        </div>

        {/* Description */}
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-xl text-slate-300 leading-relaxed">
            Amazing games are being built right now! The catalogue will showcase all the incredible projects from our community.
          </p>
          <p className="text-lg text-slate-400">
            Check back soon to discover and play the latest Solana-powered games from talented developers across APAC.
          </p>
        </div>

        {/* Call to Action */}
        <div className="pt-8">
          <Link 
            href="/dashboard/team" 
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <span>Submit Your Game</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
} 