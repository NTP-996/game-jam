'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ApplicationData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  github: string
  twitter: string
  discord: string
  country: string
  timezone: string
  // Experience
  experience: string
  solanaExperience: string
  gameDevExperience: string
  previousHackathons: string
  portfolio: string
  // Project Interests
  preferredTrack: string
  projectIdea: string
  teamPreference: string
  skills: string[]
  // Additional
  motivation: string
  availability: string
  agreeToTerms: boolean
}

export default function ApplicationPage() {
  const [hasApplication, setHasApplication] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const [applicationData, setApplicationData] = useState<ApplicationData>({
    firstName: '',
    lastName: '',
    email: '',
    github: '',
    twitter: '',
    discord: '',
    country: '',
    timezone: '',
    experience: '',
    solanaExperience: '',
    gameDevExperience: '',
    previousHackathons: '',
    portfolio: '',
    preferredTrack: '',
    projectIdea: '',
    teamPreference: '',
    skills: [],
    motivation: '',
    availability: '',
    agreeToTerms: false
  })

  const existingApplication = {
    status: 'Approved',
    submittedAt: '2024-12-10',
    reviewedAt: '2024-12-12',
    firstName: 'Alex',
    lastName: 'Chen',
    email: 'alex.chen@example.com',
    github: 'alexchen',
    country: 'Singapore',
    experience: 'Senior',
    preferredTrack: 'Gaming',
    skills: ['Unity', 'Rust', 'Solana', 'Smart Contracts', 'Game Design']
  }

  const tracks = [
    'Gaming & Entertainment',
    'DeFi & Trading',
    'NFT & Digital Assets',
    'Infrastructure & Tooling',
    'Social & Community',
    'Mobile & Consumer Apps'
  ]

  const experienceLevels = [
    'Beginner (0-1 years)',
    'Intermediate (2-3 years)',
    'Advanced (4-5 years)',
    'Senior (6+ years)'
  ]

  const skillOptions = [
    'Rust', 'Solana', 'Anchor', 'Unity', 'Unreal Engine', 'React', 'TypeScript',
    'JavaScript', 'Python', 'C#', 'C++', 'Game Design', 'UI/UX Design',
    'Smart Contracts', 'Web3', 'Blockchain', 'Backend', 'Frontend', 'Mobile'
  ]

  const countries = [
    'Singapore', 'Malaysia', 'Indonesia', 'Thailand', 'Philippines', 'Vietnam',
    'India', 'Australia', 'Japan', 'South Korea', 'Taiwan', 'Hong Kong', 'Other'
  ]

  if (hasApplication && !isEditing) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white pixelify-sans mb-2">
              My Application
            </h1>
            <p className="text-purple-200">
              Your hackathon application has been approved!
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Edit Application
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Download Certificate
            </button>
          </div>
        </div>

        {/* Status Banner */}
        <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">🎉</div>
            <div>
              <h3 className="text-xl font-bold text-green-400 pixelify-sans">
                Application Approved
              </h3>
              <p className="text-green-200">
                Submitted on {existingApplication.submittedAt} • Approved on {existingApplication.reviewedAt}
              </p>
            </div>
          </div>
        </div>

        {/* Application Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Info */}
          <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">
              Personal Information
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-purple-300 mb-1">Name</h3>
                  <p className="text-white">{existingApplication.firstName} {existingApplication.lastName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-purple-300 mb-1">Country</h3>
                  <p className="text-white">{existingApplication.country}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-purple-300 mb-1">Email</h3>
                <p className="text-white">{existingApplication.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-purple-300 mb-1">GitHub</h3>
                <a 
                  href={`https://github.com/${existingApplication.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  @{existingApplication.github}
                </a>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-purple-300 mb-1">Experience Level</h3>
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                  {existingApplication.experience}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-purple-300 mb-1">Preferred Track</h3>
                <span className="bg-purple-600/50 text-purple-200 px-3 py-1 rounded-full text-sm">
                  {existingApplication.preferredTrack}
                </span>
              </div>
            </div>
          </div>

          {/* Skills & Next Steps */}
          <div className="space-y-6">
            {/* Skills */}
            <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white pixelify-sans mb-4">
                Skills & Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {existingApplication.skills.map((skill) => (
                  <span key={skill} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-400 pixelify-sans mb-4">
                What's Next?
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">Application approved</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-yellow-400">→</span>
                  <span className="text-white">Form or join a team</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-purple-400">○</span>
                  <span className="text-purple-300">Start building your project</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-purple-400">○</span>
                  <span className="text-purple-300">Submit final project</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Dates */}
        <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white pixelify-sans mb-4">
            Important Dates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-purple-700/30 rounded-lg">
              <div className="text-2xl mb-2">🚀</div>
              <h4 className="text-white font-semibold">Hackathon Starts</h4>
              <p className="text-purple-300 text-sm">December 20, 2024</p>
            </div>
            <div className="text-center p-4 bg-yellow-500/20 rounded-lg">
              <div className="text-2xl mb-2">⏰</div>
              <h4 className="text-white font-semibold">Team Formation Deadline</h4>
              <p className="text-purple-300 text-sm">December 22, 2024</p>
            </div>
            <div className="text-center p-4 bg-red-500/20 rounded-lg">
              <div className="text-2xl mb-2">📤</div>
              <h4 className="text-white font-semibold">Submission Deadline</h4>
              <p className="text-purple-300 text-sm">January 10, 2025</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Application form
  return (
    <div className="ml-0 lg:ml-64 p-6 transition-all duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white pixelify-sans mb-2">
              {isEditing ? 'Edit Application' : 'Hackathon Application'}
            </h1>
            <p className="text-purple-200">
              Apply to participate in the Solana Game Jam APAC
            </p>
          </div>
          {isEditing && (
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep > i + 1 
                    ? 'bg-green-500 text-white' 
                    : currentStep === i + 1 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-purple-600 text-purple-300'
                }`}>
                  {currentStep > i + 1 ? '✓' : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`w-16 h-1 mx-4 ${
                    currentStep > i + 1 ? 'bg-green-500' : 'bg-purple-600'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <span className="text-sm text-purple-300">Personal Info</span>
            <span className="text-sm text-purple-300">Experience</span>
            <span className="text-sm text-purple-300">Project Interest</span>
            <span className="text-sm text-purple-300">Review & Submit</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                    placeholder="Enter your first name"
                    value={applicationData.firstName}
                    onChange={(e) => setApplicationData({...applicationData, firstName: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                    placeholder="Enter your last name"
                    value={applicationData.lastName}
                    onChange={(e) => setApplicationData({...applicationData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="your.email@example.com"
                  value={applicationData.email}
                  onChange={(e) => setApplicationData({...applicationData, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Country *
                  </label>
                  <select 
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
                    value={applicationData.country}
                    onChange={(e) => setApplicationData({...applicationData, country: e.target.value})}
                  >
                    <option value="">Select country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Timezone
                  </label>
                  <input
                    type="text"
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                    placeholder="e.g., UTC+8"
                    value={applicationData.timezone}
                    onChange={(e) => setApplicationData({...applicationData, timezone: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    GitHub Username *
                  </label>
                  <input
                    type="text"
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                    placeholder="yourusername"
                    value={applicationData.github}
                    onChange={(e) => setApplicationData({...applicationData, github: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Twitter Handle
                  </label>
                  <input
                    type="text"
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                    placeholder="@yourusername"
                    value={applicationData.twitter}
                    onChange={(e) => setApplicationData({...applicationData, twitter: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Discord Username
                  </label>
                  <input
                    type="text"
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                    placeholder="username#1234"
                    value={applicationData.discord}
                    onChange={(e) => setApplicationData({...applicationData, discord: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">
                Experience & Background
              </h2>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Overall Development Experience *
                </label>
                <select 
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
                  value={applicationData.experience}
                  onChange={(e) => setApplicationData({...applicationData, experience: e.target.value})}
                >
                  <option value="">Select experience level</option>
                  {experienceLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Solana Development Experience
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="Describe your experience with Solana, smart contracts, or blockchain development..."
                  value={applicationData.solanaExperience}
                  onChange={(e) => setApplicationData({...applicationData, solanaExperience: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Game Development Experience
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="Tell us about your game development background..."
                  value={applicationData.gameDevExperience}
                  onChange={(e) => setApplicationData({...applicationData, gameDevExperience: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Previous Hackathons
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="List any hackathons you've participated in and your achievements..."
                  value={applicationData.previousHackathons}
                  onChange={(e) => setApplicationData({...applicationData, previousHackathons: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Portfolio/Project Links
                </label>
                <input
                  type="url"
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="https://yourportfolio.com or link to your best project"
                  value={applicationData.portfolio}
                  onChange={(e) => setApplicationData({...applicationData, portfolio: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Skills & Technologies *
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {skillOptions.map((skill) => (
                    <label key={skill} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="text-blue-500 bg-purple-900 border-purple-500"
                        checked={applicationData.skills.includes(skill)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setApplicationData({...applicationData, skills: [...applicationData.skills, skill]})
                          } else {
                            setApplicationData({...applicationData, skills: applicationData.skills.filter(s => s !== skill)})
                          }
                        }}
                      />
                      <span className="text-purple-200 text-sm">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">
                Project Interest & Goals
              </h2>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Preferred Track *
                </label>
                <select 
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
                  value={applicationData.preferredTrack}
                  onChange={(e) => setApplicationData({...applicationData, preferredTrack: e.target.value})}
                >
                  <option value="">Select preferred track</option>
                  {tracks.map((track) => (
                    <option key={track} value={track}>{track}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Project Idea (Optional)
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="Do you have a project idea in mind? Describe it here..."
                  value={applicationData.projectIdea}
                  onChange={(e) => setApplicationData({...applicationData, projectIdea: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Team Preference *
                </label>
                <select 
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
                  value={applicationData.teamPreference}
                  onChange={(e) => setApplicationData({...applicationData, teamPreference: e.target.value})}
                >
                  <option value="">Select preference</option>
                  <option value="solo">Work solo</option>
                  <option value="existing">Join existing team</option>
                  <option value="form">Form new team</option>
                  <option value="any">Open to any option</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Motivation & Goals *
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="Why do you want to participate? What do you hope to achieve?"
                  value={applicationData.motivation}
                  onChange={(e) => setApplicationData({...applicationData, motivation: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Availability *
                </label>
                <select 
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
                  value={applicationData.availability}
                  onChange={(e) => setApplicationData({...applicationData, availability: e.target.value})}
                >
                  <option value="">Select availability</option>
                  <option value="full-time">Full-time (40+ hours/week)</option>
                  <option value="part-time">Part-time (20-40 hours/week)</option>
                  <option value="weekend">Weekends only</option>
                  <option value="limited">Limited (&lt; 20 hours/week)</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">
                Review & Submit
              </h2>
              
              <div className="bg-purple-700/30 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Application Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-purple-300 text-sm">Name</p>
                    <p className="text-white font-semibold">
                      {applicationData.firstName} {applicationData.lastName || 'Last Name'}
                    </p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Country</p>
                    <p className="text-white font-semibold">{applicationData.country || 'Not selected'}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Experience</p>
                    <p className="text-white font-semibold">{applicationData.experience || 'Not selected'}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Preferred Track</p>
                    <p className="text-white font-semibold">{applicationData.preferredTrack || 'Not selected'}</p>
                  </div>
                </div>
                
                {applicationData.skills.length > 0 && (
                  <div className="mt-4">
                    <p className="text-purple-300 text-sm mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {applicationData.skills.map((skill) => (
                        <span key={skill} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-400 mb-3">
                  📋 Application Requirements
                </h3>
                <ul className="space-y-2 text-blue-200">
                  <li>• All required fields must be completed</li>
                  <li>• Valid GitHub profile is mandatory</li>
                  <li>• Applications are reviewed within 48 hours</li>
                  <li>• You'll receive email confirmation upon approval</li>
                  <li>• Team formation begins after approval</li>
                </ul>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  className="text-blue-500 bg-purple-900 border-purple-500"
                  checked={applicationData.agreeToTerms}
                  onChange={(e) => setApplicationData({...applicationData, agreeToTerms: e.target.checked})}
                />
                <label htmlFor="terms" className="text-purple-200">
                  I agree to the hackathon terms and conditions, code of conduct, and privacy policy
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-purple-500/30">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="bg-purple-700 hover:bg-purple-600 disabled:bg-purple-800 disabled:text-purple-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Previous
            </button>
            
            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={() => setHasApplication(true)}
                disabled={!applicationData.agreeToTerms}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                🚀 Submit Application
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 