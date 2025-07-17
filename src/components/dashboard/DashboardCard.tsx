interface DashboardCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: string
  color: 'yellow' | 'blue' | 'green' | 'purple' | 'red'
  trend?: {
    value: number
    isPositive: boolean
  }
}

const colorClasses = {
  yellow: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    icon: 'text-yellow-400',
    value: 'text-yellow-400'
  },
  blue: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    value: 'text-blue-400'
  },
  green: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    icon: 'text-green-400',
    value: 'text-green-400'
  },
  purple: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    icon: 'text-purple-400',
    value: 'text-purple-400'
  },
  red: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    icon: 'text-red-400',
    value: 'text-red-400'
  }
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend
}: DashboardCardProps) {
  const classes = colorClasses[color]

  return (
    <div className={`${classes.bg} backdrop-blur-sm border ${classes.border} rounded-lg p-6 hover:scale-105 transition-transform duration-200`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`text-2xl ${classes.icon}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            <span className="mr-1">
              {trend.isPositive ? '↗' : '↘'}
            </span>
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-purple-300 uppercase tracking-wider">
          {title}
        </h3>
        <p className={`text-3xl font-bold ${classes.value} pixelify-sans`}>
          {value}
        </p>
        <p className="text-sm text-purple-200">
          {subtitle}
        </p>
      </div>
    </div>
  )
} 