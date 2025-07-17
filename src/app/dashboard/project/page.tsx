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
  screenshots: File[]
  gameFile: File | null
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
    screenshots: [],
    gameFile: null,
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

  const techOptions = [
    'Unity', 'Unreal Engine', 'Rust', 'Solana', 'Anchor', 'React', 'TypeScript',
    'JavaScript', 'Python', 'C#', 'C++', 'WebGL', 'Node.js', 'Next.js'
  ]

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
                    href={existingProject.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🎮</span>
                      <span className="font-semibold">Play Demo</span>
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
              Upload your game and provide project details for judging
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
            <span className="text-sm text-purple-300">Game Files</span>
            <span className="text-sm text-purple-300">Media & Links</span>
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
                <div className="grid grid-cols-4 gap-3">
                  {techOptions.map((tech) => (
                    <label key={tech} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="text-blue-500 bg-purple-900 border-purple-500"
                        checked={projectData.techStack.includes(tech)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProjectData({...projectData, techStack: [...projectData.techStack, tech]})
                          } else {
                            setProjectData({...projectData, techStack: projectData.techStack.filter(t => t !== tech)})
                          }
                        }}
                      />
                      <span className="text-purple-200 text-sm">{tech}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">
                Game Files & Assets
              </h2>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Game Build File *
                </label>
                <div className="border-2 border-dashed border-purple-500/50 rounded-lg p-8 text-center">
                  <div className="text-4xl mb-4">🎮</div>
                  <p className="text-white font-semibold mb-2">Upload your game build</p>
                  <p className="text-purple-300 text-sm mb-4">
                    Accepted formats: .zip, .rar, .tar.gz (max 500MB)
                  </p>
                  <input
                    type="file"
                    accept=".zip,.rar,.tar.gz"
                    className="hidden"
                    id="game-file"
                  />
                  <label
                    htmlFor="game-file"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Screenshots *
                </label>
                <div className="border-2 border-dashed border-purple-500/50 rounded-lg p-8 text-center">
                  <div className="text-4xl mb-4">📸</div>
                  <p className="text-white font-semibold mb-2">Upload game screenshots</p>
                  <p className="text-purple-300 text-sm mb-4">
                    At least 3 screenshots (PNG, JPG - max 10MB each)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="screenshots"
                  />
                  <label
                    htmlFor="screenshots"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-colors"
                  >
                    Choose Images
                  </label>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">
                Links & Media
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    GitHub Repository *
                  </label>
                  <input
                    type="url"
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                    placeholder="https://github.com/..."
                    value={projectData.githubUrl}
                    onChange={(e) => setProjectData({...projectData, githubUrl: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                    placeholder="https://yourgame.com"
                    value={projectData.demoUrl}
                    onChange={(e) => setProjectData({...projectData, demoUrl: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Demo Video URL
                </label>
                <input
                  type="url"
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="https://youtube.com/watch?v=..."
                  value={projectData.videoUrl}
                  onChange={(e) => setProjectData({...projectData, videoUrl: e.target.value})}
                />
                <p className="text-purple-400 text-xs mt-1">
                  Upload a 2-5 minute video showcasing your game
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Challenges & Solutions
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-purple-400"
                  placeholder="What challenges did you face and how did you solve them?"
                  value={projectData.challenges}
                  onChange={(e) => setProjectData({...projectData, challenges: e.target.value})}
                />
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
                </div>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6">
                <h3 className="text-lg font-bold text-yellow-400 mb-3">
                  ⚠️ Before Submitting
                </h3>
                <ul className="space-y-2 text-yellow-200">
                  <li>• Ensure your game build is functional and playable</li>
                  <li>• Verify all links are working and accessible</li>
                  <li>• Double-check that your GitHub repository is public</li>
                  <li>• Make sure your demo video clearly shows gameplay</li>
                  <li>• Confirm your Solana integration is properly documented</li>
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