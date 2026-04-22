'use client';

import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'si';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.attendance': 'Attendance',
    'nav.marks': 'Marks',
    'nav.leave': 'Leave Requests',
    'nav.notices': 'Notices',
    'nav.polls': 'Polls',
    'nav.chat': 'Chat Support',
    'nav.logout': 'Logout',

    // Common
    'common.welcome': 'Welcome',
    'common.student': 'Student',
    'common.parent': 'Parent',
    'common.lecturer': 'Lecturer',
    'common.admin': 'Admin',
    'common.english': 'English',
    'common.sinhala': 'සිංහල',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.approve': 'Approve',
    'common.reject': 'Reject',
    'common.pending': 'Pending',
    'common.approved': 'Approved',
    'common.rejected': 'Rejected',

    // Landing
    'landing.title': 'UniBridge',
    'landing.subtitle': 'Your University Management Platform',
    'landing.description':
      'Connect students, parents, lecturers, and administrators in one unified platform for seamless academic management.',
    'landing.selectRole': 'Select Your Role to Continue',
    'landing.student': 'Student',
    'landing.parent': 'Parent',
    'landing.lecturer': 'Lecturer',
    'landing.admin': 'Administrator',

    // Dashboard
    'dashboard.attendance': 'Attendance',
    'dashboard.attendancePercentage': 'Attendance Percentage',
    'dashboard.marks': 'Your Marks',
    'dashboard.leaveRequests': 'Leave Requests',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.pendingApprovals': 'Pending Approvals',
    'dashboard.systemStatus': 'System Status',

    // Forms
    'form.requestLeave': 'Request Leave',
    'form.startDate': 'Start Date',
    'form.endDate': 'End Date',
    'form.reason': 'Reason for Leave',
    'form.status': 'Status',
    'form.submitted': 'Submitted',

    // Messages
    'msg.logoutSuccess': 'You have been logged out',
    'msg.submitSuccess': 'Successfully submitted',
    'msg.approveSuccess': 'Successfully approved',
    'msg.rejectSuccess': 'Successfully rejected',
  },
  si: {
    // Navigation
    'nav.dashboard': ' Dashboard',
    'nav.attendance': 'පැමිණුම',
    'nav.marks': 'ලකුණු',
    'nav.leave': 'වසර ඉල්ලීම්',
    'nav.notices': 'නිවේදන',
    'nav.polls': 'සමීක්ෂණ',
    'nav.chat': 'Chat Support',
    'nav.logout': 'ඉවත්වන්න',

    // Common
    'common.welcome': 'සාදරයි',
    'common.student': 'ශිෂ්ය',
    'common.parent': 'දෙමාපිය',
    'common.lecturer': 'ඉගැන්වන්නා',
    'common.admin': 'පරිපාලක',
    'common.english': 'English',
    'common.sinhala': 'සිංහල',
    'common.submit': 'යොමු කරන්න',
    'common.cancel': 'අවලංගු කරන්න',
    'common.approve': 'අනුමත කරන්න',
    'common.reject': 'ප්‍රතික්ෂේප කරන්න',
    'common.pending': 'බලාපොරොත්තු වෙමින්',
    'common.approved': 'අනුමත කරන ලදී',
    'common.rejected': 'ප්‍රතික්ෂේප කරන ලදී',

    // Landing
    'landing.title': 'UniBridge',
    'landing.subtitle': 'ඔබේ විශ්ව විද්‍යාල කළමණාකරණ වේදිකාව',
    'landing.description':
      'ශිෂ්‍යයන්, දෙමාපියන්, ඉගැන්වන්නන් සහ පරිපාලකদු එක ඒකීකෘත වේදිකාවක් එක් කරන්න.',
    'landing.selectRole': 'ඉදිරියට යාමට ඔබේ භූමිකාව තෝරන්න',
    'landing.student': 'ශිෂ්ය',
    'landing.parent': 'දෙමාපිය',
    'landing.lecturer': 'ඉගැන්වන්නා',
    'landing.admin': 'පරිපාලක',

    // Dashboard
    'dashboard.attendance': 'පැමිණුම',
    'dashboard.attendancePercentage': 'පැමිණුම් ප්‍රතිශතය',
    'dashboard.marks': 'ඔබේ ලකුණු',
    'dashboard.leaveRequests': 'වසර ඉල්ලීම්',
    'dashboard.recentActivity': 'මෑතකාලීන ක්‍රියාකාරකම්',
    'dashboard.pendingApprovals': 'බලාපොරොත්තු අනුමතිය',
    'dashboard.systemStatus': 'System Status',

    // Forms
    'form.requestLeave': 'වසරක් ඉල්ලුම් කරන්න',
    'form.startDate': 'ආරම්භ දිනය',
    'form.endDate': 'අවසාන දිනය',
    'form.reason': 'වසර ගිය හේතුව',
    'form.status': 'තත්ත්වය',
    'form.submitted': 'යොමු කරන ලදී',

    // Messages
    'msg.logoutSuccess': 'ඔබ ඉවත් කර ඇත',
    'msg.submitSuccess': 'සফලව යොමු කරන ලදී',
    'msg.approveSuccess': 'සफලව අනුමත කරන ලදී',
    'msg.rejectSuccess': 'සફලව ප්‍රතික්ෂේප කරන ලදී',
  },
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
