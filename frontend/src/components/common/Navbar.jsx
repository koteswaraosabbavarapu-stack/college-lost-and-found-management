import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Search,
  PlusCircle,
  Bell,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatRelativeTime } from '../../utils/formatters';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isSecurity, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on page route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleNotificationClick = (n) => {
    markAsRead(n._id);
    setNotificationOpen(false);
    if (n.relatedItem) {
      navigate(`/items/${n.relatedItem._id || n.relatedItem}`);
    } else if (n.relatedClaim) {
      navigate(`/claims`);
    } else {
      navigate('/notifications');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
                CampusTrack
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 -mt-1">
                Lost & Found Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/')
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/items"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/items')
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4" />
              Search Items
            </Link>
            <Link
              to="/report-lost"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/report-lost')
                  ? 'bg-rose-50 text-rose-700'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/50'
              }`}
            >
              Report Lost
            </Link>
            <Link
              to="/report-found"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/report-found')
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50'
              }`}
            >
              Report Found
            </Link>

            {/* Role-Specific Portal Links */}
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive('/dashboard')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  My Dashboard
                </Link>

                {isSecurity && (
                  <Link
                    to="/security"
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                      isActive('/security')
                        ? 'bg-amber-50 text-amber-800'
                        : 'text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Security Desk
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                      isActive('/admin')
                        ? 'bg-purple-50 text-purple-800'
                        : 'text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Action Icons & Auth Profile */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Notifications Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    type="button"
                    className="relative p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {notificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in duration-150">
                      <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-800">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 text-[11px] font-bold bg-indigo-50 text-indigo-600 rounded-full">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length > 0 ? (
                          notifications.slice(0, 5).map((n) => (
                            <div
                              key={n._id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-3.5 hover:bg-slate-50 cursor-pointer transition flex items-start gap-3 ${
                                !n.isRead ? 'bg-indigo-50/40' : ''
                              }`}
                            >
                              <div
                                className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                                  !n.isRead ? 'bg-indigo-600 ring-2 ring-indigo-200' : 'bg-transparent'
                                }`}
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                                    {n.title}
                                  </h4>
                                  <span className="text-[10px] text-slate-400">
                                    {formatRelativeTime(n.createdAt)}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                                  {n.message}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-xs text-slate-500">
                            No notifications yet
                          </div>
                        )}
                      </div>

                      <div className="pt-2 px-4 border-t border-slate-100 text-center">
                        <Link
                          to="/notifications"
                          onClick={() => setNotificationOpen(false)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          View all notifications →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    type="button"
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center uppercase shadow-xs">
                      {user.name.charAt(0)}
                    </div>
                    <div className="hidden lg:flex flex-col">
                      <span className="text-xs font-bold text-slate-800 line-clamp-1 leading-tight">
                        {user.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-800">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <span className="mt-1 inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full">
                          ID: {user.collegeId}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          My Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          Profile Settings
                        </Link>
                        {isSecurity && (
                          <Link
                            to="/security"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50"
                          >
                            <ShieldAlert className="w-4 h-4 text-amber-500" />
                            Security Claims Queue
                          </Link>
                        )}
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50"
                          >
                            <Compass className="w-4 h-4 text-purple-500" />
                            Administration Panel
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm shadow-indigo-500/20 transition hover:-translate-y-0.5"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="relative p-2 text-slate-600 hover:text-indigo-600"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <Link
            to="/"
            className={`block px-3 py-2.5 rounded-xl text-sm font-semibold ${
              isActive('/') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
            }`}
          >
            Home
          </Link>
          <Link
            to="/items"
            className={`block px-3 py-2.5 rounded-xl text-sm font-semibold ${
              isActive('/items') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
            }`}
          >
            Search Lost & Found Items
          </Link>
          <Link
            to="/report-lost"
            className={`block px-3 py-2.5 rounded-xl text-sm font-semibold ${
              isActive('/report-lost') ? 'bg-rose-50 text-rose-700' : 'text-rose-600'
            }`}
          >
            Report Lost Item
          </Link>
          <Link
            to="/report-found"
            className={`block px-3 py-2.5 rounded-xl text-sm font-semibold ${
              isActive('/report-found') ? 'bg-emerald-50 text-emerald-700' : 'text-emerald-700'
            }`}
          >
            Report Found Item
          </Link>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="px-3 py-2 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-800">{user.name}</p>
                <p className="text-[11px] text-slate-500">{user.email} • Role: {user.role}</p>
              </div>

              <Link
                to="/dashboard"
                className="block px-3 py-2 text-sm font-semibold text-slate-700"
              >
                My Dashboard & Claims
              </Link>
              <Link
                to="/profile"
                className="block px-3 py-2 text-sm font-semibold text-slate-700"
              >
                Profile & Password
              </Link>

              {isSecurity && (
                <Link
                  to="/security"
                  className="block px-3 py-2 text-sm font-bold text-amber-700 bg-amber-50 rounded-xl"
                >
                  Security Staff Portal
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 text-sm font-bold text-purple-700 bg-purple-50 rounded-xl"
                >
                  Admin Analytics & Controls
                </Link>
              )}

              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 text-sm font-bold text-rose-600"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <Link
                to="/login"
                className="flex-1 text-center py-2.5 bg-slate-100 text-slate-800 text-sm font-bold rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex-1 text-center py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
