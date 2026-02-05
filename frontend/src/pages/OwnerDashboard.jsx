import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyProducts } from '../services/api';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [activeBottomNav, setActiveBottomNav] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const [myProperties, setMyProperties] = useState([]);

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      const res = await getMyProducts();
      const products = (res.data?.products || []).map((p) => ({
        id: p.id,
        image: p.image || 'https://via.placeholder.com/300x200?text=Property',
        title: p.title,
        status: p.status === 'active' ? 'Active' : p.status === 'rented' ? 'Rented' : p.status === 'pending' ? 'Pending' : 'Rejected',
        price: p.price,
        location: p.location || p.city || p.area || 'N/A',
      }));
      setMyProperties(products);
    } catch (err) {
      toast.error('Failed to load properties');
      setMyProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalListings: myProperties.length,
    activeRentals: myProperties.filter((p) => p.status === 'Active' || p.status === 'Rented').length,
    pendingRequests: myProperties.filter((p) => p.status === 'Pending').length,
    totalViews: 0,
  };

  const recentInquiries = [
    {
      id: 1,
      renterName: 'Suman Thapa',
      propertyName: 'Room for Rent in Koteshwor',
      avatar: 'https://via.placeholder.com/40?text=ST',
      time: '2 hours ago'
    },
    {
      id: 2,
      renterName: 'Priya Shrestha',
      propertyName: '2 BHK Apartment in Thamel',
      avatar: 'https://via.placeholder.com/40?text=PS',
      time: '5 hours ago'
    },
    {
      id: 3,
      renterName: 'Rajesh Gurung',
      propertyName: 'Studio Apartment in Baneshwor',
      avatar: 'https://via.placeholder.com/40?text=RG',
      time: '1 day ago'
    },
    {
      id: 4,
      renterName: 'Anita Basnet',
      propertyName: '1 BHK Flat in Patan',
      avatar: 'https://via.placeholder.com/40?text=AB',
      time: '2 days ago'
    }
  ];

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProperty, setNewProperty] = useState({ title: '', price: '', location: '', city: '', category: 'Room' });
  const [submitting, setSubmitting] = useState(false);

  const handlePostProperty = () => {
    setShowAddModal(true);
  };

  const handleSubmitProperty = async (e) => {
    e?.preventDefault();
    if (!newProperty.title || !newProperty.price) {
      toast.error('Title and price are required');
      return;
    }
    try {
      setSubmitting(true);
      const { createProduct } = await import('../services/api');
      await createProduct(newProperty);
      toast.success('Property submitted for approval');
      setShowAddModal(false);
      setNewProperty({ title: '', price: '', location: '', city: '', category: 'Room' });
      fetchMyProperties();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePropertyAction = (action, propertyId) => {
    toast.success(`${action} action for property ${propertyId}`);
    // Handle property actions
  };

  const handleReply = (inquiryId) => {
    toast.success(`Replying to inquiry ${inquiryId}`);
    // Handle reply action
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'Rented':
        return 'bg-blue-100 text-blue-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-teal-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">
                Namaste, Owner 👋
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your rental properties
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Notification Bell */}
              <button className="relative p-2 text-gray-600 hover:text-teal-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {/* Profile Avatar */}
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                O
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Summary Stat Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Listings */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">Total Listings</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalListings}</p>
          </div>

          {/* Active Rentals */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">Active Rentals</p>
            <p className="text-2xl font-bold text-gray-800">{stats.activeRentals}</p>
          </div>

          {/* Pending Requests */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">Pending Requests</p>
            <p className="text-2xl font-bold text-gray-800">{stats.pendingRequests}</p>
          </div>

          {/* Total Views */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">Total Views</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalViews.toLocaleString()}</p>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handlePostProperty}
          className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>+ Post New Property</span>
        </button>

        {/* My Properties Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">My Properties</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : myProperties.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-2xl">No properties yet. Post your first property!</div>
          ) : (
          <div className="space-y-4">
            {myProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex">
                  {/* Property Image */}
                  <div className="w-32 h-32 flex-shrink-0">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Property Details */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2">
                          {property.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">{property.location}</p>
                        <p className="text-lg font-bold text-teal-600">
                          NPR {property.price.toLocaleString()}/mo
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(property.status)}`}>
                        {property.status}
                      </span>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => handlePropertyAction('Edit', property.id)}
                        className="flex-1 bg-teal-50 text-teal-600 text-xs font-semibold py-2 rounded-lg hover:bg-teal-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handlePropertyAction('View', property.id)}
                        className="flex-1 bg-gray-50 text-gray-600 text-xs font-semibold py-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handlePropertyAction('Delete', property.id)}
                        className="flex-1 bg-red-50 text-red-600 text-xs font-semibold py-2 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Recent Inquiries Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Inquiries</h2>
          <div className="space-y-3">
            {recentInquiries.map((inquiry) => (
              <div key={inquiry.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <img
                    src={inquiry.avatar}
                    alt={inquiry.renterName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {/* Inquiry Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800">
                          {inquiry.renterName}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {inquiry.propertyName}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">{inquiry.time}</span>
                    </div>
                    <button
                      onClick={() => handleReply(inquiry.id)}
                      className="mt-2 bg-teal-500 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around px-2 py-3">
          {/* Dashboard */}
          <button
            onClick={() => setActiveBottomNav('Dashboard')}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
              activeBottomNav === 'Dashboard' ? 'text-teal-600' : 'text-gray-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Dashboard</span>
          </button>

          {/* Listings */}
          <button
            onClick={() => setActiveBottomNav('Listings')}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
              activeBottomNav === 'Listings' ? 'text-teal-600' : 'text-gray-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs font-medium">Listings</span>
          </button>

          {/* Add Property */}
          <button
            onClick={() => {
              setActiveBottomNav('Add Property');
              handlePostProperty();
            }}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
              activeBottomNav === 'Add Property' ? 'text-teal-600' : 'text-gray-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs font-medium">Add</span>
          </button>

          {/* Messages */}
          <button
            onClick={() => setActiveBottomNav('Messages')}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
              activeBottomNav === 'Messages' ? 'text-teal-600' : 'text-gray-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs font-medium">Messages</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => {
              setActiveBottomNav('Profile');
              navigate('/switchrole');
            }}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
              activeBottomNav === 'Profile' ? 'text-teal-600' : 'text-gray-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>

      {/* Add Property Modal */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowAddModal(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 z-50 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Post New Property</h2>
            <form onSubmit={handleSubmitProperty} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newProperty.title}
                  onChange={(e) => setNewProperty((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. 2BHK Flat in Thamel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (NPR/month)</label>
                <input
                  type="number"
                  value={newProperty.price}
                  onChange={(e) => setNewProperty((p) => ({ ...p, price: e.target.value }))}
                  placeholder="15000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newProperty.location}
                  onChange={(e) => setNewProperty((p) => ({ ...p, location: e.target.value }))}
                  placeholder="Thamel, Kathmandu"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={newProperty.city}
                  onChange={(e) => setNewProperty((p) => ({ ...p, city: e.target.value }))}
                  placeholder="Kathmandu"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newProperty.category}
                  onChange={(e) => setNewProperty((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {['Room', 'Flat', 'House', 'Hostel', 'Office Space'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-teal-600 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;
