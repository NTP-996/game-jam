'use client';

import React from 'react';
import Image from 'next/image';
import { ExternalLink, Zap, Shield, Users, Code, GamepadIcon, Wallet, Globe } from 'lucide-react';

const SponsorsPage = () => {
  const sponsors = [
    {
      name: "PlaySolana",
      tagline: "The flagship distribution device. Games built during this Game Jam will be eligible for publishing on their platform.",
      description: "PlaySolana-Unity.SDK is a development kit built for seamless integration between Unity projects and the PSG1 console. Whether you are creating new games or porting existing ones, the SDK provides all the tools needed to support the console's custom input system and device simulator.",
      logo: "/assets/sponsor/PlaySolana.png",
      banner: "/assets/sponsor/playsolanabanner.jpeg",
      color: "from-purple-500 to-pink-500",
      features: [
        "Seamless Unity integration with PSG1 console",
        "Custom input system support",
        "Device simulator included",
        "Dedicated Developer Portal (coming soon)",
        "Preinstallation opportunity on PSG1 at launch",
        "Distribution to over 7,000 players",
        "Premium, zero-friction experience",
        "All hackathon participants considered for preinstallation"
      ],
      links: [
        { title: "Developer Guide", url: "https://developers.playsolana.com/", icon: <Code className="w-4 h-4" /> },
        { title: "GitHub SDK", url: "https://github.com/playsolana/PlaySolana.Unity-SDK", icon: <Code className="w-4 h-4" /> }
      ],
      keyBenefits: [
        { icon: <GamepadIcon className="w-5 h-5" />, title: "PSG1 Console", desc: "Direct access to gaming hardware" },
        { icon: <Users className="w-5 h-5" />, title: "7,000+ Players", desc: "Built-in distribution network" },
        { icon: <Globe className="w-5 h-5" />, title: "Preinstallation", desc: "Hackathon projects eligible for launch inclusion" }
      ]
    },
    {
      name: "Civic Auth",
      tagline: "Streamlines wallet onboarding. Players can sign up using Gmail and get an embedded wallet directly in your game.",
      description: "Civic Auth an embedded wallet and authenticator for games. Skip wallet secret phrases and signup forms. Civic lets players join with email or one-tap SSO (Google, Apple, Discord, GitHub, X, Facebook), and Passkeys will be available in early release next week!",
      logo: "/assets/sponsor/civic.jpg",
      banner: "/assets/sponsor/civicbanner.jpeg",
      color: "from-blue-500 to-indigo-500",
      features: [
        "Email or one-tap SSO (Google, Apple, Discord, GitHub, X, Facebook)",
        "Embedded Solana wallet with no seed phrases",
        "~5 minute integration time",
        "Managed stack—no servers, no rate-limit boilerplate",
        "Drag-and-drop editor for brand matching",
        "Transparent, usage-based pricing",
        "Passkeys available in early release",
        "$10k in platform credits for Jam projects"
      ],
      links: [
        { title: "Documentation", url: "https://docs.civic.com/", icon: <Code className="w-4 h-4" /> }
      ],
      keyBenefits: [
        { icon: <Wallet className="w-5 h-5" />, title: "No Seed Phrases", desc: "Embedded wallets with social login" },
        { icon: <Zap className="w-5 h-5" />, title: "5 Minute Setup", desc: "Quick integration with managed stack" },
        { icon: <Shield className="w-5 h-5" />, title: "$10k Credits", desc: "Platform credits for Game Jam projects" }
      ]
    },
    {
      name: "Solana Foundation",
      tagline: "Supporting the growth and development of the Solana ecosystem through grants, events, and community initiatives.",
      description: "The Solana Foundation is a non-profit organization dedicated to supporting the decentralized development and adoption of the Solana network. They provide grants, organize events, and support developers building innovative applications on Solana, including gaming and Web3 experiences.",
      logo: "/assets/sponsor/solanafoundation.svg",
      banner: "/assets/sponsor/solana-banner.jpeg", // Placeholder - will need actual asset
      color: "from-purple-600 to-blue-600",
      features: [
        "Developer grants and funding opportunities",
        "Educational resources and documentation",
        "Community events and hackathons",
        "Technical support and mentorship",
        "Ecosystem development initiatives",
        "Partnership facilitation",
        "Developer advocacy programs",
        "Open source development support"
      ],
      links: [
        { title: "Website", url: "https://solana.org/", icon: <Globe className="w-4 h-4" /> },
        { title: "Developer Resources", url: "https://docs.solana.com/", icon: <Code className="w-4 h-4" /> },
        { title: "Grants Program", url: "https://solana.org/grants", icon: <ExternalLink className="w-4 h-4" /> }
      ],
      keyBenefits: [
        { icon: <Zap className="w-5 h-5" />, title: "Fast & Cheap", desc: "High-performance blockchain with low fees" },
        { icon: <Users className="w-5 h-5" />, title: "Strong Community", desc: "Vibrant ecosystem of developers and builders" },
        { icon: <Code className="w-5 h-5" />, title: "Developer Support", desc: "Comprehensive tools and resources" }
      ]
    }
  ];

  return (
    <div className="ml-0 lg:ml-64 p-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white pixelify-sans mb-4">
            Game Jam Sponsors
          </h1>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Meet our incredible sponsors who are empowering developers to build the future of gaming on Solana.
            Each sponsor offers unique tools and opportunities to accelerate your game development journey.
          </p>
        </div>

        {/* Sponsors Grid */}
        <div className="space-y-8">
          {sponsors.map((sponsor, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden shadow-lg">
              {/* Banner Image */}
              <div className="relative h-48 w-full">
                <Image
                  src={sponsor.banner}
                  alt={`${sponsor.name} banner`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
              
              {/* Sponsor Header */}
              <div className="p-8">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-purple-600 border-4 border-green-500 rounded-2xl p-2 shadow-lg overflow-hidden">
                    <Image
                      src={sponsor.logo}
                      alt={`${sponsor.name} logo`}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white pixelify-sans mb-2">{sponsor.name}</h2>
                    <p className="text-lg text-purple-200 font-medium">{sponsor.tagline}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <p className="text-purple-100 leading-relaxed text-lg">{sponsor.description}</p>
                </div>

                {/* Key Benefits */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {sponsor.keyBenefits.map((benefit, idx) => (
                    <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-sm">
                      <div className={`w-12 h-12 bg-gradient-to-br ${sponsor.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                        {benefit.icon}
                      </div>
                      <h3 className="font-semibold text-white mb-2">{benefit.title}</h3>
                      <p className="text-purple-200 text-sm">{benefit.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Features List */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white pixelify-sans mb-4">Key Features & Modules:</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {sponsor.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`w-2 h-2 bg-gradient-to-br ${sponsor.color} rounded-full mt-2 flex-shrink-0`}></div>
                        <span className="text-purple-100">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Links */}
                <div className="flex flex-wrap gap-4">
                  {sponsor.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${sponsor.color} text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:scale-105`}
                    >
                      {link.icon}
                      {link.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>


      </div>
    </div>
  );
};

export default SponsorsPage; 