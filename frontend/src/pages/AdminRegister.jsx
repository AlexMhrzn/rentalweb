import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { createAdminUserApi } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminSecret: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    if (!validation()) return;

    try {
      setIsSubmitting(true);
      const fd = new FormData();
      fd.append('username', formData.username.trim());
      fd.append('email', formData.email.trim());
      fd.append('password', formData.password);
      fd.append('adminSecret', formData.adminSecret.trim());

      const response = await createAdminUserApi(fd);

      if (response.data?.success) {
        // Clear any existing session so user lands on fresh login page
        localStorage.removeItem('token-37c');
        localStorage.removeItem('user-role');
        localStorage.removeItem('currentMode');
        toast.success('Admin account created. You can now log in.');
        navigate('/admin-login', { replace: true });
      } else {
        toast.error(response.data?.message || 'Registration failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validation = () => {
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return false;
    }
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
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (!formData.adminSecret.trim()) {
      toast.error('Admin secret is required');
      return false;
    }
    return true;
  };

  const EyeIcon = ({ show, toggle }) => (
    <button
      type="button"
      onClick={toggle}
      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {show ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242" />
        ) : (
          <>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </>
        )}
      </svg>
    </button>
  );

  const inputBase = 'block w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500 transition-all text-sm bg-white';
  const inputWithEye = 'block w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500 transition-all text-sm bg-white';
  const iconWrap = 'absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none';

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
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Create Admin Account</h1>
          </div>
          <p className="text-center text-sm text-slate-500 mb-8">Register a new admin. You need the admin secret key.</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <div className={iconWrap}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input id="username" name="username" type="text" placeholder="Admin username" className={inputBase} value={formData.username} onChange={handleChange} />
            </div>

            <div className="relative">
              <div className={iconWrap}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input id="email" name="email" type="email" placeholder="Admin email" className={inputBase} value={formData.email} onChange={handleChange} />
            </div>

            <div className="relative">
              <div className={iconWrap}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" className={inputWithEye} value={formData.password} onChange={handleChange} />
              <EyeIcon show={showPassword} toggle={() => setShowPassword(!showPassword)} />
            </div>

            <div className="relative">
              <div className={iconWrap}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm password" className={inputWithEye} value={formData.confirmPassword} onChange={handleChange} />
              <EyeIcon show={showConfirmPassword} toggle={() => setShowConfirmPassword(!showConfirmPassword)} />
            </div>

            <div className="relative">
              <div className={iconWrap}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <input id="adminSecret" name="adminSecret" type="password" placeholder="Admin secret key" className={inputBase} value={formData.adminSecret} onChange={handleChange} autoComplete="off" />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl text-base font-bold text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Admin Account'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              Already have an admin account?{' '}
              <Link to="/admin-login" className="font-semibold text-slate-600 hover:text-slate-800">
                Admin login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
