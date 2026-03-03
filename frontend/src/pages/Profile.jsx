import React, { useEffect, useState } from 'react';
import { getProfile, getMyProducts, getMyFavorites, getUserBookingRequests, createReport, getMyReports, changePassword } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [reportSubject, setReportSubject] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [myReports, setMyReports] = useState([]);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [themeColor, setThemeColor] = useState('teal');
  const [fontFamily, setFontFamily] = useState("'Inter',sans-serif");

  // load persisted settings
  useEffect(() => {
    const savedColor = localStorage.getItem('themeColor');
    const savedFont = localStorage.getItem('fontFamily');
    if (savedColor) setThemeColor(savedColor);
    if (savedFont) setFontFamily(savedFont);
    applyTheme(savedColor || 'teal', savedFont || "'Inter',sans-serif");
  }, []);

  const applyTheme = (color, font) => {
    const map = {
      teal: ['#14b8a6', '#0d9488'],
      blue: ['#3b82f6', '#2563eb'],
      purple: ['#8b5cf6', '#7c3aed'],
      orange: ['#f97316', '#ea580c'],
    };
    const [primary, primaryDark] = map[color] || map.teal;
    document.documentElement.style.setProperty('--primary', primary);
    document.documentElement.style.setProperty('--primary-dark', primaryDark);
    // compute a translucent version for backgrounds
    const hexToRgb = (h) => {
      const r = parseInt(h.slice(1, 3), 16);
      const g = parseInt(h.slice(3, 5), 16);
      const b = parseInt(h.slice(5, 7), 16);
      return `${r},${g},${b}`;
    };
    document.documentElement.style.setProperty('--primary-alpha', `rgba(${hexToRgb(primary)}, 0.1)`);
    document.body.style.fontFamily = font;
  };


  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (showSettings) {
      loadMyReports();
    }
  }, [showSettings]);

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

  const loadMyReports = async () => {
    try {
      const res = await getMyReports();
      if (res.data.success) {
        setMyReports(res.data.reports);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportSubject || !reportMessage) {
      toast.error('Please fill subject and message');
      return;
    }
    try {
      const res = await createReport({ subject: reportSubject, message: reportMessage });
      if (res.data.success) {
        toast.success('Report submitted');
        setReportSubject('');
        setReportMessage('');
        loadMyReports();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send report');
    }
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const res = await changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      if (res.data.success) {
        toast.success('Password changed');
        setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
        setShowSettings(false);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to change password');
    }
  };

  // helpers
  const goToAccount = () => {
    navigate('/profile/account');
  };

  const handleColorChange = (e) => {
    const c = e.target.value;
    setThemeColor(c);
    localStorage.setItem('themeColor', c);
    applyTheme(c, fontFamily);
  };

  const handleFontChange = (e) => {
    const f = e.target.value;
    setFontFamily(f);
    localStorage.setItem('fontFamily', f);
    applyTheme(themeColor, f);
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
            <div className="w-full h-28 rounded-t-xl mb-0 flex items-end justify-center relative" style={{background: 'linear-gradient(to right, var(--primary), var(--primary-dark))'}}>
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
              <span className="px-3 py-1 rounded text-xs font-semibold mb-2" style={{backgroundColor:'var(--primary-alpha,rgba(20,184,166,.2))', color:'var(--primary)'}}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                {/* Phone icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 14a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2zm14-14a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5a2 2 0 012-2h2zm0 14a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2z" /></svg>
                <span>{profile.phone || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                {/* Calendar/Joined icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
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
                className="w-full py-2 text-white rounded-lg font-medium mb-2 hover:opacity-90 transition bg-primary"
              >
                My Account
              </button>
              {mode === 'user' && (
                <button
                  onClick={() => navigate('/favorites')}
                  className="w-full py-2 text-white rounded-lg font-medium mb-2 hover:opacity-90 transition bg-primary"
                >
                  View Favourites
                </button>
              )}
              <button
                onClick={() => setShowSettings(true)}
                className="w-full py-2 text-white rounded-lg font-medium mb-2 hover:opacity-90 transition bg-primary"
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
            </div>
            {/* Bio Section */}
            <section className="bg-gray-100 p-6 rounded-xl mb-8">
              <h3 className="text-lg font-semibold text-primary mb-2">Bio</h3>
              <p className={profile.bio ? "" : "italic text-gray-400"}>{profile.bio || 'No bio added yet.'}</p>
            </section>
            {/* Owner/User Stats */}
            {mode === 'owner' && (
              <div className="p-4 rounded-xl mb-8" style={{backgroundColor:'var(--primary-alpha, rgba(20,184,166,0.1))'}}>
                <p><strong>Total properties:</strong> {stats.totalProperties}</p>
                <p><strong>Active rentals:</strong> {stats.activeRentals}</p>
                <p><strong>Total earning:</strong> Rs. {stats.totalEarning ?? 0}</p>
                <p><strong>Ratings:</strong> {stats.ratings ?? 'N/A'}</p>
              </div>
            )}
            {mode === 'user' && (
              <div className="p-4 rounded-xl mb-8" style={{backgroundColor:'var(--primary-alpha, rgba(20,184,166,0.1))'}}>
                <p><strong>Saved properties:</strong> {stats.saved}</p>
                <p><strong>Booking requests:</strong> {stats.bookings}</p>
              </div>
            )}
          </main>
        </div>
        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-full h-full rounded-none shadow-2xl p-8 relative overflow-y-auto font-sans">
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl leading-none"
                aria-label="Close settings"
              >&times;</button>
              <h2 className="text-3xl font-extrabold mb-6 text-primary">Settings</h2>
              <div className="space-y-6">
                {/* appearance section */}
                <div className="bg-white p-6 rounded-xl shadow-inner">
                  <h3 className="text-xl font-semibold mb-4 text-primary">Appearance</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Primary color</label>
                      <select
                        value={themeColor}
                        onChange={handleColorChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                      >
                        <option value="teal">Teal</option>
                        <option value="blue">Blue</option>
                        <option value="purple">Purple</option>
                        <option value="orange">Orange</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Font family</label>
                      <select
                        value={fontFamily}
                        onChange={handleFontChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                      >
                        <option value="'Inter',sans-serif">Inter</option>
                        <option value="'Roboto',sans-serif">Roboto</option>
                        <option value="'Montserrat',sans-serif">Montserrat</option>
                      </select>
                    </div>
                  </div>
                </div>
                {/* change password section */}
                <div className="bg-teal-50 p-6 rounded-xl shadow-inner">
                  <h3 className="text-xl font-semibold mb-4 text-teal-800">Change Password</h3>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Current password"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
                      value={pwForm.currentPassword}
                      onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
                      value={pwForm.newPassword}
                      onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                    />
                    <input
                      type="password"
                      placeholder="Confirm new"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
                      value={pwForm.confirm}
                      onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                    />
                    <button
                      onClick={handleChangePassword}
                      className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
                {/* report form */}
                <div className="bg-red-50 p-6 rounded-xl shadow-inner">
                  <h3 className="text-xl font-semibold mb-4 text-red-700">Report an issue</h3>
                  <form onSubmit={handleReportSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Subject</label>
                      <input
                        value={reportSubject}
                        onChange={(e) => setReportSubject(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                        placeholder="Brief subject"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Message</label>
                      <textarea
                        value={reportMessage}
                        onChange={(e) => setReportMessage(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                        rows={4}
                        placeholder="Describe the scam or problem"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
                    >
                      Send Report
                    </button>
                  </form>
                </div>
                {/* list of user reports */}
                {myReports.length > 0 && (
                  <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-lg font-semibold mb-2">My Reports</h3>
                    <ul className="space-y-2 max-h-40 overflow-y-auto">
                      {myReports.map((r) => (
                        <li key={r.id} className="border p-2 rounded">
                          <div className="font-bold">{r.subject}</div>
                          <div className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleString()}</div>
                          <div className="mt-1">{r.message}</div>
                          <div className="mt-1 text-xs text-gray-500">Status: {r.status}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
