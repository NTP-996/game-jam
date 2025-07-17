'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { BookOpen, Play, MessageCircle, Download, ExternalLink, Search, Filter, Star, Clock, Users } from 'lucide-react';

const ResourcesPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Resources', icon: <BookOpen className="w-4 h-4" />, count: 42 },
    { id: 'guides', name: 'Game Design Guides', icon: <BookOpen className="w-4 h-4" />, count: 15 },
    { id: 'handbook', name: 'Game Handbook', icon: <Star className="w-4 h-4" />, count: 8 },
    { id: 'videos', name: 'Video Tutorials', icon: <Play className="w-4 h-4" />, count: 12 },
    { id: 'social', name: 'Community Content', icon: <MessageCircle className="w-4 h-4" />, count: 7 }
  ];

  const gameDesignGuides = [
    {
      id: 1,
      title: "Game Design Fundamentals for Blockchain",
      description: "Essential principles for designing engaging blockchain games that players actually want to play.",
      author: "Game Design Team",
      readTime: "15 min read",
      difficulty: "Beginner",
      tags: ["Game Design", "Blockchain", "Fundamentals"],
      downloadUrl: "#",
      featured: true
    },
    {
      id: 2,
      title: "Tokenomics in Game Design",
      description: "How to design sustainable token economies that enhance gameplay rather than extract value.",
      author: "Economics Expert",
      readTime: "20 min read",
      difficulty: "Intermediate",
      tags: ["Tokenomics", "Economy", "Design"],
      downloadUrl: "#"
    },
    {
      id: 3,
      title: "Player Onboarding for Web3 Games",
      description: "Best practices for getting traditional gamers into blockchain gaming without friction.",
      author: "UX Team",
      readTime: "12 min read",
      difficulty: "Beginner",
      tags: ["Onboarding", "UX", "Web3"],
      downloadUrl: "#"
    }
  ];

  const handbookSections = [
    {
      id: 1,
      title: "Complete Game Development Handbook",
      description: "Comprehensive guide covering everything from concept to deployment on Solana.",
      chapters: 12,
      pages: 150,
      downloadUrl: "#",
      featured: true
    },
    {
      id: 2,
      title: "Solana Gaming SDK Reference",
      description: "Technical documentation and code examples for building on Solana.",
      chapters: 8,
      pages: 80,
      downloadUrl: "#"
    },
    {
      id: 3,
      title: "Game Jam Submission Guidelines",
      description: "Everything you need to know about submitting your game to the jam.",
      chapters: 3,
      pages: 25,
      downloadUrl: "#"
    }
  ];

  const videoTutorials = [
    {
      id: 1,
      title: "Building Your First Solana Game",
      description: "Step-by-step tutorial for creating a simple game on Solana blockchain.",
      duration: "45:30",
      instructor: "Lead Developer",
      thumbnail: "/api/placeholder/300/200",
      videoUrl: "#",
      difficulty: "Beginner",
      views: "2.3k"
    },
    {
      id: 2,
      title: "Advanced NFT Integration Techniques",
      description: "Learn how to seamlessly integrate NFTs into your game mechanics.",
      duration: "32:15",
      instructor: "Blockchain Expert",
      thumbnail: "/api/placeholder/300/200",
      videoUrl: "#",
      difficulty: "Advanced",
      views: "1.8k"
    },
    {
      id: 3,
      title: "Optimizing Game Performance on Solana",
      description: "Best practices for ensuring your game runs smoothly on the blockchain.",
      duration: "28:45",
      instructor: "Performance Engineer",
      thumbnail: "/api/placeholder/300/200",
      videoUrl: "#",
      difficulty: "Intermediate",
      views: "1.5k"
    }
  ];

  const socialContent = [
    {
      id: 1,
      type: "tweet",
      author: "Honeycomb Protocol",
      handle: "@honeycomb_prtcl",
      avatar: "/assets/sponsor/honeycomb.jpg",
      content: "🎮 Game development just got 500x cheaper! Our new State-Compression technology is revolutionizing how games are built on Solana. #GameDev #Solana",
      timestamp: "2h ago",
      likes: 245,
      retweets: 89,
      url: "#"
    },
    {
      id: 2,
      type: "tweet",
      author: "Civic",
      handle: "@civickey",
      avatar: "/assets/sponsor/civic.jpg",
      content: "🚀 Skip the wallet setup hassle! Players can now join games with just their Gmail. The future of gaming onboarding is here. #Web3Gaming #CivicAuth",
      timestamp: "4h ago",
      likes: 189,
      retweets: 67,
      url: "#"
    },
    {
      id: 3,
      type: "mentor-tip",
      author: "Senior Game Designer",
      avatar: "/assets/mentors/Belac.svg",
      content: "💡 Pro tip: Focus on gameplay first, blockchain second. The best Web3 games are great games that happen to use blockchain, not blockchain demos with game elements.",
      timestamp: "1 day ago",
      category: "Design Advice"
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
  };

  const renderGuides = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {gameDesignGuides.map((guide) => (
        <div key={guide.id} className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200 ${guide.featured ? 'ring-2 ring-yellow-500/50' : ''}`}>
          {guide.featured && (
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-yellow-400 text-sm font-medium">Featured Guide</span>
            </div>
          )}
          
          <h3 className="text-xl font-bold text-white pixelify-sans mb-3">{guide.title}</h3>
          <p className="text-purple-200 text-sm mb-4 line-clamp-3">{guide.description}</p>
          
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getDifficultyColor(guide.difficulty)}`}>
              {guide.difficulty}
            </span>
            <span className="text-purple-300 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {guide.readTime}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-4">
            {guide.tags.map((tag, idx) => (
              <span key={idx} className="bg-purple-600/50 text-purple-200 px-2 py-1 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-purple-300 text-sm">by {guide.author}</span>
            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderHandbook = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {handbookSections.map((handbook) => (
        <div key={handbook.id} className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200 ${handbook.featured ? 'ring-2 ring-yellow-500/50' : ''}`}>
          {handbook.featured && (
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-yellow-400 text-sm font-medium">Essential Handbook</span>
            </div>
          )}
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white pixelify-sans">{handbook.title}</h3>
              <div className="flex items-center gap-4 text-purple-300 text-sm">
                <span>{handbook.chapters} chapters</span>
                <span>{handbook.pages} pages</span>
              </div>
            </div>
          </div>
          
          <p className="text-purple-200 text-sm mb-6">{handbook.description}</p>
          
          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
            <Download className="w-4 h-4" />
            Download Handbook
          </button>
        </div>
      ))}
    </div>
  );

  const renderVideos = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {videoTutorials.map((video) => (
        <div key={video.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden hover:bg-white/15 transition-all duration-200">
          <div className="relative h-48 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <Play className="w-16 h-16 text-white opacity-80" />
            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
              {video.duration}
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="text-lg font-bold text-white pixelify-sans mb-2">{video.title}</h3>
            <p className="text-purple-200 text-sm mb-4 line-clamp-2">{video.description}</p>
            
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getDifficultyColor(video.difficulty)}`}>
                {video.difficulty}
              </span>
              <span className="text-purple-300 text-xs flex items-center gap-1">
                <Users className="w-3 h-3" />
                {video.views} views
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-purple-300 text-sm">by {video.instructor}</span>
              <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Play className="w-4 h-4" />
                Watch
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSocialContent = () => (
    <div className="space-y-6">
      {socialContent.map((content) => (
        <div key={content.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-purple-600 border-2 border-green-500">
              <Image
                src={content.avatar}
                alt={content.author}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-bold text-white">{content.author}</h4>
                {content.handle && (
                  <span className="text-purple-300 text-sm">{content.handle}</span>
                )}
                <span className="text-purple-400 text-sm">• {content.timestamp}</span>
              </div>
              
              <p className="text-purple-100 mb-4">{content.content}</p>
              
              {content.type === 'tweet' && (
                <div className="flex items-center gap-6 text-purple-300 text-sm">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {content.retweets}
                  </span>
                  <span className="flex items-center gap-1">
                    ❤️ {content.likes}
                  </span>
                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    View Tweet
                  </button>
                </div>
              )}
              
              {content.type === 'mentor-tip' && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mt-3">
                  <span className="text-yellow-400 text-sm font-medium">💡 {content.category}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeCategory) {
      case 'guides': return renderGuides();
      case 'handbook': return renderHandbook();
      case 'videos': return renderVideos();
      case 'social': return renderSocialContent();
      default: 
        return (
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">🌟 Featured Resources</h2>
              {renderGuides()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">📖 Game Handbooks</h2>
              {renderHandbook()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">🎥 Latest Videos</h2>
              {renderVideos()}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="ml-0 lg:ml-64 p-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white pixelify-sans mb-4">
            Game Development Resources
          </h1>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Everything you need to build amazing games on Solana. From design guides to technical tutorials,
            we've got you covered for the Game Jam and beyond.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-purple-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-purple-200 px-4 py-3 rounded-xl border border-white/20 transition-colors">
            <Filter className="w-5 h-5" />
            Filter
          </button>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20'
              }`}
            >
              {category.icon}
              {category.name}
              <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {renderContent()}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white pixelify-sans mb-4">
            Need More Help?
          </h2>
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            Join our Discord community for real-time help, connect with mentors, and collaborate with other developers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105">
              Join Discord Community
            </button>
            <button className="px-8 py-4 border-2 border-purple-400 text-purple-200 rounded-xl font-semibold hover:border-purple-300 hover:text-white hover:bg-purple-600/20 transition-all duration-200">
              Schedule Mentorship
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage; 