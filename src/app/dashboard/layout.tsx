import type { Metadata } from 'next'
import DashboardNav from '@/components/dashboard/DashboardNav'
import ProfileButton from '@/components/ProfileButton'
import FloatingElements from '@/components/FloatingElements/FloatingElements'

export const metadata: Metadata = {
  title: 'Dashboard - Solana Game Jam APAC',
  description: 'Manage your hackathon journey - teams, projects, and submissions',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden">
      <FloatingElements />
      
      <div className="relative z-10 flex">
        <DashboardNav />
        
        <main className="flex-1">
          {children}
        </main>
      </div>
      
      {/* Profile Button */}
      <ProfileButton />
    </div>
  )
} 