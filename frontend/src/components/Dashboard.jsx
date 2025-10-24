import { 
  MessageSquare, 
  Calendar, 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle
} from 'lucide-react'

const Dashboard = () => {
  // Mock data - will be replaced with real data later
  const stats = [
    {
      name: 'Active Conversations',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: MessageSquare,
      color: 'blue'
    },
    {
      name: 'Bookings Today',
      value: '8',
      change: '+3',
      changeType: 'positive',
      icon: Calendar,
      color: 'green'
    },
    {
      name: 'Total Customers',
      value: '1,247',
      change: '+47',
      changeType: 'positive',
      icon: Users,
      color: 'purple'
    },
    {
      name: 'Revenue This Month',
      value: '£12,450',
      change: '+8.2%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'green'
    }
  ]

  const recentBookings = [
    {
      id: 1,
      customer: 'Sarah Johnson',
      service: 'Waste Removal',
      time: '10:30 AM',
      status: 'confirmed',
      phone: '+44 7123 456789'
    },
    {
      id: 2,
      customer: 'Mike Chen',
      service: 'Furniture Disposal',
      time: '2:15 PM',
      status: 'pending',
      phone: '+44 7234 567890'
    },
    {
      id: 3,
      customer: 'Emma Wilson',
      service: 'Garden Clearance',
      time: '4:00 PM',
      status: 'confirmed',
      phone: '+44 7345 678901'
    }
  ]

  const recentConversations = [
    {
      id: 1,
      customer: 'David Smith',
      lastMessage: 'Thanks for the quote, I\'d like to book for next week',
      time: '2 min ago',
      status: 'bot',
      unread: true
    },
    {
      id: 2,
      customer: 'Lisa Brown',
      lastMessage: 'What time can you collect tomorrow?',
      time: '15 min ago',
      status: 'human',
      unread: false
    },
    {
      id: 3,
      customer: 'Tom Wilson',
      lastMessage: 'Perfect, see you at 3pm',
      time: '1 hour ago',
      status: 'human',
      unread: false
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-orange-600 bg-orange-100'
      case 'bot':
        return 'text-blue-600 bg-blue-100'
      case 'human':
        return 'text-purple-600 bg-purple-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {stat.changeType === 'positive' ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {booking.customer.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{booking.customer}</p>
                    <p className="text-sm text-gray-600">{booking.service}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{booking.time}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    <span className="ml-1 capitalize">{booking.status}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Conversations</h3>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {recentConversations.map((conversation) => (
              <div key={conversation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {conversation.customer.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">{conversation.customer}</p>
                      {conversation.unread && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{conversation.time}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
                    <span className="capitalize">{conversation.status}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary flex items-center justify-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Start New Chat</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Schedule Booking</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
