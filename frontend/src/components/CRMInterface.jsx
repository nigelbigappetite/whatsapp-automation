import { useState } from 'react'
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  Users, 
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react'
import Dashboard from './Dashboard'
import ConversationsView from './ConversationsView'
import CalendarView from './CalendarView'
import CustomersView from './CustomersView'

const CRMInterface = () => {
  const [activeView, setActiveView] = useState('dashboard')
  const [user, setUser] = useState({ name: 'John Doe', email: 'john@wefixico.com' })

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'conversations', name: 'Conversations', icon: MessageSquare },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  ]

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />
      case 'conversations':
        return <ConversationsView />
      case 'calendar':
        return <CalendarView />
      case 'customers':
        return <CustomersView />
      case 'analytics':
        return <div className="p-8 text-center text-gray-500">Analytics coming soon...</div>
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">WhatsApp CRM</h1>
          <p className="text-sm text-gray-500">Wefixico Hub</p>
        </div>
        
        <nav className="mt-6">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left text-sm font-medium transition-colors ${
                  activeView === item.id
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="main-content h-full overflow-auto">
          {renderActiveView()}
        </div>
      </div>
    </div>
  )
}

export default CRMInterface
