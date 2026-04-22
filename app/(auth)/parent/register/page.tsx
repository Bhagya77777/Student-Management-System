'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowRight, 
  ArrowLeft, 
  UserPlus, 
  Mail, 
  Lock, 
  Users, 
  Shield,
  CheckCircle,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ParentRegister() {
  const router = useRouter();
  const { registerParent, isLoading } = useAuth();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    childStudentId: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.name || !formData.email || !formData.password || !formData.childStudentId) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await registerParent({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        childStudentId: formData.childStudentId,
      });
      router.push('/parent/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <motion.nav 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between max-w-6xl mx-auto mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold shadow-md">
              UB
            </div>
            <span className="text-xl font-semibold text-gray-900">UniBridge</span>
          </div>
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            className="gap-2 text-gray-600 hover:text-emerald-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </motion.nav>

        {/* Main Content - Left Right Layout */}
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl w-full">
            {/* Left Side - Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden lg:flex flex-col justify-center"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Join UniBridge as a Parent
                </h2>
                <p className="text-gray-600 text-lg">
                  Stay connected with your child's academic journey. Monitor progress, approve leaves, and receive real-time updates.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Monitor Academic Progress</h3>
                    <p className="text-sm text-gray-600">Track grades, attendance, and overall performance in real-time</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Leave Request Approval</h3>
                    <p className="text-sm text-gray-600">Review and approve your child's leave requests instantly</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Direct Communication</h3>
                    <p className="text-sm text-gray-600">Connect with lecturers and stay informed about important updates</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-sm text-emerald-800">
                  <span className="font-semibold">Need your child's Student ID?</span><br />
                  Contact your child's university administration to get the Student ID for linking.
                </p>
              </div>
            </motion.div>

            {/* Right Side - Registration Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-100 text-emerald-600 mb-4">
                    <UserPlus className="h-8 w-8" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">Parent Registration</h1>
                  <p className="text-gray-500 mt-2">Create your account to monitor your child's progress</p>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Jane Doe"
                        className="pl-10 h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="jane@email.com"
                        className="pl-10 h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Child's Student ID
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        name="childStudentId"
                        value={formData.childStudentId}
                        onChange={handleChange}
                        placeholder="STU123456"
                        className="pl-10 h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your child's student ID to link your account
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        className="pl-10 h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        className="pl-10 h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold gap-2"
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>

                {/* Login Link */}
                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      onClick={() => router.push('/parent/login')}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}