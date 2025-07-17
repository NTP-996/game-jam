import Link from 'next/link'

interface QuickActionsProps {
  userTeam: any
  projectSubmitted: boolean
}

interface ActionCardProps {
  title: string
  description: string
  href: string
  icon: string
  color: 'primary' | 'success' | 'warning' | 'danger'
  badge?: string
}

function ActionCard({ title, description, href, icon, color, badge }: ActionCardProps) {
  const colorClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 border-blue-500',
    success: 'bg-green-600 hover:bg-green-700 border-green-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 border-yellow-500',
    danger: 'bg-red-600 hover:bg-red-700 border-red-500'
  }

  return (
    <Link
      href={href}
      className={`block p-4 rounded-lg border ${colorClasses[color]} text-white transition-all duration-200 hover:scale-105 hover:shadow-lg relative overflow-hidden group`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xl">{icon}</span>
            <h3 className="font-semibold pixelify-sans">{title}</h3>
            {badge && (
              <span className="px-2 py-1 text-xs font-bold bg-white/20 rounded-full">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm opacity-90">{description}</p>
        </div>
        <div className="ml-4 opacity-60 group-hover:opacity-100 transition-opacity">
          →
        </div>
      </div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </Link>
  )
}

export default function QuickActions({ userTeam, projectSubmitted }: QuickActionsProps) {
  const actions = []

  // Application not submitted
  if (!userTeam) {
    actions.push({
      title: 'Complete Application',
      description: 'Submit your hackathon application to get started',
      href: '/dashboard/application',
      icon: '📝',
      color: 'warning' as const,
      badge: 'Required'
    })
  }

  // No team formed
  if (!userTeam) {
    actions.push({
      title: 'Form a Team',
      description: 'Find teammates or create your own team',
      href: '/dashboard/team',
      icon: '👥',
      color: 'primary' as const
    })
  } else {
    // Has team, no project submitted
    if (!projectSubmitted) {
      actions.push({
        title: 'Submit Project',
        description: 'Upload your game and project details',
        href: '/dashboard/project',
        icon: '🚀',
        color: 'success' as const,
        badge: 'Due Soon'
      })
    }
  }

  // Always available actions
  actions.push({
    title: 'Book Mentorship',
    description: 'Get guidance from industry experts',
    href: '/dashboard/mentorship',
    icon: '🧙‍♂️',
    color: 'primary' as const
  })

  if (projectSubmitted) {
    actions.push({
      title: 'View Submission',
      description: 'Check your project status and feedback',
      href: '/dashboard/submissions',
      icon: '📊',
      color: 'success' as const
    })
  }

  actions.push({
    title: 'Resources & Docs',
    description: 'Access Solana development resources',
    href: '/dashboard/resources',
    icon: '📚',
    color: 'primary' as const
  })

  return (
    <div className="space-y-4">
      {actions.map((action, index) => (
        <ActionCard key={index} {...action} />
      ))}
    </div>
  )
} 