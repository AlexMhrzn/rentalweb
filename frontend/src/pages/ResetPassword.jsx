import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const email = searchParams.get('email');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            return toast.error("Missing email.");
        }
        if (!formData.otp || formData.otp.length !== 6) {
            return toast.error("Enter the 6-digit OTP.");
        }
        if (formData.newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters long.");
        }
        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error("Passwords do not match.");
        }
        setIsSubmitting(true);
        try {
            const response = await axios.post('http://localhost:3000/api/user/reset-password', {
                email,
                otp: formData.otp,
                newPassword: formData.newPassword
            });
            if (response.data.success) {
                toast.success('Password updated successfully!');
                navigate('/login');
            } else {
                toast.error(response.data.message || 'Failed to reset password.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-lg p-8 sm:p-10">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">Reset Password</h1>
                    <p className="text-center text-slate-500 mb-8 text-sm">
                        Enter the OTP sent to your email and your new password below. OTP is valid for 10 minutes.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <input
                            name="otp"
                            type="text"
                            placeholder="6-digit OTP"
                            className="block w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
                            value={formData.otp}
                            onChange={handleChange}
                            maxLength={6}
                        />
                        <input
                            name="newPassword"
                            type="password"
                            placeholder="New Password"
                            className="block w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
                            value={formData.newPassword}
                            onChange={handleChange}
                        />
                        <input
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm New Password"
                            className="block w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Updating Password...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
