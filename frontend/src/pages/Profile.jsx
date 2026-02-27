import React, { useEffect, useState } from 'react';
import { getProfile, getMyProducts, getMyFavorites, getUserBookingRequests } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {profile.profile_image ? (
              <img
                src={profile.profile_image.startsWith('http') ? profile.profile_image : `${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''}/${profile.profile_image}`}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-teal-600">{(profile.username || 'U').charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{profile.username}</h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p><strong>Role:</strong> {mode}</p>
          <p><strong>Phone:</strong> {profile.phone || '—'}</p>
          <p><strong>Joined:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>

        {mode === 'owner' && (
          <div className="mt-4 bg-teal-50 p-4 rounded">
            <p><strong>Total properties:</strong> {stats.totalProperties}</p>
            <p><strong>Active rentals:</strong> {stats.activeRentals}</p>
          </div>
        )}
        {mode === 'user' && (
          <div className="mt-4 bg-teal-50 p-4 rounded">
            <p><strong>Saved properties:</strong> {stats.saved}</p>
            <p><strong>Booking requests:</strong> {stats.bookings}</p>
          </div>
        )}

        { /* switch mode button */ }
        <div className="mt-6 flex gap-3">
          <button onClick={handleSwitchMode} className="px-4 py-2 bg-amber-500 text-white rounded">
            Switch to {mode === 'user' ? 'Owner' : 'User'} Mode
          </button>
        </div>

        <div className="mt-4 flex gap-3">
          <button onClick={goToAccount} className="px-4 py-2 bg-teal-600 text-white rounded">
            My Account
          </button>
          <button onClick={handleLogout} className="px-4 py-2 bg-gray-700 text-white rounded">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
