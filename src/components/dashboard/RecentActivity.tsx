interface ActivityItem {
  id: string
  type: 'submission' | 'team' | 'mentorship' | 'announcement' | 'workshop'
  title: string
  description: string
  timestamp: string
  user?: string
  avatar?: string
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'submission',
    title: 'Project Submitted',
    description: 'SolanaQuest RPG submitted by Team Pixel Warriors',
    timestamp: '2 hours ago',
    user: 'Team Pixel Warriors'
  },
  {
    id: '2',
    type: 'team',
    title: 'New Team Formed',
    description: 'CodeCrusaders is looking for a Unity developer',
    timestamp: '4 hours ago',
    user: 'CodeCrusaders'
  },
  {
    id: '3',
    type: 'mentorship',
    title: 'Mentorship Session',
    description: 'You have a scheduled session with Jonas tomorrow at 3 PM',
    timestamp: '6 hours ago'
  },
  {
    id: '4',
    type: 'workshop',
    title: 'Workshop Starting Soon',
    description: 'Solana Game Development with Unity starts in 1 hour',
    timestamp: '1 day ago'
  },
  {
    id: '5',
    type: 'announcement',
    title: 'Deadline Extended',
    description: 'Team formation deadline extended to December 20th',
    timestamp: '2 days ago'
  }
]

function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
  const icons = {
    submission: '🚀',
    team: '👥',
    mentorship: '🧙‍♂️',
    announcement: '📢',
    workshop: '🎓'
  }
  
  const colors = {
    submission: 'bg-green-500/20 text-green-400',
    team: 'bg-blue-500/20 text-blue-400',
    mentorship: 'bg-purple-500/20 text-purple-400',
    announcement: 'bg-yellow-500/20 text-yellow-400',
    workshop: 'bg-indigo-500/20 text-indigo-400'
  }

  return (
    <div className={`w-10 h-10 rounded-full ${colors[type]} flex items-center justify-center flex-shrink-0`}>
      {icons[type]}
    </div>
  )
}

export default function RecentActivity() {
  return (
    <div className="bg-purple-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
      <div className="space-y-4">
        {mockActivities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-purple-700/30 transition-colors">
            <ActivityIcon type={activity.type} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium truncate">
                  {activity.title}
                </h4>
                <span className="text-xs text-purple-300 flex-shrink-0 ml-2">
                  {activity.timestamp}
                </span>
              </div>
              
              <p className="text-sm text-purple-200 mt-1">
                {activity.description}
              </p>
              
              {activity.user && (
                <p className="text-xs text-purple-400 mt-1">
                  by {activity.user}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-purple-500/30">
        <button className="w-full text-center text-purple-300 hover:text-white text-sm transition-colors">
          View All Activity →
        </button>
      </div>
    </div>
  )
} 