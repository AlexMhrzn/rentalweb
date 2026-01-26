import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const ForgetPassword = () => {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
  });
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validation()) return;

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      // const response = await forgotPasswordApi(formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Reset link/OTP sent successfully!');
      setCountdown(30); // Start 30 second countdown
    } catch (err) {
      console.error('Forgot password error:', err);
      toast.error(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validation = () => {
    if (!formData.emailOrPhone.trim()) {
      toast.error('Email or mobile number is required');
      return false;
    }
    // Basic validation - check if it's email or phone
    const isEmail = /\S+@\S+\.\S+/.test(formData.emailOrPhone);
    const isPhone = /^[0-9]{10,15}$/.test(formData.emailOrPhone.replace(/\s+/g, ''));
    
    if (!isEmail && !isPhone) {
      toast.error('Please enter a valid email or mobile number');
      return false;
    }
    return true;
  };

  const handleResend = () => {
    if (countdown > 0) return;
    handleSubmit({ preventDefault: () => {} });
  };

  return (
    <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center py-8 px-4 sm:py-12 sm:px-6">
      {/* Main Card Container */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-lg shadow-teal-100/50 p-8 sm:p-10">
          {/* Circular Icon with Lock/Key Symbol */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-md shadow-teal-200/50">
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
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Forgot Password?
            </h1>
          </div>

          {/* Subtext */}
          <p className="text-center text-sm sm:text-base text-slate-500 mb-8">
            Enter your registered email or phone number to reset your password
          </p>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email/Phone Field */}
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  id="emailOrPhone"
                  name="emailOrPhone"
                  type="text"
                  placeholder="Email or Mobile Number"
                  className="block w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all text-sm bg-white"
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Send Reset Link Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl text-base font-bold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-teal-200/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>

            {/* Helper Text */}
            <p className="text-center text-xs sm:text-sm text-slate-500 mt-2">
              You will receive a reset link or OTP to verify your account
            </p>

            {/* Resend Countdown */}
            {countdown > 0 && (
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Didn't receive code?{' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0}
                    className="font-medium text-teal-600 hover:text-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Resend in {countdown}s
                  </button>
                </p>
              </div>
            )}

            {/* Back to Login Link */}
            <div className="mt-8 text-center pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-600">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                >
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
