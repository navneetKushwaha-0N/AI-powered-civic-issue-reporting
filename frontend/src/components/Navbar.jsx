import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, LogOut, User, LayoutDashboard, ChevronDown, ShieldCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setOpen(false);
    setMobileOpen(false);
    await logout();
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);

  // Civic / government building SVG icon
  const CivicIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      {/* Dome / pillars — government building */}
      <path d="M3 21h18" />
      <path d="M5 21V10" />
      <path d="M19 21V10" />
      <path d="M9 21V10" />
      <path d="M15 21V10" />
      <path d="M2 10h20" />
      <path d="M12 3L2 10h20L12 3z" />
      <circle cx="12" cy="7" r="1" fill="white" stroke="none" />
    </svg>
  );

  return (
    <nav className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-2xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Main Row */}
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500">
              <CivicIcon />
            </div>
            <span className="text-white text-lg font-semibold hidden sm:block">
              Civic Reporter
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Admin
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative ml-1" ref={dropdownRef}>
                  <button
                    onClick={() => setOpen(v => !v)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 p-[2px]">
                      <div className="w-full h-full rounded-full bg-[#020617] flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-white/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown */}
                  <div className={`absolute right-0 mt-2 w-52 rounded-2xl bg-[#03091a] border border-white/10 shadow-2xl shadow-black/40 overflow-hidden transition-all duration-200 origin-top-right ${
                    open
                      ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                  }`}>

                    {/* User Info */}
                    {user?.name && (
                      <div className="px-4 py-3 border-b border-white/[0.06]">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-white/35 truncate mt-0.5">{user.email}</p>
                      </div>
                    )}

                    <div className="p-1.5 space-y-0.5">
                      <button
                        onClick={() => { setOpen(false); navigate('/profile'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/55 hover:text-white hover:bg-white/6 transition-all duration-150"
                      >
                        <User className="h-3.5 w-3.5" />
                        Profile
                      </button>

                      {/* ✅ Admin dropdown mein bhi dikhega */}
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => { setOpen(false); navigate('/admin'); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/55 hover:text-white hover:bg-white/6 transition-all duration-150"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Admin Panel
                        </button>
                      )}

                      <div className="h-px bg-white/[0.06] my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="ml-1 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-opacity duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen
              ? <X className="h-5 w-5" />
              : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )
            }
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="mb-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] overflow-hidden">

            {isAuthenticated ? (
              <>
                {user?.name && (
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-white/35 mt-0.5">{user.email}</p>
                  </div>
                )}

                <div className="p-2 space-y-0.5">
                  <Link
                    to="/dashboard"
                    onClick={closeMobile}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>

                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={closeMobile}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Admin
                    </Link>
                  )}

                  <button
                    onClick={() => { closeMobile(); navigate('/profile'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>

                  <div className="h-px bg-white/[0.06] mx-1 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-400/75 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="p-2 space-y-1.5">
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className="flex items-center px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobile}
                  className="flex items-center justify-center px-3 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90 transition-opacity"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;