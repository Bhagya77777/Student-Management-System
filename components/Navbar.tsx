'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export function Navbar() {
  const { user, setUser } = useAuth();
  const { t } = useI18n();

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">UB</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">UniBridge</h1>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xs mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={t('nav.search')}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <Button variant="ghost" className="text-gray-700 hover:text-primary">
                  {t('common.login')}
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  {t('common.signup')}
                </Button>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-600">
                  {t('dashboard.welcome')}, {user.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUser(null)}
                  className="text-gray-600 hover:text-primary"
                >
                  {t('common.logout')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
