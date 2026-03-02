import React, { useEffect, useState } from 'react';
import { getProfile, getMyProducts, getMyFavorites, getUserBookingRequests } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  // determine user mode ('user' or 'owner') from localStorage
  const mode = localStorage.getItem('currentMode') || 'user';

  const loadProfile = async () => {
    try {
      const res = await getProfile();
      if (res.data.success) {
        setProfile(res.data.user);
        await loadStats(res.data.user);
      } else {
        toast.error(res.data.message || 'Unable to fetch profile');
        // don't automatically redirect, let user see message
      }
    } catch (err) {
      console.error('loadProfile error', err);
      const msg = err.response?.data?.message || err.message || 'Unable to fetch profile';
      toast.error(msg);
      // navigate('/login');  // comment out to avoid instant redirect when server is down
    }
  };

  const loadStats = async (user) => {
    try {
      if (mode === 'owner') {
        const p = await getMyProducts();
        const all = p.data?.products || [];
        const total = all.length;
        const active = all.filter((x) => x.status === 'active' || x.status === 'rented').length;
        setStats({ totalProperties: total, activeRentals: active });
      } else {
        const f = await getMyFavorites();
        const b = await getUserBookingRequests();
        setStats({ saved: f.data?.products?.length || 0, bookings: b.data?.bookings?.length || 0 });
      }
    } catch (e) {
      // ignore
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token-37c');
    localStorage.removeItem('user-role');
    navigate('/login');
  };

  // helper to go to account page
  const goToAccount = () => {
    navigate('/profile/account');
  };

  const handleSwitchMode = () => {
    const newMode = mode === 'user' ? 'owner' : 'user';
    localStorage.setItem('currentMode', newMode);
    toast.success(`Switched to ${newMode === 'owner' ? 'Owner' : 'User'} Mode`);
    if (newMode === 'owner') navigate('/ownerdashboard');
    else navigate('/userdashboard');
  };

  if (!profile) return null;
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-4 bg-white border-r border-gray-200 rounded-xl p-0 flex flex-col items-center">
            {/* Cover Photo */}
            <div className="w-full h-28 bg-gradient-to-r from-teal-400 to-teal-600 rounded-t-xl mb-0 flex items-end justify-center relative">
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                {profile.profile_image ? (
                  <img
                    src={profile.profile_image.startsWith('http') ? profile.profile_image : `${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''}/${profile.profile_image}`}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-teal-600">{(profile.username || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
            <div className="pt-16 pb-2 px-6 w-full flex flex-col items-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-1">{profile.username}</h2>
              <p className="text-sm text-gray-500 mb-2">{profile.email}</p>
              <span className="px-3 py-1 rounded bg-teal-50 text-teal-700 text-xs font-semibold mb-2">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                {/* Phone icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 14a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2zm14-14a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5a2 2 0 012-2h2zm0 14a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2z" /></svg>
                <span>{profile.phone || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                {/* Calendar/Joined icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span>Joined: {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
              <button
                onClick={handleSwitchMode}
                className="w-full py-2 bg-amber-500 text-white rounded-lg font-medium mb-4 hover:bg-amber-600 transition"
              >
                Switch to {mode === 'user' ? 'Owner' : 'User'} Mode
              </button>
              <button
                onClick={goToAccount}
                className="w-full py-2 bg-teal-600 text-white rounded-lg font-medium mb-2 hover:bg-teal-700 transition"
              >
                My Account
              </button>
              {mode === 'user' && (
                <button
                  onClick={() => navigate('/favorites')}
                  className="w-full py-2 bg-teal-600 text-white rounded-lg font-medium mb-2 hover:bg-teal-700 transition"
                >
                  View Favourites
                </button>
              )}
              <button
                onClick={() => setShowSettings(true)}
                className="w-full py-2 bg-teal-500 text-white rounded-lg font-medium mb-2 hover:bg-teal-600 transition"
              >
                Settings
              </button>
              <div className="flex-1" />
              <button
                onClick={handleLogout}
                className="w-full py-2 bg-red-100 text-red-700 rounded-lg font-medium mt-8 hover:bg-red-200 transition"
                style={{ marginTop: 'auto' }}
              >
                Logout
              </button>
            </div>
          </aside>
          {/* Main Content */}
          <main className="md:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Saved Properties */}
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-teal-700 mb-4">Saved Properties</h3>
                {/* Example grid for properties, replace with actual data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* You can map stats.savedProperties here if available */}
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-slate-500">No saved properties yet.</div>
                </div>
              </section>
              {/* Booking Requests */}
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-teal-700 mb-4">Booking Requests</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* You can map stats.bookingRequests here if available */}
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-slate-500">No booking requests yet.</div>
                </div>
              </section>
            </div>
            {/* Bio Section */}
            <section className="bg-gray-100 p-6 rounded-xl mb-8">
              <h3 className="text-lg font-semibold text-teal-700 mb-2">Bio</h3>
              <p className={profile.bio ? "" : "italic text-gray-400"}>{profile.bio || 'No bio added yet.'}</p>
            </section>
            {/* Owner/User Stats */}
            {mode === 'owner' && (
              <div className="bg-teal-50 p-4 rounded-xl mb-8">
                <p><strong>Total properties:</strong> {stats.totalProperties}</p>
                <p><strong>Active rentals:</strong> {stats.activeRentals}</p>
                <p><strong>Total earning:</strong> Rs. {stats.totalEarning ?? 0}</p>
                <p><strong>Ratings:</strong> {stats.ratings ?? 'N/A'}</p>
              </div>
            )}
            {mode === 'user' && (
              <div className="bg-teal-50 p-4 rounded-xl mb-8">
                <p><strong>Saved properties:</strong> {stats.saved}</p>
                <p><strong>Booking requests:</strong> {stats.bookings}</p>
              </div>
            )}
          </main>
        </div>
        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
              <button onClick={() => setShowSettings(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">&times;</button>
              <h2 className="text-2xl font-bold mb-4 text-teal-600">Settings</h2>
              <div className="space-y-4">
                <p className="text-gray-700">Settings modal content goes here.</p>
                {/* Add your settings fields here */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
