import { useEffect, useState } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Camera, Save, Loader, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const [user, setUser] = useState(null);
  const { updateUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await authAPI.getMe();
        const u = res.data.data.user;
        setUser(u);
        setName(u.name || '');
        setEmail(u.email || '');
        setPhone(u.phone || '');
        setAvatarPreview(u.avatarUrl || null);
      } catch (error) {
        toast.error('Failed to load profile');
      }
    })();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setIsSuccess(false);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('email', email);
      if (avatar) fd.append('avatar', avatar);
      await authAPI.updateProfile(fd);
      const me = await authAPI.getMe();
      setUser(me.data.data.user);
      updateUser(me.data.data.user);
      setIsSuccess(true);
      toast.success('Profile updated successfully!');
      setAvatar(null);
    } catch (e) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
      setTimeout(() => setIsSuccess(false), 3000);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="h-12 w-12 text-blue-600 animate-spin" />
          <p className="text-gray-700 dark:text-gray-200 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            {user?.role === 'admin' ? 'Admin Profile' : 'My Profile'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
          {/* Gradient Header */}
          <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-800 p-2 shadow-xl">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </div>
                {/* Upload Button Overlay */}
                <label className="absolute bottom-2 right-2 cursor-pointer group">
                  <div className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full shadow-lg transition-all duration-200 transform group-hover:scale-110">
                    <Camera className="h-5 w-5" />
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={onSubmit} className="px-8 pb-8 pt-20">
            {/* User Info Display */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
              {user?.role === 'admin' && (
                <div className="inline-flex items-center mt-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Administrator
                </div>
              )}
            </div>

            {/* Success Message */}
            {isSuccess && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center space-x-3 animate-slide-down">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-300 font-medium">Profile updated successfully!</span>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Name Field */}
              <div className="group">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span>Full Name</span>
                </label>
                <div className="relative">
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all duration-200 outline-none"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="group">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>Email Address</span>
                </label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all duration-200 outline-none"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Phone Field (Disabled) */}
              <div className="group">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>Phone Number</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">(Not editable)</span>
                </label>
                <div className="relative">
                  <input 
                    value={phone} 
                    disabled 
                    className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <XCircle className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button 
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl"
              >
                {saving ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  setName(user?.name || '');
                  setEmail(user?.email || '');
                  setAvatar(null);
                  setAvatarPreview(user?.avatarUrl || null);
                  toast.success('Changes discarded');
                }}
                className="flex-1 sm:flex-initial px-6 py-3.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                Reset
              </button>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">Profile Information</h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Your phone number is verified and cannot be changed. If you need to update it, please contact support.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Stats Cards (Optional - if user has reported issues) */}
        {user?.role !== 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-600 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Account Status</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">Active</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-indigo-600 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Member Since</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{new Date(user?.createdAt).getFullYear()}</p>
                </div>
                <User className="h-10 w-10 text-indigo-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-600 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Profile Score</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">100%</p>
                </div>
                <CheckCircle className="h-10 w-10 text-purple-500" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
