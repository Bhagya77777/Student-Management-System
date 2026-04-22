'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LandingPage } from '@/components/LandingPage';
import { StudentDashboard } from '@/components/dashboards/StudentDashboard';
import ParentDashboard from '@/components/dashboards/ParentDashboard';
import LecturerDashboard from '@/components/dashboards/LecturerDashboard';
import AdminDashboard  from '@/components/dashboards/AdminDashboard';

export default function Home() {
  const { user } = useAuth();

  if (!user) {
    return <LandingPage />;
  }

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'parent':
      return <ParentDashboard />;
    case 'lecturer':
      return <LecturerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <LandingPage />;
  }
}
