import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Edit3, Settings, Shield, Bell } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center px-4">
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl w-full max-w-md p-8 border border-white/20">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <p className="text-rose-600 text-lg">Please log in to view your profile</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/20 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-rose-500 via-pink-500 to-red-400 relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-white">
                <User className="w-12 h-12 text-rose-600" />
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-16 px-8 pb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-rose-800 mb-2">
                  {user.username}
                </h1>
                <p className="text-rose-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
              <button className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium">
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-rose-800 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-rose-500" />
                Profile Information
              </h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-rose-50/60 rounded-xl border border-rose-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-rose-500">Username</p>
                      <p className="text-rose-800 font-semibold">{user.username}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-rose-50/60 rounded-xl border border-rose-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-rose-500">Email Address</p>
                      <p className="text-rose-800 font-semibold">{user.email}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-rose-800 mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <button
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                  onClick={() => alert('Edit profile feature coming soon!')}
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="font-medium">Edit Profile</span>
                </button>

                <button
                  className="w-full flex items-center gap-3 p-3 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl transition-all duration-200"
                  onClick={() => alert('Settings feature coming soon!')}
                >
                  <Settings className="w-4 h-4" />
                  <span className="font-medium">Settings</span>
                </button>

                <button
                  className="w-full flex items-center gap-3 p-3 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl transition-all duration-200"
                  onClick={() => alert('Security feature coming soon!')}
                >
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Security</span>
                </button>
              </div>
            </div>

            {/* Activity Status */}
            <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-rose-800 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-pink-500" />
                Activity
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-rose-700">Account Active</p>
                    <p className="text-xs text-rose-500">Online now</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-rose-700">Profile Updated</p>
                    <p className="text-xs text-rose-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
