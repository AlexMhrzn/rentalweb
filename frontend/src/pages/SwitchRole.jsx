import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMe } from '../services/api';
import { getUserRole } from '../protected/Auth';

const SwitchRole = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);
  const [currentMode, setCurrentMode] = useState(() => {
    // Get current mode from localStorage, default to 'user'
    return localStorage.getItem('currentMode') || 'user';
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await getMe();
      setUser(response.data);
    } catch (error) {
      toast.error('Failed to load user data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchRole = () => {
    setShowConfirmSheet(true);
  };

  const confirmSwitchRole = () => {
    const newMode = currentMode === 'user' ? 'owner' : 'user';
    setCurrentMode(newMode);
    localStorage.setItem('currentMode', newMode);
    setShowConfirmSheet(false);
    
    toast.success(`Switched to ${newMode === 'user' ? 'User' : 'Owner'} Mode`);
    
    // Navigate to appropriate dashboard
    if (newMode === 'owner') {
      navigate('/ownerdashboard');
    } else {
      navigate('/userdashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token-37c');
    localStorage.removeItem('currentMode');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const name = user.name || user.fullName || '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const getUserName = () => {
    if (!user) return 'User';
    return user.name || user.fullName || user.email?.split('@')[0] || 'User';
  };

  const getUserEmail = () => {
    if (!user) return '';
    return user.email || '';
  };

  const userRole = getUserRole();
  const isOwnerRole = userRole === 'owner';
  const isUserMode = currentMode === 'user';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center">
        <div className="text-teal-600 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8F5E9] pb-6">
      {/* Profile Card */}
      <div className="bg-white rounded-b-3xl shadow-lg shadow-teal-100/50 px-6 pt-8 pb-6 mb-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-200/50 mb-4">
            <span className="text-white text-3xl font-bold">
              {getUserInitials()}
            </span>
          </div>
          
          {/* Name */}
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            {getUserName()}
          </h1>
          
          {/* Email */}
          <p className="text-sm text-slate-600 mb-3">
            {getUserEmail()}
          </p>
          
          {/* Role Badge */}
          <div className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
            isUserMode 
              ? 'bg-teal-100 text-teal-700' 
              : 'bg-amber-100 text-amber-700'
          }`}>
            {isUserMode ? 'Currently in User Mode' : 'Currently in Owner Mode'}
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div className="px-5 space-y-3 mb-6">
        {/* My Account */}
        <button className="w-full bg-white rounded-2xl shadow-md shadow-teal-100/50 p-4 flex items-center gap-4 hover:shadow-lg transition-all">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <span className="flex-1 text-left font-medium text-slate-900">My Account</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Saved Properties - Only in User Mode */}
        {isUserMode && (
          <button className="w-full bg-white rounded-2xl shadow-md shadow-teal-100/50 p-4 flex items-center gap-4 hover:shadow-lg transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-teal-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <span className="flex-1 text-left font-medium text-slate-900">Saved Properties</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        {/* My Listings - Only in Owner Mode */}
        {!isUserMode && (
          <button className="w-full bg-white rounded-2xl shadow-md shadow-teal-100/50 p-4 flex items-center gap-4 hover:shadow-lg transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-teal-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <span className="flex-1 text-left font-medium text-slate-900">My Listings</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        {/* Messages */}
        <button className="w-full bg-white rounded-2xl shadow-md shadow-teal-100/50 p-4 flex items-center gap-4 hover:shadow-lg transition-all">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <span className="flex-1 text-left font-medium text-slate-900">Messages</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Help & Support */}
        <button className="w-full bg-white rounded-2xl shadow-md shadow-teal-100/50 p-4 flex items-center gap-4 hover:shadow-lg transition-all">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="flex-1 text-left font-medium text-slate-900">Help & Support</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Switch Role Button */}
      <div className="px-5 mb-6">
        <button
          onClick={handleSwitchRole}
          className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-teal-200/50 flex items-center justify-center gap-3 hover:shadow-xl transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Switch to {isUserMode ? 'Owner' : 'User'} Mode</span>
        </button>
      </div>

      {/* Logout Button */}
      <div className="px-5">
        <button
          onClick={handleLogout}
          className="w-full border-2 border-red-300 text-red-600 font-semibold py-4 rounded-2xl hover:bg-red-50 transition-all"
        >
          Logout
        </button>
      </div>

      {/* Confirmation Bottom Sheet */}
      {showConfirmSheet && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowConfirmSheet(false)}
          />
          
          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 p-6 animate-slide-up">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-6" />
            
            <h2 className="text-xl font-bold text-slate-900 mb-2 text-center">
              Switch Role?
            </h2>
            <p className="text-sm text-slate-600 mb-6 text-center">
              Are you sure you want to switch to {isUserMode ? 'Owner' : 'User'} Dashboard?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmSheet(false)}
                className="flex-1 border-2 border-slate-300 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmSwitchRole}
                className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add animation for bottom sheet */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SwitchRole;
