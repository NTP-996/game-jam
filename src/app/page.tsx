'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Hero from '@/components/Hero/Hero'
import About from '@/components/About/About'
import Schedule from '@/components/Schedule/Schedule'
import Prizes from '@/components/Prizes/Prizes'
import Mentors from '@/components/Mentors/Mentors'
import FAQ from '@/components/FAQ/FAQ'
import Footer from '@/components/Footer/Footer'
import Header from '@/components/Header/Header'
import FloatingElements from '@/components/FloatingElements/FloatingElements'

export default function Home() {
  const router = useRouter()
  const [showLanding, setShowLanding] = useState(false)

  useEffect(() => {
    // Check if user wants to see the landing page (you can add logic here)
    // For now, let's show the landing page by default
    // Comment out the redirect to show the landing page
    
    // Uncomment the line below to redirect to dashboard instead
    // router.replace('/dashboard')
    
    setShowLanding(true)
  }, [router])

  if (!showLanding) {
    // Show loading state while determining what to show
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-t-4 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white text-sm md:text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header />
      <main className="w-full">
        <Hero />
        <About />
        <Schedule />
        <Prizes />
        <Mentors />
        <FAQ />
      </main>
      <Footer />
      <FloatingElements />
    </div>
  )
}
