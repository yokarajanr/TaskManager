import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Save, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Settings: React.FC = () => {
  const { currentUser, updateUser, logout } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    taskUpdates: true,
    dueDateReminders: true,
    weeklyReports: false
  });
  const [appearance, setAppearance] = useState({
    theme: 'dark',
    language: 'en',
    timezone: 'UTC-5'
  });

  const handleSaveProfile = () => {
    if (currentUser) {
      updateUser(currentUser.id, {
        name: formData.name,
        email: formData.email
      });
      setIsEditing(false);
    }
  };

  const handlePasswordChange = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (formData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }
    // In a real app, you'd validate current password and update
    alert('Password updated successfully!');
    setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#1E1E24] !important mb-4">Settings</h1>
        <p className="text-[#7C6F64] !important">Manage your account preferences and settings</p>
      </div>

      {/* Profile Settings */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-[#9B5DE5]/20 to-[#7C3AED]/20 rounded-xl border-2 border-[#9B5DE5]/30">
            <User className="w-6 h-6 text-[#9B5DE5]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1E1E24] !important">Profile Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1E1E24] !important mb-2">Display Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
                placeholder="Enter your name"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1E1E24] !important mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
                placeholder="Enter your email"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            {isEditing ? (
              <>
                <Button variant="secondary" onClick={() => setIsEditing(false)} className="btn-secondary">
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} className="btn-primary">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="btn-primary">
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Password Change */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-[#D7263D]/20 to-[#B91C1C]/20 rounded-xl border-2 border-[#D7263D]/30">
            <Shield className="w-6 h-6 text-[#D7263D]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1E1E24] !important">Change Password</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1E1E24] !important mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300 pr-10"
                  placeholder="Current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7C6F64] hover:text-[#1E1E24]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1E1E24] !important mb-2">New Password</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
                placeholder="New password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1E1E24] !important mb-2">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handlePasswordChange} disabled={!formData.newPassword || !formData.confirmPassword} className="btn-primary">
              Change Password
            </Button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-[#F7B801]/20 to-[#F59E0B]/20 rounded-xl border-2 border-[#F7B801]/30">
            <Bell className="w-6 h-6 text-[#F7B801]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1E1E24] !important">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-[#9B5DE5]/10 transition-all duration-200">
              <div>
                <span className="text-sm font-medium text-[#1E1E24] !important capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                <p className="text-xs text-[#7C6F64] !important">
                  {key === 'emailNotifications' && 'Receive notifications via email'}
                  {key === 'taskUpdates' && 'Get notified when tasks are updated'}
                  {key === 'dueDateReminders' && 'Receive reminders for upcoming due dates'}
                  {key === 'weeklyReports' && 'Get weekly project summary reports'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#7C6F64]/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9B5DE5]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9B5DE5]"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-[#00F5D4]/20 to-[#00D4B4]/20 rounded-xl border-2 border-[#00F5D4]/30">
            <Palette className="w-6 h-6 text-[#00F5D4]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1E1E24] !important">Appearance</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1E1E24] !important mb-2">Theme</label>
              <select
                value={appearance.theme}
                onChange={(e) => setAppearance(prev => ({ ...prev, theme: e.target.value }))}
                className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1E1E24] !important mb-2">Language</label>
              <select
                value={appearance.language}
                onChange={(e) => setAppearance(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1E1E24] !important mb-2">Timezone</label>
              <select
                value={appearance.timezone}
                onChange={(e) => setAppearance(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
              >
                <option value="UTC-8">Pacific Time (UTC-8)</option>
                <option value="UTC-7">Mountain Time (UTC-7)</option>
                <option value="UTC-6">Central Time (UTC-6)</option>
                <option value="UTC-5">Eastern Time (UTC-5)</option>
                <option value="UTC+0">UTC</option>
                <option value="UTC+1">Central European Time (UTC+1)</option>
                <option value="UTC+5:30">India Standard Time (UTC+5:30)</option>
                <option value="UTC+8">China Standard Time (UTC+8)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card rounded-2xl p-6 border-2 border-[#D7263D]/30">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-[#D7263D]/20 to-[#B91C1C]/20 rounded-xl border-2 border-[#D7263D]/30">
            <Shield className="w-6 h-6 text-[#D7263D]" />
          </div>
          <h2 className="text-xl font-semibold text-[#D7263D]">Danger Zone</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-[#D7263D]/10 transition-all duration-200">
            <div>
              <span className="text-sm font-medium text-[#D7263D]">Sign Out</span>
              <p className="text-xs text-[#D7263D]/80">Sign out of your current session</p>
            </div>
            <Button variant="danger" size="sm" onClick={handleLogout} className="bg-[#D7263D] hover:bg-[#B91C1C] text-white">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};