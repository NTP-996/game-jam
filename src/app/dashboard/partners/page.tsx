'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Zap, Shield, Users, Code, GamepadIcon, Wallet, Globe, Building, Trophy, Gamepad2, ChevronLeft, ChevronRight } from 'lucide-react';

const PartnersPage = () => {
  const [currentPartnerIndex, setCurrentPartnerIndex] = useState(0);

  const partners = [
    {
      name: "SEND Arcade",
      tagline: "Web3 gaming platform connecting players and developers in the Solana ecosystem.",
      description: "SEND Arcade is a Web3 gaming platform that focuses on connecting players and developers within the Solana ecosystem. They provide innovative gaming experiences and community-driven initiatives to advance Web3 gaming adoption.",
      logo: "/assets/partner/sendlogo.png",
      banner: "/assets/partner/sendbanner.png",
      color: "from-green-500 to-emerald-500",
      features: [
        "Web3 gaming platform on Solana",
        "Community-driven gaming experiences",
        "Player and developer ecosystem",
        "Innovative gaming initiatives",
        "Solana blockchain integration",
        "Gaming community building",
        "Web3 gaming adoption"
      ],
      links: [
        { title: "Website", url: "http://sendarcade.xyz/", icon: <Globe className="w-4 h-4" /> },
        { title: "Twitter", url: "https://x.com/SENDArcadeX", icon: <ExternalLink className="w-4 h-4" /> }
      ],
      keyBenefits: [
        { icon: <GamepadIcon className="w-5 h-5" />, title: "Web3 Gaming", desc: "Platform focused on Solana gaming ecosystem" },
        { icon: <Users className="w-5 h-5" />, title: "Community First", desc: "Connecting players and developers" },
        { icon: <Zap className="w-5 h-5" />, title: "Innovation", desc: "Advancing Web3 gaming experiences" }
      ]
    },
    {
      name: "Honeycomb Protocol",
      tagline: "Simplifies game development with no need to write contracts and dramatically reduces on-chain fees for users.",
      description: "Honeycomb Protocol enables rapid deployment of fully and partial on-chain games reducing development time & costs. Game studios can leverage blockchain game mechanics using Solana with a unified SDK and on-chain primitives to accelerate, scale and secure game development. All with no blockchain coding experience required.",
      logo: "/assets/sponsor/honeycomb.jpg",
      banner: "/assets/sponsor/honeycombbanner.jpeg",
      color: "from-amber-500 to-orange-500",
      features: [
        "~500x fee reduction via State-Compression",
        "Simple JS/TS SDK (Unity, Unreal, Godot, GraphQL)",
        "Users & Profiles – Universal accounts with integrations (Steam, Discord, etc.)",
        "Characters – Create or import NFTs as playable characters",
        "Resources – Design currencies, assets, recipes, and equipable items",
        "Missions – On-chain quests with rewards",
        "Staking – Passive rewards (staking) for NFTs and tokens"
      ],
      links: [
        { title: "Documentation", url: "https://docs.honeycombprotocol.com/", icon: <Code className="w-4 h-4" /> },
        { title: "GitHub", url: "https://github.com/honeycomb-protocol", icon: <Code className="w-4 h-4" /> },
        { title: "Twitter", url: "https://x.com/honeycomb_prtcl", icon: <ExternalLink className="w-4 h-4" /> }
      ],
      keyBenefits: [
        { icon: <Zap className="w-5 h-5" />, title: "500x Fee Reduction", desc: "Massive cost savings via State-Compression" },
        { icon: <Code className="w-5 h-5" />, title: "No Blockchain Coding", desc: "Build games without smart contract experience" },
        { icon: <GamepadIcon className="w-5 h-5" />, title: "Multi-Engine Support", desc: "Works with Unity, Unreal, Godot" }
      ]
    },
    {
      name: "Superteam Vietnam",
      tagline: "Vietnam's local hub driving Solana ecosystem growth through community building and developer support.",
      description: "Superteam Vietnam is the local Vietnamese hub of the global Superteam network, focused on growing the Solana ecosystem in Vietnam. They organize events, provide educational resources, and connect Vietnamese developers with the broader Solana community to build innovative Web3 projects.",
      logo: "/assets/logos/superteam.svg",
      banner: "/assets/partner/superteambanner.png",
      color: "from-purple-500 to-indigo-500",
      features: [
        "Local Vietnamese Solana community hub",
        "Educational workshops and training programs",
        "Developer meetups and networking events",
        "Mentorship for Vietnamese builders",
        "Connection to global Superteam network",
        "Community support and resources",
        "Hackathon organization and participation"
      ],
      links: [
        { title: "Website", url: "https://vn.superteam.fun/", icon: <Globe className="w-4 h-4" /> },
        { title: "Join Telegram", url: "https://t.me/solanainvietnam", icon: <Users className="w-4 h-4" /> },
        { title: "Twitter", url: "https://x.com/SuperteamVN", icon: <ExternalLink className="w-4 h-4" /> }
      ],
      keyBenefits: [
        { icon: <Users className="w-5 h-5" />, title: "Local Community", desc: "Vietnamese Solana developer network" },
        { icon: <Building className="w-5 h-5" />, title: "Educational Focus", desc: "Training and skill development" },
        { icon: <Globe className="w-5 h-5" />, title: "Global Connection", desc: "Bridge to international Solana ecosystem" }
      ]
    },
    {
      name: "BIC (Busan Indie Connect) & Superteam Korea",
      tagline: "Korea's premier indie game festival and Solana community hub driving Web3 gaming innovation.",
      description: "BIC (Busan Indie Connect) is Korea's major indie game festival that showcases innovative games and connects developers with the global gaming industry. Organized in partnership with Superteam Korea, it bridges traditional indie gaming with Web3 innovation, providing a platform for developers to showcase their work and connect with publishers, investors, and the Solana ecosystem.",
      logo: "/assets/partner/STKRlogo.png",
      banner: "/assets/partner/STKRbanner.png",
      color: "from-red-500 to-pink-500",
      features: [
        "Premier indie game festival in Busan, Korea",
        "Web3 and blockchain gaming focus",
        "Game showcase and exhibition platform",
        "Developer networking and collaboration",
        "Publisher and investor meetings",
        "Educational workshops and industry talks",
        "Superteam Korea community support",
        "International gaming industry connections"
      ],
      links: [
        { title: "BIC Festival", url: "https://bicfest.org/", icon: <Globe className="w-4 h-4" /> },
        { title: "BIC Twitter", url: "https://x.com/BIC_Festival", icon: <ExternalLink className="w-4 h-4" /> },
        { title: "Superteam Korea", url: "https://x.com/SuperteamKorea", icon: <Users className="w-4 h-4" /> }
      ],
      keyBenefits: [
        { icon: <Gamepad2 className="w-5 h-5" />, title: "Indie Gaming", desc: "Premier platform for indie game developers" },
        { icon: <Building className="w-5 h-5" />, title: "Industry Access", desc: "Connect with publishers and investors" },
                 { icon: <Globe className="w-5 h-5" />, title: "Web3 Innovation", desc: "Bridge to blockchain and Solana gaming" }
       ]
     },
     {
       name: "Superteam Hub Jogja powered by Obelisk Protocol",
       tagline: "Web3 development studio and Solana coworking space empowering builders in Yogyakarta, Indonesia.",
       description: "Superteam Hub Jogja, powered by Obelisk Protocol, is a comprehensive Web3 development and marketing studio that builds games, DeFi, and infrastructure on Solana. As an official partner of Superteam Indonesia, they provide a dedicated coworking space for Solana builders in Yogyakarta, combining AI-native development with human-centered design to transform ambitious ideas into deployable reality.",
       logo: "/assets/partner/obelisklogo.png",
       banner: "/assets/partner/superteamhubbanner.jpg",
       color: "from-indigo-600 to-purple-600",
       features: [
         "Web3 development and marketing studio",
         "Games, DeFi, and infrastructure on Solana",
         "AI-native development with Cursor and Gemini 2.5",
         "Coworking space for Solana builders in Yogyakarta",
         "Official Superteam Indonesia partner",
         "Full-stack Web3 development services",
         "Smart contract engineering and game theory",
         "Brand identity and narrative design"
       ],
       links: [
         { title: "Website", url: "https://www.obeliskprotocol.io/", icon: <Globe className="w-4 h-4" /> },
         { title: "Hub Portal", url: "https://hub.obeliskprotocol.io/", icon: <Code className="w-4 h-4" /> },
         { title: "Discord", url: "https://discord.com/invite/uMRnMbMtgQ", icon: <Users className="w-4 h-4" /> },
         { title: "Twitter", url: "https://x.com/ObeliskProtocol", icon: <ExternalLink className="w-4 h-4" /> },
         { title: "YouTube", url: "https://www.youtube.com/@ObeliskProtocol", icon: <ExternalLink className="w-4 h-4" /> },
         { title: "Instagram", url: "https://www.instagram.com/obeliskprotocolsol/", icon: <ExternalLink className="w-4 h-4" /> },
         { title: "TikTok", url: "https://www.tiktok.com/@obelisk.protocol", icon: <ExternalLink className="w-4 h-4" /> }
       ],
       keyBenefits: [
         { icon: <Code className="w-5 h-5" />, title: "AI-Native Dev", desc: "Accelerated development with AI tools" },
         { icon: <Building className="w-5 h-5" />, title: "Physical Hub", desc: "Coworking space in Yogyakarta, Indonesia" },
         { icon: <Gamepad2 className="w-5 h-5" />, title: "Full Spectrum", desc: "Games, DeFi, and infrastructure development" }
       ]
     }
   ];

  const nextPartner = () => {
    setCurrentPartnerIndex((prev) => (prev + 1) % partners.length);
  };

  const prevPartner = () => {
    setCurrentPartnerIndex((prev) => (prev - 1 + partners.length) % partners.length);
  };

  const goToPartner = (index: number) => {
    setCurrentPartnerIndex(index);
  };

  return (
    <div className="ml-0 lg:ml-64 p-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white pixelify-sans mb-3">
            Game Jam Partners
          </h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            Our incredible partners are helping make this Game Jam possible. These organizations provide 
            essential tools, platforms, and support to help developers succeed in the Solana gaming ecosystem.
          </p>
        </div>

        {/* Live Partners Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white pixelify-sans">
              Partner {currentPartnerIndex + 1} of {partners.length}
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={prevPartner}
                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-white transition-all duration-200 hover:scale-105 z-10"
                aria-label="Previous partner"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextPartner}
                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-white transition-all duration-200 hover:scale-105 z-10"
                aria-label="Next partner"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Carousel Container */}
          <div className="relative h-[500px] overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {partners.map((partner, index) => {
                const position = index - currentPartnerIndex;
                const isActive = index === currentPartnerIndex;
                const isVisible = Math.abs(position) <= 2;

                if (!isVisible) return null;

                return (
                  <div
                    key={index}
                    className={`absolute transition-all duration-700 ease-in-out cursor-pointer ${
                      isActive 
                        ? 'z-20 scale-100 opacity-100' 
                        : 'z-10 scale-75 opacity-60 hover:opacity-80'
                    }`}
                    style={{
                      transform: `translateX(${position * 320}px) ${isActive ? 'scale(1)' : 'scale(0.75)'}`,
                      filter: isActive ? 'none' : 'blur(1px)',
                    }}
                    onClick={() => !isActive && goToPartner(index)}
                  >
                    <div className={`w-72 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${
                      isActive ? 'border-purple-400/50 shadow-2xl shadow-purple-500/20' : 'hover:border-white/40'
                    }`}>
                      {/* Compact Banner */}
                      <div className="relative h-24 w-full">
                        {partner.banner && (
                          <Image
                            src={partner.banner}
                            alt={`${partner.name} banner`}
                            fill
                            className="object-cover"
                          />
                        )}
                        {!partner.banner && (
                          <div className={`absolute inset-0 bg-gradient-to-r ${partner.color} opacity-80`}></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-2 left-4 text-white">
                          <h3 className="text-lg font-bold pixelify-sans truncate">{partner.name}</h3>
                        </div>
                      </div>
                      
                                              {/* Compact Content */}
                        <div className="p-3">
                          {/* Partner Header */}
                          <div className="flex items-center gap-2 mb-3">
                          <div className="w-12 h-12 bg-purple-600 border-2 border-green-500 rounded-xl p-1 shadow-lg overflow-hidden">
                            {partner.logo ? (
                              <Image
                                src={partner.logo}
                                alt={`${partner.name} logo`}
                                width={48}
                                height={48}
                                className="w-full h-full object-contain rounded-lg"
                              />
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br ${partner.color} rounded-lg flex items-center justify-center`}>
                                <span className="text-white font-bold text-xs">{partner.name.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-purple-200 font-medium line-clamp-2">{partner.tagline}</p>
                          </div>
                        </div>

                                                  {/* Key Benefits Preview */}
                          <div className="grid grid-cols-3 gap-1 mb-3">
                          {partner.keyBenefits.slice(0, 3).map((benefit, idx) => (
                            <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-2 text-center">
                              <div className={`w-6 h-6 bg-gradient-to-br ${partner.color} rounded-lg flex items-center justify-center text-white mb-1 mx-auto`}>
                                <div className="scale-75">{benefit.icon}</div>
                              </div>
                              <p className="text-xs font-medium text-white truncate">{benefit.title}</p>
                            </div>
                          ))}
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isActive) {
                              // Scroll to detailed view or open modal
                              document.getElementById('partner-details')?.scrollIntoView({ behavior: 'smooth' });
                            } else {
                              goToPartner(index);
                            }
                          }}
                          className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                            isActive
                              ? `bg-gradient-to-r ${partner.color} text-white hover:shadow-lg hover:scale-105`
                              : 'bg-white/10 text-purple-200 hover:bg-white/20'
                          }`}
                        >
                          {isActive ? 'View Details' : 'Select'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed View for Active Partner */}
          <div id="partner-details" className="mt-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white pixelify-sans mb-3">
                  About {partners[currentPartnerIndex].name}
                </h3>
                
                {/* Description */}
                <div className="mb-6">
                  <p className="text-purple-100 leading-relaxed">{partners[currentPartnerIndex].description}</p>
                </div>

                {/* Key Benefits */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {partners[currentPartnerIndex].keyBenefits.map((benefit, idx) => (
                    <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-sm">
                      <div className={`w-12 h-12 bg-gradient-to-br ${partners[currentPartnerIndex].color} rounded-xl flex items-center justify-center text-white mb-4`}>
                        {benefit.icon}
                      </div>
                      <h4 className="font-semibold text-white mb-2">{benefit.title}</h4>
                      <p className="text-purple-200 text-sm">{benefit.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Features List */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white pixelify-sans mb-3">Key Features & Offerings:</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {partners[currentPartnerIndex].features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`w-2 h-2 bg-gradient-to-br ${partners[currentPartnerIndex].color} rounded-full mt-2 flex-shrink-0`}></div>
                        <span className="text-purple-100">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Links */}
                <div className="flex flex-wrap gap-4">
                  {partners[currentPartnerIndex].links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${partners[currentPartnerIndex].color} text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:scale-105`}
                    >
                      {link.icon}
                      {link.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Dots */}
          <div className="flex justify-center gap-3 mt-4">
            {partners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToPartner(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentPartnerIndex
                    ? 'bg-purple-400 scale-125 shadow-lg shadow-purple-400/50'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to partner ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white pixelify-sans mb-3">
            Join Our Partner Network
          </h2>
          <p className="text-lg text-purple-200 mb-6 max-w-2xl mx-auto">
            Interested in partnering with us for future events? We're always looking for organizations 
            that share our vision of building the future of gaming on Solana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105">
              Become a Partner
            </button>
            <button className="px-8 py-4 border-2 border-purple-400 text-purple-200 rounded-xl font-semibold hover:border-purple-300 hover:text-white hover:bg-purple-600/20 transition-all duration-200">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnersPage; 