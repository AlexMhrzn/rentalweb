import React, { useEffect, useState, useRef } from 'react';
import { getProfile, updateProfile, changePassword } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Account = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', phone: '' });
  const [newImage, setNewImage] = useState(null);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProfile();
        if (res.data.success) {
          setProfile(res.data.user);
          setForm({
            username: res.data.user.username || '',
            email: res.data.user.email || '',
            phone: res.data.user.phone || '',
          });
        } else {
          toast.error(res.data.message || 'Unable to fetch profile');
        }
      } catch (err) {
        console.error('loadProfile error', err);
        toast.error(err.response?.data?.message || 'Unable to fetch profile');
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      const data = new FormData();
      data.append('username', form.username);
      data.append('email', form.email);
      data.append('phone', form.phone);
      if (newImage) data.append('image', newImage);
      const res = await updateProfile(data);
      if (res.data.success) {
        toast.success('Profile updated');
        navigate('/profile');
      } else {
        toast.error(res.data.message || 'Failed to update profile');
      }
    } catch (e) {
      console.error('update profile error', e);
      toast.error(e.response?.data?.message || 'Failed to update');
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
        navigate('/profile');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to change password');
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">My Account</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm">Name</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm">Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewImage(e.target.files?.[0] || null)}
            />
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white rounded">
            Save
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold">Change Password</h3>
          <div className="space-y-3 mt-2">
            <div>
              <input
                type="password"
                placeholder="Current password"
                className="w-full border rounded p-2"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="New password"
                className="w-full border rounded p-2"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Confirm new"
                className="w-full border rounded p-2"
                value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              />
            </div>
            <button
              onClick={handleChangePassword}
              className="px-4 py-2 bg-teal-600 text-white rounded"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
