import { useState } from 'react'
import { 
  Search, 
  Filter, 
  MessageCircle, 
  Bot, 
  User, 
  Clock,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Tag
} from 'lucide-react'

const ConversationsView = () => {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, bot, human

  // Mock data - will be replaced with real data
  const conversations = [
    {
      id: 1,
      customer: 'Sarah Johnson',
      phone: '+44 7123 456789',
      lastMessage: 'Thanks for the quote, I\'d like to book for next week',
      time: '2 min ago',
      status: 'bot',
      unread: true,
      messages: [
        { id: 1, sender: 'customer', text: 'Hi, I need to get rid of some old furniture', time: '10:30 AM' },
        { id: 2, sender: 'bot', text: 'Hi! I can help you with that. What items do you need removed?', time: '10:30 AM' },
        { id: 3, sender: 'customer', text: 'I have a sofa and 2 mattresses', time: '10:31 AM' },
        { id: 4, sender: 'bot', text: '💰 **Your Quote:** £55\n\n1x sofa - £30\n1x mattress - £25\n\n📞 Ready to book? Just reply "yes"!', time: '10:31 AM' },
        { id: 5, sender: 'customer', text: 'Thanks for the quote, I\'d like to book for next week', time: '10:32 AM' }
      ]
    },
    {
      id: 2,
      customer: 'Mike Chen',
      phone: '+44 7234 567890',
      lastMessage: 'What time can you collect tomorrow?',
      time: '15 min ago',
      status: 'human',
      unread: false,
      messages: [
        { id: 1, sender: 'customer', text: 'Hi, I need waste removal service', time: '9:45 AM' },
        { id: 2, sender: 'agent', text: 'Hello Mike! I can help you with that. What items do you need removed?', time: '9:46 AM' },
        { id: 3, sender: 'customer', text: 'I have 22 bin bags and a radiator', time: '9:47 AM' },
        { id: 4, sender: 'agent', text: 'Perfect! That would be £460 total. When would you like us to collect?', time: '9:48 AM' },
        { id: 5, sender: 'customer', text: 'What time can you collect tomorrow?', time: '9:50 AM' }
      ]
    },
    {
      id: 3,
      customer: 'Emma Wilson',
      phone: '+44 7345 678901',
      lastMessage: 'Perfect, see you at 3pm',
      time: '1 hour ago',
      status: 'human',
      unread: false,
      messages: [
        { id: 1, sender: 'customer', text: 'Hi, I need garden clearance', time: '8:30 AM' },
        { id: 2, sender: 'agent', text: 'Hello Emma! I can help with garden clearance. What size area are we looking at?', time: '8:31 AM' },
        { id: 3, sender: 'customer', text: 'About 20 square meters of overgrown garden', time: '8:32 AM' },
        { id: 4, sender: 'agent', text: 'That would be £200 for the clearance. When works best for you?', time: '8:33 AM' },
        { id: 5, sender: 'customer', text: 'Perfect, see you at 3pm', time: '8:35 AM' }
      ]
    }
  ]

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || conv.status === filter
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'bot':
        return 'text-blue-600 bg-blue-100'
      case 'human':
        return 'text-purple-600 bg-purple-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getSenderIcon = (sender) => {
    switch (sender) {
      case 'bot':
        return <Bot className="h-4 w-4" />
      case 'agent':
        return <User className="h-4 w-4" />
      default:
        return <MessageCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="flex h-full">
      {/* Left Panel - Conversation List */}
      <div className="w-96 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversations</h2>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'all' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('bot')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'bot' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Bot
            </button>
            <button
              onClick={() => setFilter('human')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'human' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Human
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedConversation?.id === conversation.id ? 'bg-primary-50 border-primary-200' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">
                    {conversation.customer.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 truncate">{conversation.customer}</p>
                    {conversation.unread && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{conversation.time}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
                      {conversation.status === 'bot' ? <Bot className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                      {conversation.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center Panel - Chat Messages */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {selectedConversation.customer.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedConversation.customer}</h3>
                    <p className="text-sm text-gray-500">{selectedConversation.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedConversation.status)}`}>
                    {selectedConversation.status === 'bot' ? <Bot className="h-4 w-4 mr-1" /> : <User className="h-4 w-4 mr-1" />}
                    {selectedConversation.status}
                  </span>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Phone className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'customer'
                        ? 'bg-primary-500 text-white'
                        : message.sender === 'bot'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {getSenderIcon(message.sender)}
                      <span className="text-xs font-medium capitalize">{message.sender}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">{message.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button className="btn-primary">
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose a conversation from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Customer Details */}
      {selectedConversation && (
        <div className="w-80 border-l border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Customer Details</h3>
          </div>
          
          <div className="p-4 space-y-6">
            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{selectedConversation.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>sarah.johnson@email.com</span>
                </div>
              </div>
            </div>

            {/* Booking History */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Bookings</h4>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Waste Removal</span>
                    <span className="text-xs text-gray-500">2 days ago</span>
                  </div>
                  <p className="text-sm text-gray-600">£55 - Confirmed</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Furniture Disposal</span>
                    <span className="text-xs text-gray-500">1 week ago</span>
                  </div>
                  <p className="text-sm text-gray-600">£120 - Completed</p>
                </div>
              </div>
            </div>

            {/* Customer Tags */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Tag className="h-3 w-3 mr-1" />
                  VIP
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Tag className="h-3 w-3 mr-1" />
                  Residential
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full btn-primary text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Booking
                </button>
                <button className="w-full btn-secondary text-sm">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Create Quote
                </button>
                <button className="w-full btn-secondary text-sm">
                  <Tag className="h-4 w-4 mr-2" />
                  Add Tag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConversationsView
