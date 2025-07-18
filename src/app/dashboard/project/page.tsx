'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProjectData {
  name: string
  description: string
  category: string
  githubUrl: string
  demoUrl: string
  videoUrl: string
  screenshotUrls: string[]
  gameHostUrl: string
  bannerUrl: string
  logoUrl: string
  techStack: string[]
  teamMembers: string[]
  challenges: string
  features: string[]
  solanaIntegration: string
}

export default function ProjectPage() {
  const [hasSubmission, setHasSubmission] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    description: '',
    category: '',
    githubUrl: '',
    demoUrl: '',
    videoUrl: '',
    screenshotUrls: ['', '', ''],
    gameHostUrl: '',
    bannerUrl: '',
    logoUrl: '',
    techStack: [],
    teamMembers: [],
    challenges: '',
    features: [],
    solanaIntegration: ''
  })

  const existingProject = {
    name: 'SolanaQuest RPG',
    description: 'An immersive blockchain RPG where players own their characters, items, and achievements as NFTs on Solana. Features include turn-based combat, crafting system, and a player-driven economy.',
    category: 'RPG/Adventure',
    status: 'Submitted',
    submittedAt: '2024-12-15',
    githubUrl: 'https://github.com/team/solanaquest-rpg',
    demoUrl: 'https://solanaquest.vercel.app',
    videoUrl: 'https://youtube.com/watch?v=demo',
    gameHostUrl: 'https://solanaquest.vercel.app/play',
    bannerUrl: '/assets/mentors/belac.jpg',
    logoUrl: '/assets/mentors/belac.jpg',
    techStack: ['Unity', 'Rust', 'Solana', 'Anchor', 'React', 'TypeScript'],
    features: [
      'NFT Character System',
      'Blockchain Inventory',
      'Player vs Player Combat',
      'Crafting & Trading',
      'Quest System',
      'Guild Mechanics'
    ],
    screenshots: [
      '/assets/mentors/belac.jpg',
      '/assets/mentors/belac.jpg',
      '/assets/mentors/belac.jpg'
    ]
  }

  const categories = [
    'Action/Adventure',
    'RPG/MMORPG',
    'Strategy',
    'Puzzle',
    'Racing',
    'Sports',
    'Simulation',
    'Casual/Mobile',
    'Educational',
    'Other'
  ]

  const [techStackInput, setTechStackInput] = useState('')

  const handleTechStackChange = (value: string) => {
    setTechStackInput(value)
    // Split by comma, trim whitespace, and filter out empty strings
    const technologies = value.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0)
    setProjectData({...projectData, techStack: technologies})
  }

  const addScreenshotField = () => {
    setProjectData({
      ...projectData,
      screenshotUrls: [...projectData.screenshotUrls, '']
    })
  }

  const updateScreenshotUrl = (index: number, value: string) => {
    const newUrls = [...projectData.screenshotUrls]
    newUrls[index] = value
    setProjectData({
      ...projectData,
      screenshotUrls: newUrls
    })
  }

  const removeScreenshotField = (index: number) => {
    if (projectData.screenshotUrls.length > 1) {
      const newUrls = projectData.screenshotUrls.filter((_, i) => i !== index)
      setProjectData({
        ...projectData,
        screenshotUrls: newUrls
      })
    }
  }

  if (hasSubmission && !isEditing) {
    return (
      <div className="ml-0 lg:ml-64 p-6 transition-all duration-300">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white pixelify-sans mb-2">
                Project Submission
              </h1>
              <p className="text-purple-200">
                Your game has been submitted successfully!
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Edit Submission
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                View Public Page
              </button>
            </div>
          </div>

          {/* Status Banner */}
          <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">✅</div>
              <div>
                <h3 className="text-xl font-bold text-green-400 pixelify-sans">
                  Submission Complete
                </h3>
                <p className="text-green-200">
                  Submitted on {existingProject.submittedAt} • Status: Under Review
                </p>
              </div>
            </div>
          </div>

          {/* Project Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Project Details */}
            <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">
                {existingProject.name}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-purple-300 mb-2">Category</h3>
                  <span className="bg-purple-600/50 text-purple-200 px-3 py-1 rounded-full text-sm">
                    {existingProject.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-purple-300 mb-2">Description</h3>
                  <p className="text-purple-200">{existingProject.description}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-purple-300 mb-2">Key Features</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {existingProject.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-purple-200 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-purple-300 mb-2">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {existingProject.techStack.map((tech) => (
                      <span key={tech} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Links and Media */}
            <div className="space-y-6">
              {/* Quick Links */}
              <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white pixelify-sans mb-4">
                  Project Links
                </h3>
                <div className="space-y-3">
                  <a
                    href={existingProject.gameHostUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🎮</span>
                      <span className="font-semibold">Play Game</span>
                    </div>
                    <span>↗</span>
                  </a>
                  
                  <a
                    href={existingProject.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🌐</span>
                      <span className="font-semibold">Project Demo</span>
                    </div>
                    <span>↗</span>
                  </a>
                  
                  <a
                    href={existingProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">💻</span>
                      <span className="font-semibold">Source Code</span>
                    </div>
                    <span>↗</span>
                  </a>
                  
                  <a
                    href={existingProject.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">📹</span>
                      <span className="font-semibold">Demo Video</span>
                    </div>
                    <span>↗</span>
                  </a>
                </div>
              </div>

              {/* Screenshots */}
              <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white pixelify-sans mb-4">
                  Screenshots
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {existingProject.screenshots.map((screenshot, index) => (
                    <div key={index} className="aspect-video bg-purple-700/30 rounded-lg overflow-hidden">
                      <Image
                        src={screenshot}
                        alt={`Screenshot ${index + 1}`}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submission Timeline */}
          <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white pixelify-sans mb-4">
              Submission Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <div>
                  <p className="text-white font-semibold">Project Submitted</p>
                  <p className="text-purple-300 text-sm">December 15, 2024 at 3:42 PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div>
                  <p className="text-white font-semibold">Under Review</p>
                  <p className="text-purple-300 text-sm">Review in progress by judges</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="text-purple-400 font-semibold">Results Announced</p>
                  <p className="text-purple-300 text-sm">Expected: January 15, 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Submission form
  return (
    <div className="ml-0 lg:ml-64 p-6 transition-all duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white pixelify-sans mb-2">
              {isEditing ? 'Edit Project' : 'Submit Project'}
            </h1>
            <p className="text-purple-200">
              Provide your hosted game links and project details for judging
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
            <span className="text-sm text-purple-300">Project Info</span>
            <span className="text-sm text-purple-300">Game Links</span>
            <span className="text-sm text-purple-300">Media & Assets</span>
            <span className="text-sm text-purple-300">Review & Submit</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">
                Project Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                    placeholder="Enter your game name"
                    value={projectData.name}
                    onChange={(e) => setProjectData({...projectData, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Category *
                  </label>
                  <select 
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
                    value={projectData.category}
                    onChange={(e) => setProjectData({...projectData, category: e.target.value})}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Project Description *
                </label>
                <textarea
                  rows={6}
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="Describe your game, its mechanics, and what makes it unique..."
                  value={projectData.description}
                  onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Solana Integration *
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="Explain how your game uses Solana blockchain technology..."
                  value={projectData.solanaIntegration}
                  onChange={(e) => setProjectData({...projectData, solanaIntegration: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Tech Stack
                </label>
                <p className="text-purple-400 text-sm mb-3">
                  Enter technologies used in your project, separated by commas
                </p>
                <input
                  type="text"
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="Unity, Solana, React, TypeScript, Anchor, Godot, Phaser..."
                  value={techStackInput}
                  onChange={(e) => handleTechStackChange(e.target.value)}
                />
                {projectData.techStack.length > 0 && (
                  <div className="mt-3">
                    <p className="text-purple-300 text-sm mb-2">Technologies ({projectData.techStack.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {projectData.techStack.map((tech, index) => (
                        <span key={index} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">
                Game Links & Hosting
              </h2>

              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-blue-400 mb-3">
                  🌐 Hosting Information
                </h3>
                <p className="text-blue-200 mb-3">
                  Your game should be hosted online and accessible via browser. Popular hosting options include:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-blue-600/20 rounded p-2 text-center">
                    <div className="font-semibold text-blue-300">Vercel</div>
                    <div className="text-blue-400">vercel.app</div>
                  </div>
                  <div className="bg-blue-600/20 rounded p-2 text-center">
                    <div className="font-semibold text-blue-300">Netlify</div>
                    <div className="text-blue-400">netlify.app</div>
                  </div>
                  <div className="bg-blue-600/20 rounded p-2 text-center">
                    <div className="font-semibold text-blue-300">GitHub Pages</div>
                    <div className="text-blue-400">github.io</div>
                  </div>
                  <div className="bg-blue-600/20 rounded p-2 text-center">
                    <div className="font-semibold text-blue-300">Itch.io</div>
                    <div className="text-blue-400">itch.io</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Game Play URL *
                </label>
                <input
                  type="url"
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="https://yourgame.vercel.app/play"
                  value={projectData.gameHostUrl}
                  onChange={(e) => setProjectData({...projectData, gameHostUrl: e.target.value})}
                />
                <p className="text-purple-400 text-xs mt-1">
                  Direct link to play your game (this should work in any modern browser)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Project Demo URL
                </label>
                <input
                  type="url"
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="https://yourgame.vercel.app"
                  value={projectData.demoUrl}
                  onChange={(e) => setProjectData({...projectData, demoUrl: e.target.value})}
                />
                <p className="text-purple-400 text-xs mt-1">
                  Landing page or project showcase (can be the same as game URL)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  GitHub Repository *
                </label>
                <input
                  type="url"
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="https://github.com/username/your-game"
                  value={projectData.githubUrl}
                  onChange={(e) => setProjectData({...projectData, githubUrl: e.target.value})}
                />
                <p className="text-purple-400 text-xs mt-1">
                  Public GitHub repository with your game's source code
                </p>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="text-yellow-400 font-semibold mb-2">⚠️ Important Notes:</h4>
                <ul className="text-yellow-200 text-sm space-y-1">
                  <li>• Your game must be playable directly in a web browser</li>
                  <li>• Ensure all links are publicly accessible (not behind authentication)</li>
                  <li>• Test your game URL in an incognito/private browser window</li>
                  <li>• GitHub repository must be public for judges to review</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">
                Media & Assets
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Game Banner URL *
                  </label>
                  <input
                    type="url"
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                    placeholder="https://imgur.com/banner.png"
                    value={projectData.bannerUrl}
                    onChange={(e) => setProjectData({...projectData, bannerUrl: e.target.value})}
                  />
                  <p className="text-purple-400 text-xs mt-1">
                    Wide banner image (1920x1080 or 16:9 ratio recommended)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Game Logo URL *
                  </label>
                  <input
                    type="url"
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                    placeholder="https://imgur.com/logo.png"
                    value={projectData.logoUrl}
                    onChange={(e) => setProjectData({...projectData, logoUrl: e.target.value})}
                  />
                  <p className="text-purple-400 text-xs mt-1">
                    Square logo image (512x512 recommended, transparent background preferred)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Demo Video URL *
                </label>
                <input
                  type="url"
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  value={projectData.videoUrl}
                  onChange={(e) => setProjectData({...projectData, videoUrl: e.target.value})}
                />
                <p className="text-purple-400 text-xs mt-1">
                  2-5 minute video showcasing your game (YouTube, Vimeo, or other video platform)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Screenshot URLs *
                </label>
                <p className="text-purple-400 text-sm mb-3">
                  Provide direct image URLs (imgur, GitHub, or image hosting service). At least 3 screenshots required.
                </p>
                <div className="space-y-3">
                  {projectData.screenshotUrls.map((url, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="url"
                        className="flex-1 bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                        placeholder={`https://imgur.com/screenshot${index + 1}.png`}
                        value={url}
                        onChange={(e) => updateScreenshotUrl(index, e.target.value)}
                      />
                      {projectData.screenshotUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeScreenshotField(index)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addScreenshotField}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    + Add Another Screenshot
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Challenges & Solutions
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="What challenges did you face during development and how did you solve them?"
                  value={projectData.challenges}
                  onChange={(e) => setProjectData({...projectData, challenges: e.target.value})}
                />
              </div>

              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
                <h4 className="text-purple-300 font-semibold mb-2">💡 Tips for Great Visual Assets:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="text-purple-200 font-medium mb-2">Banner & Logo:</h5>
                    <ul className="text-purple-200 space-y-1">
                      <li>• Banner: Use 16:9 ratio (1920x1080 ideal)</li>
                      <li>• Logo: Square format (512x512 recommended)</li>
                      <li>• PNG format with transparent backgrounds preferred</li>
                      <li>• High contrast for readability in catalogues</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-purple-200 font-medium mb-2">Screenshots:</h5>
                    <ul className="text-purple-200 space-y-1">
                      <li>• Show gameplay in action, not menus</li>
                      <li>• Include UI elements and game features</li>
                      <li>• Showcase your Solana integration</li>
                      <li>• Upload to imgur.com or GitHub for hosting</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">
                Review & Submit
              </h2>
              
              <div className="bg-purple-700/30 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Project Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-purple-300 text-sm">Project Name</p>
                    <p className="text-white font-semibold">{projectData.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Category</p>
                    <p className="text-white font-semibold">{projectData.category || 'Not selected'}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Game URL</p>
                    <p className="text-white font-semibold break-all">{projectData.gameHostUrl || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Tech Stack</p>
                    <p className="text-white font-semibold">{projectData.techStack.length} technologies selected</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Banner Image</p>
                    <p className="text-white font-semibold">{projectData.bannerUrl ? '✓ Provided' : 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Logo Image</p>
                    <p className="text-white font-semibold">{projectData.logoUrl ? '✓ Provided' : 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6">
                <h3 className="text-lg font-bold text-yellow-400 mb-3">
                  ⚠️ Before Submitting
                </h3>
                <ul className="space-y-2 text-yellow-200">
                  <li>• Test your game URL in a private browser window to ensure it works</li>
                  <li>• Verify all links are working and publicly accessible</li>
                  <li>• Confirm your GitHub repository is public and contains your code</li>
                  <li>• Check that your demo video clearly shows gameplay and Solana features</li>
                  <li>• Ensure your banner and logo images display correctly and are high quality</li>
                  <li>• Verify all screenshot URLs display correctly</li>
                  <li>• Ensure your Solana integration is properly documented in your README</li>
                </ul>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  className="text-blue-500 bg-purple-900 border-purple-500"
                />
                <label htmlFor="terms" className="text-purple-200">
                  I confirm that this project was built during the hackathon period and complies with all rules
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
                onClick={() => setHasSubmission(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                🚀 Submit Project
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 