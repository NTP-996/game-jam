'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { BookOpen, Play, MessageCircle, Download, ExternalLink, Search, Filter, Star, Clock, Users, Code, Zap, Trophy } from 'lucide-react';

const ResourcesPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Resources', icon: <BookOpen className="w-4 h-4" />, count: 25 },
    { id: 'guides', name: 'Official Guides', icon: <BookOpen className="w-4 h-4" />, count: 1 },
    { id: 'jonas', name: 'SolPlay Jonas Resources', icon: <Star className="w-4 h-4" />, count: 15 },
    { id: 'videos', name: 'Video Tutorials', icon: <Play className="w-4 h-4" />, count: 1 },
    { id: 'obelisk', name: 'Obelisk Protocol Videos', icon: <Play className="w-4 h-4" />, count: 2 },
    { id: 'superteamvn', name: 'SuperteamVN Live Sessions', icon: <Play className="w-4 h-4" />, count: 4 },
    { id: 'social', name: 'Community Content', icon: <MessageCircle className="w-4 h-4" />, count: 3 }
  ];

  const gameDesignGuides = [
    {
      id: 1,
      title: "Official Solana Game Development Guide",
      description: "The complete official guide from Solana.com covering everything you need to get started with game development on Solana.",
      author: "Solana Foundation",
      readTime: "30 min read",
      difficulty: "Beginner",
      tags: ["Official", "Solana", "Getting Started"],
      downloadUrl: "https://solana.com/de/developers/guides/games/getting-started-with-game-development",
      featured: true,
      isExternal: true
    }
  ];

  const handbookSections: any[] = [];

  // Helper function to extract YouTube video ID and get thumbnail
  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "/api/placeholder/300/200";
  };

  const videoTutorials = [
    {
      id: 1,
      title: "Game Jam Workshop Series (Complete Playlist)",
      description: "Complete workshop series from last year's Game Jam covering all aspects of Solana game development.",
      duration: "Playlist",
      instructor: "Game Jam Experts",
      thumbnail: getYouTubeThumbnail("https://www.youtube.com/watch?v=WoEZAsSjN2g&list=PL_KwIUlXHzRJxNybaxuuK3RK6kDr-lo77"),
      videoUrl: "https://www.youtube.com/watch?v=WoEZAsSjN2g&list=PL_KwIUlXHzRJxNybaxuuK3RK6kDr-lo77",
      difficulty: "All Levels",
      views: "5.2k",
      featured: true
    }
  ];

  const jonasResources = {
    sdks: [
      {
        name: "Solana Unity SDK",
        description: "Feature-complete SDK with full RPC coverage, Anchor C# client generator, reliable WebSocket connections, Metaplex NFT and candy machine support directly in Unity Editor.",
        url: "https://docs.magicblock.gg/pages/tools/solana-unity-sdk/overview",
        category: "Unity"
      },
      {
        name: "Godot Solana SDK",
        description: "Rising game engine with a great Solana SDK, perfect for indie developers looking for an open-source alternative.",
        url: "https://github.com/Virus-Axel/godot-solana-sdk",
        category: "Godot"
      },
      {
        name: "Solana Phaser Template",
        description: "Great Phaser preset with upcoming Privy wallet support, perfect for vibe coding and quick prototypes.",
        url: "https://github.com/Bread-Heads-NFT/solana-phaser-template",
        category: "Web"
      },
      {
        name: "Turbo Rust Game Engine",
        description: "Lightweight game engine that lets you build and deploy Solana Rust games directly in the browser. Capable of on-chain games!",
        url: "https://turbo.computer",
        category: "Rust"
      },
      {
        name: "Honeycomb Protocol SDK",
        description: "Simplifies game development with no need to write contracts and dramatically reduces on-chain fees (~500x) via State-Compression. Supports Unity, Unreal, Godot with simple JS/TS SDK.",
        url: "https://docs.honeycombprotocol.com/",
        category: "Multi-Engine"
      }
    ],
    videos: [
      {
        title: "Godot Solana SDK Tutorial",
        url: "https://youtu.be/FKwTus8xc2s?si=Bcg9_-D1rQ4gQqwn",
        description: "Complete tutorial for getting started with Godot and Solana"
      },
      {
        title: "RubiansVR Channel",
        url: "https://youtube.com/@RubiansVR",
        description: "Comprehensive Solana game development tutorials"
      },
      {
        title: "Advanced Solana Gaming",
        url: "https://youtu.be/0ZaUaKuQCm0?si=cCWV942kPiY2xJtb",
        description: "Deep dive into advanced Solana gaming concepts"
      },
      {
        title: "Energy System Tutorial",
        url: "https://youtube.com/watch?v=YYQtRCXJBgs&t=3s&ab_channel=Solana",
        description: "Learn how to implement energy systems in Solana games"
      },
      {
        title: "Session Keys Implementation",
        url: "https://youtube.com/watch?v=oKvWZoybv7Y&ab_channel=Solana",
        description: "Master session keys for seamless gaming experiences"
      },
      {
        title: "Games Workshop from Last Hackathon",
        url: "https://youtube.com/watch?v=zWvpivvrX1M&t=1s&ab_channel=JonasHahn",
        description: "Complete workshop covering game development from previous hackathon"
      }
    ],
    tools: [
      {
        name: "Honeycomb Protocol",
        description: "Generic data compression perfect for games with functionality for loot boxes, guilds, tokens, and player profiles.",
        url: "https://docs.honeycombprotocol.com"
      },
      {
        name: "Helium TukTuk",
        description: "Automation tool perfect for idle games and automated game mechanics.",
        url: "https://github.com/helium/tuktuk"
      },
      {
        name: "Proof Network",
        description: "Proofable JavaScript backend for Solana games, just released and actively maintained.",
        url: "https://proofnetwork.lol"
      }
    ],
    examples: [
      {
        name: "Solana Game Examples",
        description: "Official collection of game development examples and tutorials",
        url: "https://github.com/solana-developers/solana-game-examples"
      },
      {
        name: "Solana 2048 Demo",
        description: "Live demo showcasing Solana game mechanics",
        url: "https://solplay.de/solana-2048/"
      },
      {
        name: "Past Game Jam Submissions",
        description: "Open source submissions from previous Solana game jams",
        url: "https://itch.io/jam/solana-speedrun-3/entries"
      }
    ],
    opportunities: [] as Array<{
      name: string;
      description: string;
      url: string;
    }>
  };

  const obeliskVideos = [
    {
      id: 1,
      title: "Obelisk Protocol Development Tutorial",
      description: "Learn how to build with Obelisk Protocol for Web3 game development and AI-native development approaches.",
      duration: "~21:30",
      instructor: "Obelisk Protocol Team",
      thumbnail: getYouTubeThumbnail("https://www.youtube.com/watch?v=SL2SVWUY9OY&t=1290s"),
      videoUrl: "https://www.youtube.com/watch?v=SL2SVWUY9OY&t=1290s",
      difficulty: "Intermediate",
      views: "1.2k"
    },
    {
      id: 2,
      title: "Advanced Obelisk Protocol Techniques",
      description: "Deep dive into advanced features and development patterns with Obelisk Protocol for game development.",
      duration: "Various",
      instructor: "Obelisk Protocol Team",
      thumbnail: getYouTubeThumbnail("https://www.youtube.com/watch?v=CJzLwq4htCc&t=1s"),
      videoUrl: "https://www.youtube.com/watch?v=CJzLwq4htCc&t=1s",
      difficulty: "Advanced",
      views: "890"
    }
  ];

  const superteamVNVideos = [
    {
      id: 1,
      title: "SuperteamVN Game Jam Live Session #1",
      description: "Official SuperteamVN live broadcast covering game development fundamentals and jam preparation.",
      duration: "Live",
      instructor: "SuperteamVN Team",
      thumbnail: "/api/placeholder/300/200",
      videoUrl: "https://x.com/i/broadcasts/1OyJALDgBkOGb",
      difficulty: "All Levels",
      views: "Live"
    },
    {
      id: 2,
      title: "SuperteamVN Game Jam Live Session #2",
      description: "Second official live session focusing on advanced game mechanics and Solana integration.",
      duration: "Live",
      instructor: "SuperteamVN Team",
      thumbnail: "/api/placeholder/300/200",
      videoUrl: "https://x.com/i/broadcasts/1eaKbWNWvdkGX",
      difficulty: "Intermediate",
      views: "Live"
    },
    {
      id: 3,
      title: "SuperteamVN Game Jam Live Session #3",
      description: "Third live session covering project showcase and development best practices.",
      duration: "Live",
      instructor: "SuperteamVN Team",
      thumbnail: "/api/placeholder/300/200",
      videoUrl: "https://x.com/i/broadcasts/1lPJqMBQbRwJb",
      difficulty: "All Levels",
      views: "Live"
    },
    {
      id: 4,
      title: "SuperteamVN Game Jam Live Session #4",
      description: "Final live session with project demos, feedback, and community discussions.",
      duration: "Live",
      instructor: "SuperteamVN Team",
      thumbnail: "/api/placeholder/300/200",
      videoUrl: "https://x.com/i/broadcasts/1mrGmPkzdvqKy",
      difficulty: "All Levels",
      views: "Live"
    }
  ];

  const socialContent = [
    {
      id: 1,
      type: "tweet",
      author: "PlaySolana",
      handle: "@playsolana",
      avatar: "/assets/sponsor/PlaySolana.png",
      content: "🎮 Ready to build the next generation of console games? Our PSG1 console SDK makes it easy to create amazing gaming experiences on Solana. #GameDev #PlaySolana",
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

  const getDifficultyColor = (difficulty: string) => {
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
              <span className="text-yellow-400 text-sm font-medium">
                {guide.isExternal ? 'Official Guide' : 'Featured Guide'}
              </span>
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
            {guide.isExternal ? (
              <a
                href={guide.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Guide
              </a>
            ) : (
              <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
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

    const renderVideoCard = (video: any, isSpecial = false) => (
    <div key={video.id} className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden hover:bg-white/15 transition-all duration-200 ${video.featured ? 'ring-2 ring-yellow-500/50' : ''} ${isSpecial ? 'ring-2 ring-blue-500/50' : ''}`}>
      <div className="relative h-48 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center overflow-hidden">
        {video.thumbnail && video.thumbnail !== "/api/placeholder/300/200" ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover"
            onError={(e) => {
              // Fallback to gradient background if thumbnail fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : null}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <Play className="w-16 h-16 text-white opacity-90 drop-shadow-lg" />
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-medium">
          {video.duration}
        </div>
        {video.featured && (
          <div className="absolute top-2 left-2">
            <div className="flex items-center gap-1 bg-yellow-500/90 text-black px-2 py-1 rounded text-xs font-medium">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </div>
          </div>
        )}
        {isSpecial && (
          <div className="absolute top-2 left-2">
            <div className="flex items-center gap-1 bg-blue-500/90 text-white px-2 py-1 rounded text-xs font-medium">
              <Play className="w-3 h-3 fill-current" />
              Partner
            </div>
          </div>
        )}
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
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Play className="w-4 h-4" />
            Watch
          </a>
        </div>
      </div>
    </div>
  );

  const renderVideos = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {videoTutorials.map((video) => renderVideoCard(video))}
    </div>
  );

  const renderObeliskVideos = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {obeliskVideos.map((video) => renderVideoCard(video, true))}
    </div>
  );

  const renderSuperteamVNVideos = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {superteamVNVideos.map((video) => renderVideoCard(video, true))}
    </div>
  );

  const renderJonasResources = () => (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white pixelify-sans">SolPlay Jonas's Curated Resources</h3>
            <p className="text-blue-200">Comprehensive collection of tools, tutorials, and resources for Solana game development</p>
          </div>
        </div>
        <p className="text-blue-100 leading-relaxed">
          Get started with the official <a href="https://solana.com/de/developers/guides/games/getting-started-with-game-development" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">Solana Game Development Guide</a> that provides a comprehensive overview of everything Solana game dev related and all the different SDKs available.
        </p>
      </div>

      {/* SDKs & Engines */}
      <div>
        <h4 className="text-xl font-bold text-white pixelify-sans mb-4 flex items-center gap-2">
          <Code className="w-5 h-5" />
          Game Engines & SDKs
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jonasResources.sdks.map((sdk, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-medium">{sdk.category}</span>
                <h5 className="text-lg font-bold text-white">{sdk.name}</h5>
              </div>
              <p className="text-purple-200 text-sm mb-4">{sdk.description}</p>
              <a
                href={sdk.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 font-medium text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                View Documentation
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Video Tutorials */}
      <div>
        <h4 className="text-xl font-bold text-white pixelify-sans mb-4 flex items-center gap-2">
          <Play className="w-5 h-5" />
          Video Tutorials
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jonasResources.videos.map((video, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-200">
              <h5 className="text-lg font-bold text-white mb-2">{video.title}</h5>
              <p className="text-purple-200 text-sm mb-4">{video.description}</p>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Play className="w-4 h-4" />
                Watch
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Tools & Services */}
      <div>
        <h4 className="text-xl font-bold text-white pixelify-sans mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Development Tools
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jonasResources.tools.map((tool, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
              <h5 className="text-lg font-bold text-white mb-2">{tool.name}</h5>
              <p className="text-purple-200 text-sm mb-4">{tool.description}</p>
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Explore
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Examples & References */}
      <div>
        <h4 className="text-xl font-bold text-white pixelify-sans mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Examples & References
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jonasResources.examples.map((example, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
              <h5 className="text-lg font-bold text-white mb-2">{example.name}</h5>
              <p className="text-purple-200 text-sm mb-4">{example.description}</p>
              <a
                href={example.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Examples
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Opportunities */}
      {jonasResources.opportunities.length > 0 && (
        <div>
          <h4 className="text-xl font-bold text-white pixelify-sans mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Funding & Opportunities
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jonasResources.opportunities.map((opportunity, idx) => (
              <div key={idx} className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-6 hover:from-yellow-500/30 hover:to-orange-500/30 transition-all duration-200">
                <h5 className="text-lg font-bold text-white mb-2">{opportunity.name}</h5>
                <p className="text-yellow-100 text-sm mb-4">{opportunity.description}</p>
                <a
                  href={opportunity.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Learn More
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 text-center">
        <p className="text-purple-100 mb-4">
          Special thanks to <span className="text-purple-300 font-semibold">@SuperteamVN</span>, <span className="text-purple-300 font-semibold">@SENDArcadeX</span>, and <span className="text-purple-300 font-semibold">@honeycomb_prtcl</span> for organizing this game jam!
        </p>
        <p className="text-purple-200 text-sm">
          For AI-powered development, check out <span className="text-purple-300 font-semibold">@Belacosaursol</span> with <span className="text-purple-300 font-semibold">@ObeliskProtocol</span> - they have extensive experience in vibe coding with Copilot, Cursor, and Windsurf.
        </p>
      </div>
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
      case 'jonas': return renderJonasResources();
      case 'videos': return renderVideos();
      case 'obelisk': return renderObeliskVideos();
      case 'superteamvn': return renderSuperteamVNVideos();
      case 'social': return renderSocialContent();
      default: 
        return (
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">📘 Official Solana Guide</h2>
              {renderGuides()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">⭐ SolPlay Jonas's Curated Resources</h2>
              {renderJonasResources()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">🎥 Video Tutorials</h2>
              {renderVideos()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">🛠️ Obelisk Protocol Videos</h2>
              {renderObeliskVideos()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white pixelify-sans mb-6">📺 SuperteamVN Live Sessions</h2>
              {renderSuperteamVNVideos()}
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


      </div>
    </div>
  );
};

export default ResourcesPage; 