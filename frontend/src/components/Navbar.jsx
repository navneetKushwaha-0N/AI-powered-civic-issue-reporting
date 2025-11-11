import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, LogOut, User, LayoutDashboard, ChevronDown, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Auto-close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/login');
  };

  const handleNavigateToProfile = () => {
    setOpen(false);
    navigate('/profile');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300">
                <Menu className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Civic Reporter
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">Admin Panel</span>
                  </Link>
                )}

                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setOpen(v => !v)} 
                    className="flex items-center space-x-2 border-l border-gray-200 dark:border-gray-700 pl-4 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 group"
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 p-0.5 group-hover:scale-110 transition-transform duration-300">
                        <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                          {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                      {user?.role === 'admin' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                          <Settings className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">
                      {user?.name}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu with smooth animation */}
                  <div className={`absolute right-0 mt-3 w-72 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50 transition-all duration-300 ease-in-out origin-top-right ${
                    open 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}>
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative group">
                          <div className="w-14 h-14 rounded-full bg-white p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-300">
                            <div className="w-full h-full rounded-full overflow-hidden">
                              {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-100">
                                  <User className="h-7 w-7 text-blue-600" />
                                </div>
                              )}
                            </div>
                          </div>
                          {user?.role === 'admin' && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                              <Settings className="h-3.5 w-3.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-white truncate">{user?.name}</div>
                          <div className="text-xs text-blue-100 truncate">{user?.email}</div>
                          {user?.role === 'admin' && (
                            <div className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                              <Settings className="h-3 w-3 mr-1" />
                              Administrator
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-3 space-y-1">
                      <button
                        onClick={handleNavigateToProfile}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 group"
                      >
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors duration-200">
                          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-semibold">View Profile</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">See your profile details</div>
                        </div>
                      </button>

                      <button
                        onClick={handleNavigateToProfile}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 group"
                      >
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors duration-200">
                          <Settings className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-semibold">Edit Profile</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Update your information</div>
                        </div>
                      </button>

                      <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                      >
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors duration-200">
                          <LogOut className="h-4 w-4" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-semibold">Logout</div>
                          <div className="text-xs text-red-500 dark:text-red-400/70">Sign out of your account</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
