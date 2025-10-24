import { useState } from 'react'
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MapPin,
  Plus,
  Filter,
  Search
} from 'lucide-react'

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Mock data - will be replaced with real data
  const bookings = [
    {
      id: 1,
      customer: 'Sarah Johnson',
      service: 'Waste Removal',
      time: '10:30 AM',
      duration: '2 hours',
      status: 'confirmed',
      phone: '+44 7123 456789',
      address: '123 Main St, London',
      notes: 'Front door access, ring doorbell'
    },
    {
      id: 2,
      customer: 'Mike Chen',
      service: 'Furniture Disposal',
      time: '2:15 PM',
      duration: '1.5 hours',
      status: 'pending',
      phone: '+44 7234 567890',
      address: '456 Oak Ave, London',
      notes: 'Back entrance, call when arriving'
    },
    {
      id: 3,
      customer: 'Emma Wilson',
      service: 'Garden Clearance',
      time: '4:00 PM',
      duration: '3 hours',
      status: 'confirmed',
      phone: '+44 7345 678901',
      address: '789 Pine Rd, London',
      notes: 'Side gate access'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-orange-600 bg-orange-100'
      case 'completed':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <Clock className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'completed':
        return <Clock className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Manage your bookings and appointments</p>
        </div>
        <button 
          onClick={() => setShowBookingModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>New Booking</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookings..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option>All Status</option>
            <option>Confirmed</option>
            <option>Pending</option>
            <option>Completed</option>
          </select>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Bookings */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Bookings</h3>
              <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
            </div>
            
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {booking.customer.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{booking.customer}</h4>
                          <p className="text-sm text-gray-600">{booking.service}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{booking.time} ({booking.duration})</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{booking.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 col-span-2">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.address}</span>
                        </div>
                      </div>
                      
                      {booking.notes && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                          <strong>Notes:</strong> {booking.notes}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1 capitalize">{booking.status}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Bookings</span>
                <span className="font-semibold text-gray-900">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Confirmed</span>
                <span className="font-semibold text-green-600">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="font-semibold text-orange-600">1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Revenue</span>
                <span className="font-semibold text-gray-900">£175</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monday</span>
                <span className="font-semibold text-gray-900">4 bookings</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tuesday</span>
                <span className="font-semibold text-gray-900">2 bookings</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Wednesday</span>
                <span className="font-semibold text-gray-900">3 bookings</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Thursday</span>
                <span className="font-semibold text-gray-900">1 booking</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Friday</span>
                <span className="font-semibold text-gray-900">5 bookings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Booking</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <input
                  type="text"
                  placeholder="Customer name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>Waste Removal</option>
                  <option>Furniture Disposal</option>
                  <option>Garden Clearance</option>
                  <option>General Waste</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  placeholder="Customer address"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  placeholder="Special instructions"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowBookingModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button className="btn-primary">
                Create Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarView
