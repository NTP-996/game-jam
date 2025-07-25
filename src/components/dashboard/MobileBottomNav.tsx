'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  name: string
  href: string
  icon: string
  badge?: number
}

// Main navigation items for mobile
const mobileNavigation: NavItem[] = [
  { name: 'Home', href: '/dashboard', icon: '🏠' },
  // { name: 'Catalogue', href: '/dashboard/catalogue', icon: '🎮' },
  // { name: 'Team', href: '/dashboard/team', icon: '👥' },
  { name: 'Resources', href: '/dashboard/resources', icon: '📚' },
  { name: 'Profile', href: '/dashboard/profile', icon: '👤' },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-purple-900/95 backdrop-blur-sm border-t border-purple-500/30">
      <div className="flex items-center justify-around py-2 px-4">
        {mobileNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-0 flex-1 max-w-20
                ${isActive 
                  ? 'text-white bg-purple-700/50' 
                  : 'text-purple-300 hover:text-white hover:bg-purple-800/50'
                }
              `}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="text-xs font-medium truncate leading-tight">
                {item.name}
              </span>
              {item.badge && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
} 