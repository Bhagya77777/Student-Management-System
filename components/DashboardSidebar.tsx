'use client';


import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import Link from 'next/link';
import { LayoutDashboard, Calendar, Award, Clock, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarItem {
  label: string;
  icon?: React.ReactNode;
  id: string;
  href: string;
}

interface DashboardSidebarProps {
  items: SidebarItem[];
  activeItem?: string;
}



export function DashboardSidebar({ items, activeItem }: DashboardSidebarProps) {
  const { user } = useAuth();
  const { t } = useI18n();

  const getIcon = (id: string) => {
    switch (id) {
      case 'overview': return <LayoutDashboard className="h-5 w-5" />;
      case 'attendance': return <Calendar className="h-5 w-5" />;
      case 'marks': return <Award className="h-5 w-5" />;
      case 'leave': return <Clock className="h-5 w-5" />;
      case 'chat': return <MessageSquare className="h-5 w-5" />;
      default: return <LayoutDashboard className="h-5 w-5" />;
    }
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-lg z-20 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
            UB
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">UniBridge</h1>
            <p className="text-xs text-gray-500">Student Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = activeItem === item.id;
          const Icon = item.icon || getIcon(item.id);
          return (
            <Link
              href={item.href}
              key={item.id}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className={`shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`}>{Icon}</div>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Version Info */}
      <div className="p-4 text-center border-t border-gray-100">
        <p className="text-xs text-gray-400">UniBridge v1.0</p>
        <p className="text-xs text-gray-400 mt-0.5">Student Portal</p>
      </div>
    </aside>
  );
}