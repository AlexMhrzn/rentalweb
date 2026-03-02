import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAdminStats, getPendingApprovals, approveProduct as approveProductApi, rejectProduct as rejectProductApi, getUser, deleteUserById, updateUserById, getProducts, getProductById, updateProduct, deleteProduct } from '../services/api';
import { useRef } from 'react';

const AdminDashboard = () => {
      const [viewProperty, setViewProperty] = useState(null);
    // Property action handlers (must be top-level)
    const handleViewProperty = (property) => {
      setViewProperty(property);
    };

    const handleEditProperty = (property) => {
      setEditPropertyId(property.id);
      setEditPropertyData({
        location: property.location,
        price: property.price,
        description: property.description,
      });
    };

    const handleEditPropertyChange = (e) => {
      const { name, value } = e.target;
      setEditPropertyData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateProperty = async (id) => {
      try {
        await updateProduct(id, editPropertyData);
        toast.success('Property updated');
        setEditPropertyId(null);
        fetchDashboardData();
      } catch (err) {
        toast.error('Failed to update property');
      }
    };

    const handleDeleteProperty = async (id) => {
      if (!window.confirm('Are you sure you want to delete this property?')) return;
      try {
        await deleteProduct(id);
        toast.success('Property deleted');
        fetchDashboardData();
      } catch (err) {
        toast.error('Failed to delete property');
      }
    };
  const [allProperties, setAllProperties] = useState([]);
  const [editPropertyId, setEditPropertyId] = useState(null);
  const [editPropertyData, setEditPropertyData] = useState({ location: '', price: '', description: '' });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOwners: 0,
    activeListings: 0,
    monthlyRevenue: 0,
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [owners, setOwners] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({ username: '', email: '', role: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refetch when page becomes visible (e.g. switching back from another tab)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchDashboardData();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setUsersLoading(true);
      const [statsRes, approvalsRes, usersRes, productsRes] = await Promise.all([
        getAdminStats().catch(() => ({ data: { stats: null } })),
        getPendingApprovals().catch(() => ({ data: { products: [] } })),
        getUser().catch(() => ({ data: { users: [] } })),
        getProducts().catch(() => ({ data: { products: [] } })),
      ]);
      if (statsRes.data?.stats) {
        setStats(statsRes.data.stats);
      }
      const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';
      const products = approvalsRes.data?.products || [];
      setPendingApprovals(products.map((p, i) => {
        const img = p.image || 'https://via.placeholder.com/80x60?text=Property';
        const image = img.startsWith('http') ? img : (apiBase ? `${apiBase}/${img}` : img);
        return {
          id: p.id,
          image,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          ownerName: p.owner?.username || 'Unknown',
          location: p.location || p.city || 'N/A',
          price: p.price,
        };
      }));
      // Separate users and owners by role
      const allUsers = usersRes.data?.users || [];
      setUsers(allUsers.filter(u => u.role === 'user'));
      setOwners(allUsers.filter(u => u.role === 'owner'));
      // Store all properties
      const allProps = productsRes.data?.products || [];
      setAllProperties(allProps.map((p) => {
        const img = p.image || 'https://via.placeholder.com/80x60?text=Property';
        const image = img.startsWith('http') ? img : (apiBase ? `${apiBase}/${img}` : img);
        return {
          id: p.id,
          image,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          ownerName: p.owner?.username || 'Unknown',
          location: p.location || p.city || 'N/A',
          price: p.price,
          description: p.description || '',
        };
      }));

    } catch (err) {
      toast.error('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
      setUsersLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token-37c');
    localStorage.removeItem('user-role');
    localStorage.removeItem('currentMode');
    setShowProfileDropdown(false);
    toast.success('Logged out successfully');
    navigate('/admin-login');
  };
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPage, setReportsPage] = useState(1);
  const itemsPerPage = 5;

  const cityData = [
    { city: 'Kathmandu', count: 420, color: 'from-[#ffecd2] to-[#fcb69f]' },
    { city: 'Lalitpur', count: 210, color: 'from-[#a1c4fd] to-[#c2e9fb]' },
    { city: 'Bhaktapur', count: 120, color: 'from-[#fbc2eb] to-[#a6c1ee]' },
    { city: 'Pokhara', count: 280, color: 'from-[#fdfbfb] to-[#ebedee]' },
    { city: 'Butwal', count: 45, color: 'from-[#f6d365] to-[#fda085]' },
    { city: 'Chitwan', count: 95, color: 'from-[#84fab0] to-[#8fd3f4]' }
  ];

  const maxCount = cityData.length ? Math.max(...cityData.map(d => d.count)) : 1;

  const propertyTypes = [
    { type: 'Room', color: 'from-[#f7971e] to-[#ffd200]' },
    { type: 'Flat', color: 'from-[#c471f5] to-[#fa71cd]' },
    { type: 'House', color: 'from-[#43cea2] to-[#185a9d]' },
    { type: 'Hostel', color: 'from-[#ff512f] to-[#dd2476]' },
    { type: 'Office Space', color: 'from-[#56ab2f] to-[#a8e063]' }
  ];
  // ...existing code...

  const navItems = [
    { name: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Owners', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { name: 'Properties', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Approvals', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
  ];

  const handleApprove = async (id) => {
    try {
      await approveProductApi(id);
      toast.success('Property approved successfully');
      setPendingApprovals((prev) => prev.filter((p) => p.id !== id));
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this property?')) return;
    try {
      await rejectProductApi(id);
      toast.success('Property rejected');
      setPendingApprovals((prev) => prev.filter((p) => p.id !== id));
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUserById(id);
      setUsers(users.filter(u => u.id !== id));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleEditUser = (user) => {
    setEditUserId(user.id);
    setEditUserData({ username: user.username, email: user.email, role: user.role });
  };

  const handleEditInputChange = (e) => {
    setEditUserData({ ...editUserData, [e.target.name]: e.target.value });
  };

  const handleUpdateUser = async (id) => {
    try {
      await updateUserById(id, editUserData);
      setUsers(users.map(u => u.id === id ? { ...u, ...editUserData } : u));
      setEditUserId(null);
      toast.success('User updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const totalPages = Math.ceil(pendingApprovals.length / itemsPerPage);
  const reportsTotalPages = Math.ceil(recentReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const reportsStartIndex = (reportsPage - 1) * itemsPerPage;
  const reportsEndIndex = reportsStartIndex + itemsPerPage;

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#E0F7FA] via-[#F1F8E9] to-[#E8F5E9]">
      {/* Sidebar */}
      <aside className="w-64 bg-white/90 backdrop-blur-lg shadow-xl shadow-teal-100/40 flex flex-col border-r border-teal-100">
        <div className="p-8 border-b border-teal-100">
          <h1 className="text-3xl font-extrabold text-teal-700 drop-shadow-sm tracking-tight">Rental Admin</h1>
          <p className="text-base text-slate-600 font-medium mt-2">Nepal Marketplace</p>
        </div>
        <nav className="flex-1 p-6 space-y-3">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveNav(item.name)}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-xl transition-colors text-lg font-semibold ${
                activeNav === item.name
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-200/50 scale-105'
                  : 'text-teal-700 hover:bg-teal-50 hover:scale-105'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-lg shadow-xl shadow-teal-100/40 border-b border-teal-100 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users, properties, reports..."
                  className="w-full pl-12 pr-5 py-3 rounded-2xl border-2 border-teal-200 text-slate-900 placeholder-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all text-base bg-white shadow-sm"
                />
                <svg
                  className="absolute left-4 top-3 w-6 h-6 text-teal-400 drop-shadow"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* Notifications */}
              <button className="relative p-3 text-teal-600 hover:text-teal-800 transition-colors rounded-full bg-teal-50 shadow-md">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full animate-bounce"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-4 p-3 rounded-xl hover:bg-teal-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    A
                  </div>
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-teal-100 py-2 z-50">
                    <button onClick={() => { setShowProfileDropdown(false); }} className="block w-full text-left px-5 py-3 text-base text-teal-700 hover:bg-teal-50">Profile</button>
                    <button onClick={() => { setShowProfileDropdown(false); }} className="block w-full text-left px-5 py-3 text-base text-teal-700 hover:bg-teal-50">Settings</button>
                    <hr className="my-2 border-teal-100" />
                    <button onClick={handleLogout} className="block w-full text-left px-5 py-3 text-base text-red-600 hover:bg-teal-50">Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {loading && activeNav === 'Dashboard' && (
            <div className="flex justify-center py-12">
              <div className="text-teal-600">Loading...</div>
            </div>
          )}
          {activeNav === 'Dashboard' && !loading && (
            <div className="space-y-8">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Card: Total Users */}
                <div className="bg-gradient-to-br from-blue-100 via-teal-100 to-green-100 rounded-2xl shadow-xl p-8 border border-teal-100 hover:scale-105 transition-transform duration-200 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg text-teal-700 mb-2 font-semibold">Total Users</p>
                      <p className="text-4xl font-extrabold text-teal-900 drop-shadow">{stats.totalUsers.toLocaleString()}</p>
                    </div>
                    <div className="w-16 h-16 bg-blue-200 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-green-600 mt-4 font-medium">+12% from last month</p>
                </div>

                {/* Card: Total Owners */}
                <div className="bg-gradient-to-br from-purple-100 via-teal-100 to-blue-100 rounded-2xl shadow-xl p-8 border border-teal-100 hover:scale-105 transition-transform duration-200 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg text-teal-700 mb-2 font-semibold">Total Owners</p>
                      <p className="text-4xl font-extrabold text-teal-900 drop-shadow">{stats.totalOwners.toLocaleString()}</p>
                    </div>
                    <div className="w-16 h-16 bg-purple-200 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-green-600 mt-4 font-medium">+8% from last month</p>
                </div>

                {/* Card: Active Listings */}
                <div className="bg-gradient-to-br from-teal-100 via-green-100 to-blue-100 rounded-2xl shadow-xl p-8 border border-teal-100 hover:scale-105 transition-transform duration-200 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg text-teal-700 mb-2 font-semibold">Active Listings</p>
                      <p className="text-4xl font-extrabold text-teal-900 drop-shadow">{stats.activeListings.toLocaleString()}</p>
                    </div>
                    <div className="w-16 h-16 bg-teal-200 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-green-600 mt-4 font-medium">+15% from last month</p>
                </div>

                {/* Card: Monthly Revenue */}
                <div className="bg-gradient-to-br from-green-100 via-teal-100 to-blue-100 rounded-2xl shadow-xl p-8 border border-teal-100 hover:scale-105 transition-transform duration-200 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg text-teal-700 mb-2 font-semibold">Monthly Revenue</p>
                      <p className="text-4xl font-extrabold text-teal-900 drop-shadow">NPR {stats.monthlyRevenue.toLocaleString()}</p>
                    </div>
                    <div className="w-16 h-16 bg-green-200 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-green-600 mt-4 font-medium">+22% from last month</p>
                </div>
              </div>

              {/* Property Postings by City Chart */}
              <div className="bg-gradient-to-br from-[#e0eafc] to-[#cfdef3] rounded-2xl shadow-2xl p-8 border border-white animate-fade-in">
                <h2 className="text-3xl font-extrabold text-[#185a9d] mb-8 flex items-center gap-3">
                  <svg className="w-8 h-8 text-[#43cea2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  Property Postings by City
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {cityData.map((item, index) => (
                    <div key={item.city} className={`bg-gradient-to-br ${item.color} rounded-xl shadow-xl p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform`}>
                      <div className="text-2xl font-bold text-gray-800 mb-2">{item.city}</div>
                      <div className="w-full h-6 bg-white/40 rounded-full mb-2">
                        <div className="h-full bg-white/80 rounded-full transition-all duration-500" style={{ width: `${(item.count / maxCount) * 100}%` }}></div>
                      </div>
                      <span className="text-lg font-bold text-gray-900 drop-shadow">{item.count} Listings</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Property Types Section */}
              <div className="bg-gradient-to-br from-[#f8ffae] via-[#43cea2] to-[#185a9d] rounded-2xl shadow-2xl p-8 border border-white animate-fade-in mt-8">
                <h2 className="text-3xl font-extrabold text-[#185a9d] mb-8 flex items-center gap-3">
                  <svg className="w-8 h-8 text-[#43cea2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Property Types
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                  {propertyTypes.map((item, idx) => (
                    <div key={item.type} className={`bg-gradient-to-br ${item.color} rounded-xl shadow-xl p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform`}>
                      <div className="text-2xl font-bold text-gray-800 mb-2">{item.type}</div>
                      <svg className="w-10 h-10 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Reports & Complaints */}
              <div className="bg-gradient-to-br from-[#E0F7FA] via-[#F1F8E9] to-[#E8F5E9] rounded-2xl shadow-2xl border border-teal-100 animate-fade-in p-8">
                <h2 className="text-3xl font-extrabold text-teal-700 mb-8 flex items-center gap-3">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Recent Reports & Complaints
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {recentReports.slice(reportsStartIndex, reportsEndIndex).map((report) => (
                    <div key={report.id} className="bg-white rounded-xl shadow-lg p-6 border border-teal-100 flex flex-col gap-3 hover:scale-[1.02] transition-transform">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-2 text-sm font-bold rounded-full ${report.type === 'Complaint' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{report.type}</span>
                        <span className={`px-3 py-2 text-sm font-bold rounded-full ${report.status === 'Resolved' ? 'bg-green-100 text-green-800' : report.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{report.status}</span>
                      </div>
                      <div className="text-lg font-semibold text-teal-900">{report.title}</div>
                      <div className="text-base text-teal-700 font-medium">Reporter: {report.reporter}</div>
                      <div className="text-sm text-gray-500">Date: {report.date}</div>
                      <div className="flex justify-end">
                        <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 font-semibold">View</button>
                      </div>
                    </div>
                  ))}
                </div>
                {reportsTotalPages > 1 && (
                  <div className="py-6 border-t border-teal-100 flex items-center justify-between">
                    <div className="text-base text-teal-700 font-medium">
                      Showing {reportsStartIndex + 1} to {Math.min(reportsEndIndex, recentReports.length)} of {recentReports.length} results
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setReportsPage(prev => Math.max(1, prev - 1))}
                        disabled={reportsPage === 1}
                        className="px-5 py-3 border border-teal-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-50 text-teal-700 font-semibold"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setReportsPage(prev => Math.min(reportsTotalPages, prev + 1))}
                        disabled={reportsPage === reportsTotalPages}
                        className="px-5 py-3 border border-teal-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-50 text-teal-700 font-semibold"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
                      {activeNav === 'Settings' && (
                        <div className="bg-gradient-to-br from-[#E0F7FA] via-[#F1F8E9] to-[#E8F5E9] rounded-2xl shadow-2xl border border-teal-100 animate-fade-in p-8 max-w-2xl mx-auto">
                          <h2 className="text-3xl font-extrabold text-teal-700 mb-8 flex items-center gap-3">
                            <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                            Settings
                          </h2>
                          <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-teal-100 flex flex-col gap-4">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-teal-700">Dark Mode</span>
                                <button className="bg-teal-100 px-4 py-2 rounded-full text-teal-700 font-bold hover:bg-teal-200 transition">Toggle</button>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-teal-700">Notifications</span>
                                <button className="bg-teal-100 px-4 py-2 rounded-full text-teal-700 font-bold hover:bg-teal-200 transition">Toggle</button>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-teal-700">Account Privacy</span>
                                <button className="bg-teal-100 px-4 py-2 rounded-full text-teal-700 font-bold hover:bg-teal-200 transition">Toggle</button>
                              </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-teal-100 flex flex-col gap-4">
                              <span className="font-semibold text-teal-700 mb-2">Change Password</span>
                              <input type="password" placeholder="Current Password" className="w-full border px-3 py-2 rounded mb-2" />
                              <input type="password" placeholder="New Password" className="w-full border px-3 py-2 rounded mb-2" />
                              <button className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition">Update Password</button>
                            </div>
                          </div>
                        </div>
                      )}
            </div>
          )}

          {/* Other Navigation Views */}
                    {activeNav === 'Approvals' && !loading && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                          <h2 className="text-xl font-semibold text-gray-800">Pending Property Approvals</h2>
                          <button
                            onClick={() => fetchDashboardData()}
                            className="px-4 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">

                              {pendingApprovals.slice(startIndex, endIndex).map((approval) => (
                                <tr key={approval.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col items-start">
                                      <img src={approval.image} alt="Property" className="w-20 h-16 object-cover rounded" />
                                      <div className="text-xs text-gray-400 mt-1">Posted: {approval.createdAt ? new Date(approval.createdAt).toLocaleString() : 'N/A'}</div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{approval.ownerName}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{approval.location}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-gray-900">NPR {approval.price.toLocaleString()}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleApprove(approval.id)}
                                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleReject(approval.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {totalPages > 1 && (
                          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                              Showing {startIndex + 1} to {Math.min(endIndex, pendingApprovals.length)} of {pendingApprovals.length} results
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                              >
                                Previous
                              </button>
                              <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
          {activeNav === 'Users' && (
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-teal-100 animate-fade-in">
              <h2 className="text-2xl font-bold text-teal-700 mb-8">Manage Users</h2>
              {usersLoading ? (
                <div className="text-center text-teal-400 py-12 text-lg font-semibold animate-pulse">Loading users...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-teal-50">
                      <tr>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-teal-700 uppercase tracking-wider">ID</th>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-teal-700 uppercase tracking-wider">Username</th>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-teal-700 uppercase tracking-wider">Email</th>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-teal-700 uppercase tracking-wider">Role</th>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-teal-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-teal-100">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-teal-50 transition-colors animate-fade-in">
                          <td className="px-8 py-4 whitespace-nowrap text-base font-semibold text-teal-900">{user.id}</td>
                          <td className="px-8 py-4 whitespace-nowrap">
                            {editUserId === user.id ? (
                              <input
                                name="username"
                                value={editUserData.username}
                                onChange={handleEditInputChange}
                                className="border-2 border-teal-200 px-3 py-2 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500"
                              />
                            ) : (
                              <span className="text-teal-700 font-semibold">{user.username}</span>
                            )}
                          </td>
                          <td className="px-8 py-4 whitespace-nowrap">
                            {editUserId === user.id ? (
                              <input
                                name="email"
                                value={editUserData.email}
                                onChange={handleEditInputChange}
                                className="border-2 border-teal-200 px-3 py-2 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500"
                              />
                            ) : (
                              <span className="text-teal-700 font-medium">{user.email}</span>
                            )}
                          </td>
                          <td className="px-8 py-4 whitespace-nowrap">
                            {editUserId === user.id ? (
                              <select
                                name="role"
                                value={editUserData.role}
                                onChange={handleEditInputChange}
                                className="border-2 border-teal-200 px-3 py-2 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            ) : (
                              <span className={`px-3 py-2 rounded-full text-base font-bold ${user.role === 'admin' ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white' : 'bg-teal-50 text-teal-700'}`}>{user.role}</span>
                            )}
                          </td>
                          <td className="px-8 py-4 whitespace-nowrap text-base font-semibold">
                            {editUserId === user.id ? (
                              <>
                                <button
                                  onClick={() => handleUpdateUser(user.id)}
                                  className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-5 py-2 rounded-xl mr-3 shadow-md hover:scale-105 transition-transform"
                                >Save</button>
                                <button
                                  onClick={() => setEditUserId(null)}
                                  className="bg-teal-50 text-teal-700 px-5 py-2 rounded-xl shadow hover:bg-teal-100"
                                >Cancel</button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-5 py-2 rounded-xl mr-3 shadow-md hover:scale-105 transition-transform"
                                >Edit</button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-xl shadow-md hover:scale-105 transition-transform"
                                >Delete</button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeNav === 'Owners' && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Manage Owners</h2>
              {usersLoading ? (
                <div className="text-center text-slate-500 py-8">Loading owners...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {owners.map(owner => (
                        <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">{owner.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editUserId === owner.id ? (
                              <input
                                name="username"
                                value={editUserData.username}
                                onChange={handleEditInputChange}
                                className="border px-2 py-1 rounded"
                              />
                            ) : (
                              owner.username
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editUserId === owner.id ? (
                              <input
                                name="email"
                                value={editUserData.email}
                                onChange={handleEditInputChange}
                                className="border px-2 py-1 rounded"
                              />
                            ) : (
                              owner.email
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editUserId === owner.id ? (
                              <select
                                name="role"
                                value={editUserData.role}
                                onChange={handleEditInputChange}
                                className="border px-2 py-1 rounded"
                              >
                                <option value="owner">Owner</option>
                                <option value="admin">Admin</option>
                              </select>
                            ) : (
                              owner.role
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {editUserId === owner.id ? (
                              <>
                                <button
                                  onClick={() => handleUpdateUser(owner.id)}
                                  className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded mr-2"
                                >Save</button>
                                <button
                                  onClick={() => setEditUserId(null)}
                                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded"
                                >Cancel</button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditUser(owner)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2"
                                >Edit</button>
                                <button
                                  onClick={() => handleDeleteUser(owner.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                >Delete</button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {activeNav === 'Properties' && (
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-teal-100 animate-fade-in">
              <h2 className="text-2xl font-bold text-teal-700 mb-8">All Properties Posted by Owners</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-teal-50">
                    <tr>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-teal-700 uppercase tracking-wider">Image</th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-teal-700 uppercase tracking-wider">Owner</th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-teal-700 uppercase tracking-wider">Location</th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-teal-700 uppercase tracking-wider">Price</th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-teal-700 uppercase tracking-wider">Posted</th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-teal-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-teal-100">
                    {allProperties.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-8 text-teal-400">No properties found.</td></tr>
                    ) : (
                      allProperties.map((prop) => (
                        <tr key={prop.id} className="hover:bg-teal-50 transition-colors animate-fade-in">
                          <td className="px-8 py-4"><img src={prop.image} alt="Property" className="w-20 h-16 object-cover rounded" /></td>
                          <td className="px-8 py-4 font-semibold text-teal-900">{prop.ownerName}</td>
                          <td className="px-8 py-4">{prop.location}</td>
                          <td className="px-8 py-4">{prop.price}</td>
                          <td className="px-8 py-4 text-xs text-gray-400">{prop.createdAt ? new Date(prop.createdAt).toLocaleString() : 'N/A'}</td>
                          <td className="px-8 py-4 flex gap-2">
                            <button onClick={() => handleViewProperty(prop)} className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">View</button>
                            <button onClick={() => handleEditProperty(prop)} className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200">Edit</button>
                            <button onClick={() => handleDeleteProperty(prop.id)} className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200">Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* View Property Modal */}
              {viewProperty && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
                    <h3 className="text-xl font-bold mb-4">Property Details</h3>
                    <div className="space-y-4">
                      <img src={viewProperty.image} alt="Property" className="w-full h-40 object-cover rounded" />
                      <div><strong>Owner:</strong> {viewProperty.ownerName}</div>
                      <div><strong>Location:</strong> {viewProperty.location}</div>
                      <div><strong>Price:</strong> {viewProperty.price}</div>
                      <div><strong>Description:</strong> {viewProperty.description}</div>
                      <div><strong>Posted:</strong> {viewProperty.createdAt ? new Date(viewProperty.createdAt).toLocaleString() : 'N/A'}</div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button onClick={() => setViewProperty(null)} className="px-4 py-2 rounded bg-gray-200 text-gray-700">Close</button>
                    </div>
                  </div>
                </div>
              )}
              {/* Edit Property Modal */}
              {editPropertyId && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
                    <h3 className="text-xl font-bold mb-4">Edit Property</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        name="location"
                        value={editPropertyData.location}
                        onChange={handleEditPropertyChange}
                        placeholder="Location"
                        className="w-full border px-3 py-2 rounded"
                      />
                      <input
                        type="text"
                        name="price"
                        value={editPropertyData.price}
                        onChange={handleEditPropertyChange}
                        placeholder="Price"
                        className="w-full border px-3 py-2 rounded"
                      />
                      <textarea
                        name="description"
                        value={editPropertyData.description}
                        onChange={handleEditPropertyChange}
                        placeholder="Description"
                        className="w-full border px-3 py-2 rounded"
                      />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button onClick={() => setEditPropertyId(null)} className="px-4 py-2 rounded bg-gray-200 text-gray-700">Cancel</button>
                      <button onClick={() => handleUpdateProperty(editPropertyId)} className="px-4 py-2 rounded bg-teal-600 text-white">Save</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
    </main>
  </div>
  </div>
  );
}

export default AdminDashboard;
