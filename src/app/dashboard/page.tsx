'use client'

import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import About from "@/components/About/About";
import Prizes from "@/components/Prizes/Prizes";
import Schedule from "@/components/Schedule/Schedule";
import Mentors from "@/components/Mentors/Mentors";
import FAQ from "@/components/FAQ/FAQ";
import Footer from "@/components/Footer/Footer";
import DashboardCard from '@/components/dashboard/DashboardCard'
import QuickActions from '@/components/dashboard/QuickActions'
import RecentActivity from '@/components/dashboard/RecentActivity'
import Image from "next/image";

export default function DashboardHomePage() {
  // Dashboard state
  const user = {
    name: 'Developer',
    avatar: '/assets/mentors/belac.jpg',
    role: 'Participant',
    team: null,
    projectSubmitted: false
  }

  const stats = {
    daysRemaining: 14,
    totalParticipants: 2847,
    teamsFormed: 642,
    projectsSubmitted: 156
  }

  return (
    <div className="ml-0 lg:ml-64 transition-all duration-300">      
      <main className="main">
        <Hero />
        <About />
        
        {/* Tracks Section */}
        <section id="tracks" className="section text-center">
          <div className="section__title">
            <Image
              src="/assets/highlight/tracks.svg"
              alt="Game Development Tracks"
              width={800}
              height={150}
            />
          </div>
        </section>

        <Prizes />
        <Schedule />
        <Mentors />

        {/* CTA Section */}
        <section id="cta" className="section">
          <div className="cta__content">
            <div className="hero__date">
              <Image
                src="/assets/text/event-date.svg"
                alt="JUNE 23 - JULY 25, 2025"
                width={500}
                height={80}
              />
            </div>
            <div className="hero__title">
              <Image
                src="/assets/text/Solana Game Jam_.svg"
                alt="SOLANA GAME JAM"
                className="hero__title-main"
                width={900}
                height={180}
              />
              <Image
                src="/assets/text/APAC.svg"
                alt="APAC"
                className="hero__title-sub"
                width={350}
                height={120}
              />
            </div>
            <p className="hero__description">
              Dive into the largest Solana Game Jam, covering the APAC gaming
              market through its local Superteams
            </p>
            <div className="cta__buttons">
              <a
                href="https://airtable.com/appVdfAJVyAXnTTrb/pagu9mFlefjKeY2Lg/form"
                className="btn btn--register-large"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Register for Solana Game Jam"
              >
                <Image
                  src="/assets/Buttons/register-low.svg"
                  alt="REGISTER NOW"
                  className="btn__image"
                  width={272}
                  height={80}
                />
              </a>

              <a
                href="https://discord.gg/yB5vWmSkAY"
                className="btn btn--register-large"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join Discord"
              >
                <Image
                  src="/assets/Buttons/discord.svg"
                  alt="JOIN DISCORD"
                  className="btn__image"
                  width={272}
                  height={80}
                />
              </a>
            </div>
          </div>
        </section>

        <FAQ />

        {/* Dashboard Overview Section - Commented out for now
        <section id="dashboard-overview" className="section">
          <div className="container">
            <div className="space-y-8 max-w-7xl mx-auto px-4">
              Welcome Header
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-4xl font-bold text-white pixelify-sans">
                  Your Dashboard
                </h2>
                <p className="text-purple-200 text-lg max-w-2xl mx-auto">
                  Track your progress, manage your team, and stay updated with the latest hackathon information
                </p>
              </div>

              Personal Welcome
              <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white pixelify-sans mb-2">
                      Welcome back, {user.name}!
                    </h3>
                    <p className="text-purple-200">
                      Ready to build the future of gaming on Solana?
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-purple-300">Hackathon Status</p>
                      <p className="text-lg font-bold text-green-400">Active</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-purple-600 border-2 border-green-400 overflow-hidden">
                      <Image
                        src={user.avatar}
                        alt="Profile"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              Stats Grid, Quick Actions, Recent Activity, Announcements sections...
            </div>
          </div>
        </section>
        */}
      </main>

      <Footer />
    </div>
  );
} 