'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, ArrowRight, GraduationCap, Heart, ChevronRight, Sparkles, Calendar, Bell, TrendingUp, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Footer } from '@/components/Footer';

export function LandingPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    { icon: TrendingUp, text: "Real-time GPA Tracking", color: "blue" },
    { icon: Calendar, text: "Smart Attendance System", color: "green" },
    { icon: Bell, text: "Instant Notifications", color: "purple" },
    { icon: Shield, text: "Secure Parent Approvals", color: "orange" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-linear-to-br from-slate-50 via-white to-blue-50">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-200 h-200 rounded-full bg-linear-to-r from-blue-400/20 to-purple-400/20 blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div 
          className="absolute bottom-0 right-0 w-150 h-150 rounded-full bg-linear-to-r from-emerald-400/20 to-teal-400/20 blur-3xl"
          style={{
            transform: `translate(${-mousePosition.x * 0.01}px, ${-mousePosition.y * 0.01}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
      </div>

      {/* Animated Grid Pattern */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(0,82,204,0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 sticky top-0"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-primary to-blue-600 rounded-xl blur-md opacity-60" />
              <div className="relative h-10 w-10 rounded-xl bg-linear-to-r from-primary to-blue-600 text-white flex items-center justify-center font-bold shadow-lg">
                UB
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                UniBridge
              </h1>
              <p className="text-xs text-gray-500">Education Connected</p>
            </div>
          </motion.div>
          
          <div className="flex gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => router.push('/login')}
                variant="ghost"
                className="text-gray-700 hover:text-primary hover:bg-primary/10"
              >
                Login
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => router.push('/register')}
                className="bg-linear-to-r from-primary to-blue-600 text-white hover:shadow-lg transition-all"
              >
                Get Started
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <GraduationCap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Welcome to the Future of Education</span>
            </motion.div>
            
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Connecting{" "}
              <span className="relative inline-block">
                <span className="bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Students,
                </span>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute bottom-2 left-0 h-3 bg-primary/20 -z-10 rounded-full"
                />
              </span>
              <br />
              Parents, and Lecturers{" "}
              <span className="relative inline-block">
                <span className="bg-linear-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  Seamlessly
                </span>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="absolute bottom-2 left-0 h-3 bg-emerald-200/50 -z-10 rounded-full"
                />
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A unified platform for academic management, transparent communication, 
              and student success. Join thousands of satisfied users.
            </p>

            {/* Feature Chips */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap justify-center gap-3 mt-8"
            >
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-gray-200 shadow-sm flex items-center gap-2"
                >
                  <feature.icon className={`h-4 w-4 text-${feature.color}-500`} />
                  <span className="text-sm text-gray-700">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Portal Cards */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Student Portal Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
              whileHover={{ y: -8 }}
              onHoverStart={() => setHoveredCard('student')}
              onHoverEnd={() => setHoveredCard(null)}
              className="group relative"
            >
              <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-primary rounded-3xl blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
              <div className="relative backdrop-blur-xl bg-linear-to-br from-white/95 to-white/80 border border-white/40 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-500/10 to-transparent rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-linear-to-tr from-blue-500/5 to-transparent rounded-full blur-xl" />
                
                <div className="mb-6 relative">
                  <motion.div 
                    animate={{ rotate: hoveredCard === 'student' ? 360 : 0 }}
                    transition={{ duration: 0.5 }}
                    className="h-20 w-20 rounded-2xl bg-linear-to-br from-blue-500 to-primary flex items-center justify-center mb-4 shadow-lg"
                  >
                    <BookOpen className="h-10 w-10 text-white" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">Student Portal</h3>
                  <p className="text-gray-600 text-lg">Access your academics, track GPA, view attendance</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {[
                    "Real-time marks and GPA tracking",
                    "Monitor attendance and leave balance",
                    "Submit and track leave requests",
                    "Access course materials and resources"
                  ].map((feature, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <ChevronRight className="h-3 w-3 text-blue-600" />
                      </div>
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => router.push('/student/login')}
                    className="w-full bg-linear-to-r from-primary to-blue-600 text-white hover:shadow-xl transition-all gap-2 rounded-xl py-6 text-base font-semibold group/btn"
                  >
                    Access Student Portal
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    onClick={() => router.push('/student/register')}
                    variant="outline"
                    className="w-full border-2 hover:bg-blue-50 rounded-xl py-6 text-base font-semibold"
                  >
                    Create Student Account
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Parent Portal Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
              whileHover={{ y: -8 }}
              onHoverStart={() => setHoveredCard('parent')}
              onHoverEnd={() => setHoveredCard(null)}
              className="group relative"
            >
              <div className="absolute inset-0 bg-linear-to-br from-emerald-500 to-teal-500 rounded-3xl blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
              <div className="relative backdrop-blur-xl bg-linear-to-br from-white/95 to-white/80 border border-white/40 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-emerald-500/10 to-transparent rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-linear-to-tr from-emerald-500/5 to-transparent rounded-full blur-xl" />
                
                <div className="mb-6 relative">
                  <motion.div 
                    animate={{ rotate: hoveredCard === 'parent' ? 360 : 0 }}
                    transition={{ duration: 0.5 }}
                    className="h-20 w-20 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg"
                  >
                    <Heart className="h-10 w-10 text-white" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">Parent Portal</h3>
                  <p className="text-gray-600 text-lg">Monitor your child's progress, approve leaves, stay informed</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {[
                    "Track child's academic performance",
                    "Approve or reject leave requests",
                    "View attendance and fee status",
                    "Direct communication with lecturers"
                  ].map((feature, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <ChevronRight className="h-3 w-3 text-emerald-600" />
                      </div>
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => router.push('/parent/login')}
                    className="w-full bg-linear-to-r from-emerald-500 to-teal-500 text-white hover:shadow-xl transition-all gap-2 rounded-xl py-6 text-base font-semibold group/btn"
                  >
                    Access Parent Portal
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    onClick={() => router.push('/parent/register')}
                    variant="outline"
                    className="w-full border-2 hover:bg-emerald-50 rounded-xl py-6 text-base font-semibold"
                  >
                    Create Parent Account
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-24 pt-12 border-t border-gray-200"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "5,000+", label: "Active Students", color: "blue" },
                { value: "500+", label: "Faculty Members", color: "green" },
                { value: "98%", label: "Parent Satisfaction", color: "purple" },
                { value: "24/7", label: "Support Available", color: "orange" }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <div className={`text-3xl md:text-4xl font-bold text-${stat.color}-600 mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}