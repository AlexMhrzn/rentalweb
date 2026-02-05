import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { loginUserApi } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

const toErrorString = (v) => {
  if (v == null) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'object' && v !== null && typeof v.message === 'string') return v.message;
  return null;
};

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validation()) return;

    setIsSubmitting(true);
    try {
      const response = await loginUserApi(formData);

      if (response.data && response.data.success) {
        const role = response.data.user?.role;
        if (role !== 'admin') {
          toast.error('Access denied. Use the regular login for user accounts.');
          setIsSubmitting(false);
          return;
        }
        localStorage.setItem('token-37c', response.data.token);
        localStorage.setItem('user-role', 'admin');
        localStorage.removeItem('currentMode');
        toast.success('Admin login successful');
        navigate('/admindashboard');
      } else {
        const errorMsg = toErrorString(response.data?.message) ?? toErrorString(response.data?.error) ?? 'Login failed.';
        toast.error(errorMsg);
      }
    } catch (err) {
      const errData = err.response?.data;
      const errorMsg = toErrorString(errData?.message) ?? toErrorString(errData?.error) ?? err.message;
      if (err.response) {
        toast.error(errorMsg || `Login failed (${err.response.status})`);
      } else if (err.request) {
        toast.error('Cannot reach server. Is the backend running?');
      } else {
        toast.error(errorMsg || 'Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const validation = () => {
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Email is invalid');
      return false;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-8 px-4 sm:py-12 sm:px-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>

          <div className="text-center mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Admin Login</h1>
          </div>

          <p className="text-center text-sm text-slate-500 mb-8">
            Sign in to access the admin dashboard
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Admin email"
                  className="block w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500 transition-all text-sm bg-white"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Admin password"
                  className="block w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500 transition-all text-sm bg-white"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl text-base font-bold text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing in...' : 'Admin Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-slate-600">
              Not an admin?{' '}
              <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">
                User login
              </Link>
            </p>
            <p className="text-sm text-slate-500">
              Need an admin account?{' '}
              <Link to="/create-admin" className="font-semibold text-slate-600 hover:text-slate-800">
                Register admin
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
