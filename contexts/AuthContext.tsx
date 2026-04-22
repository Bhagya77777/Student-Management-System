'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type UserRole = 'student' | 'parent' | 'lecturer' | 'admin';

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  bio?: string;
  avatar?: string;
  joinDate: string;
}

export interface StudentUser extends BaseUser {
  role: 'student';
  studentId: string;
  batch: string;
  department?: string;
  gpa?: number;
  credits?: number;
  totalCredits?: number;
  advisor?: string;
}

export interface ParentUser extends BaseUser {
  role: 'parent';
  childStudentId: string;
  childName?: string;
  childBatch?: string;
  childDepartment?: string;
  relation?: string;
}

export interface LecturerUser extends BaseUser {
  role: 'lecturer';
  employeeId: string;
  department: string;
  position: string;
  qualification: string;
  expertise: string[];
  courses: string[];
  office: string;
  officeHours: string;
}

export interface AdminUser extends BaseUser {
  role: 'admin';
  employeeId: string;
  position: string;
  department: string;
  permissions: string[];
  managedModules: string[];
}

export type User = StudentUser | ParentUser | LecturerUser | AdminUser;

export interface StudentRegistration {
  name: string;
  email: string;
  password: string;
  studentId: string;
  batch: string;
  phone?: string;
  department?: string;
}

export interface ParentRegistration {
  name: string;
  email: string;
  password: string;
  childStudentId: string;
  phone?: string;
  relation?: string;
}

export interface LecturerRegistration {
  name: string;
  email: string;
  password: string;
  employeeId: string;
  department: string;
  position: string;
  qualification: string;
  specialization: string;
  phone?: string;
  lecturerCode: string;
}

export interface AdminRegistration {
  name: string;
  email: string;
  password: string;
  employeeId: string;
  department: string;
  position: string;
  phone?: string;
  adminCode: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  registerStudent: (data: StudentRegistration) => Promise<void>;
  registerParent: (data: ParentRegistration) => Promise<void>;
  registerLecturer: (data: LecturerRegistration) => Promise<void>;
  registerAdmin: (data: AdminRegistration) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function parseApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || 'Request failed');
  }

  return data as T;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch('/api/auth/me', { method: 'GET', credentials: 'include' });
        const data = await parseApiResponse<{ user: User }>(response);
        if (!cancelled) {
          setUserState(data.user);
          localStorage.setItem('unibridge_user', JSON.stringify(data.user));
        }
      } catch {
        localStorage.removeItem('unibridge_user');
        if (!cancelled) {
          setUserState(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string, role?: UserRole) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await parseApiResponse<{ user: User }>(response);
      setUserState(data.user);
      localStorage.setItem('unibridge_user', JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const registerStudent = async (data: StudentRegistration) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          role: 'student',
        }),
      });

      const payload = await parseApiResponse<{ user: User }>(response);
      setUserState(payload.user);
      localStorage.setItem('unibridge_user', JSON.stringify(payload.user));
    } finally {
      setIsLoading(false);
    }
  };

  const registerParent = async (data: ParentRegistration) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          role: 'parent',
        }),
      });

      const payload = await parseApiResponse<{ user: User }>(response);
      setUserState(payload.user);
      localStorage.setItem('unibridge_user', JSON.stringify(payload.user));
    } finally {
      setIsLoading(false);
    }
  };

  const registerLecturer = async (data: LecturerRegistration) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          role: 'lecturer',
        }),
      });

      const payload = await parseApiResponse<{ user: User }>(response);
      setUserState(payload.user);
      localStorage.setItem('unibridge_user', JSON.stringify(payload.user));
    } finally {
      setIsLoading(false);
    }
  };

  const registerAdmin = async (data: AdminRegistration) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          role: 'admin',
        }),
      });

      const payload = await parseApiResponse<{ user: User }>(response);
      setUserState(payload.user);
      localStorage.setItem('unibridge_user', JSON.stringify(payload.user));
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const updated = await parseApiResponse<{ user: User }>(response);

      setUserState(updated.user);
      localStorage.setItem('unibridge_user', JSON.stringify(updated.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUserState(null);
    localStorage.removeItem('unibridge_user');
  };

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem('unibridge_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('unibridge_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        registerStudent,
        registerParent,
        registerLecturer,
        registerAdmin,
        updateUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
