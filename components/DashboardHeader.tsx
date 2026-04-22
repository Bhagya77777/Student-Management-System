'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  Globe, 
  Bell, 
  User,
  ChevronDown
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardHeaderProps {
  title: string;
}

type HeaderNotification = {
  id: string | number;
  title: string;
  time: string;
  read: boolean;
};

function getRoleNoticesPath(role?: string) {
  if (role === 'admin') return '/admin/notices';
  if (role === 'parent') return '/parent/notices';
  if (role === 'student') return '/student/notices';
  return '/';
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    let cancelled = false;

    const loadNotifications = async () => {
      try {
        const response = await fetch('/api/notices', { credentials: 'include' });
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        const notices = Array.isArray(data?.notices) ? data.notices : [];

        const mapped = notices.slice(0, 8).map((notice: { id?: string; title?: string; publishedDate?: string | null; status?: string }) => ({
          id: notice.id || Math.random().toString(36).slice(2),
          title: String(notice.title || 'New notice'),
          time: notice.publishedDate || 'Recently',
          read: notice.status !== 'published',
        }));

        if (!cancelled) {
          setNotifications(mapped);
        }
      } catch {
        if (!cancelled) {
          setNotifications([]);
        }
      }
    };

    void loadNotifications();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-8" style={{ height: '80px' }}>
        {/* Left Section - Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {t('common.welcome')}, {user?.name?.split(' ')[0] || 'Student'}
          </p>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'si' : 'en')}
            className="gap-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors h-9 px-3"
          >
            <Globe className="h-4 w-4" />
            {language === 'en' ? 'සිංහල' : 'English'}
          </Button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative p-2 hover:bg-gray-100 rounded-full h-9 w-9"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </Button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-gray-500 text-center">No new notifications</div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.read ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <p className="text-sm text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-700"
                      onClick={() => {
                        setShowNotifications(false);
                        router.push(getRoleNoticesPath(user?.role));
                      }}
                    >
                      View all
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                {user?.name ? getInitials(user.name) : 'S'}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.name?.split(' ')[0] || 'Student'}
              </span>
              <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
            </Button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user?.name || 'Student'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user?.email || 'student@university.edu'}</p>
                  </div>

                  {/* Profile Option */}
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push(user ? '/profile' : '/login');
                    }}
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    <span>My Profile</span>
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors border-t border-gray-100 mt-1 pt-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}