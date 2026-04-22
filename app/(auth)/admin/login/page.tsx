"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "motion/react";
import { easeOut } from "motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  ArrowLeft, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Fingerprint,
  Key
} from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    try {
      await login(email, password, 'admin');
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    }
  };

  // Demo credentials for admin
  const fillDemoCredentials = () => {
    setEmail("admin@unibridge.com");
    setPassword("Admin@123");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: easeOut }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { delay: 0.2, duration: 0.5 }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-150 h-150 rounded-full bg-linear-to-r from-purple-500/20 to-indigo-500/20 blur-3xl"
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 100 }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-125 h-125 rounded-full bg-linear-to-r from-blue-500/15 to-cyan-500/15 blur-3xl"
          animate={{
            x: -mousePosition.x * 0.01,
            y: -mousePosition.y * 0.01,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 100 }}
        />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cdefs%3E%3Cpattern id=\"grid\" width=\"60\" height=\"60\" patternUnits=\"userSpaceOnUse\"%3E%3Cpath d=\"M 60 0 L 0 0 0 60\" fill=\"none\" stroke=\"rgba(255,255,255,0.03)\" stroke-width=\"1\"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\"100%25\" height=\"100%25\" fill=\"url(%23grid)\"/%3E%3C/svg%3E')"
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <motion.nav 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="backdrop-blur-xl bg-white/10 border-b border-white/10 sticky top-0"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-purple-500 to-indigo-500 rounded-lg blur-sm opacity-60" />
                <div className="relative h-9 w-9 rounded-lg bg-linear-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-center text-sm font-bold">
                  UB
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">UniBridge</h1>
                <p className="text-xs text-purple-200">Admin Portal</p>
              </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => router.push('/')}
                variant="ghost"
                className="gap-2 text-white hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </motion.div>
          </div>
        </motion.nav>

        {/* Form Section */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
          >
            {/* Main Card */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
              {/* Icon and Title */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="mb-8 text-center"
              >
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-linear-to-r from-purple-500 to-indigo-500 rounded-2xl blur-xl opacity-50" />
                  <div className="relative h-20 w-20 rounded-2xl bg-linear-to-r from-purple-500 to-indigo-500 flex items-center justify-center mx-auto shadow-lg">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-white mt-4 mb-2">Admin Login</h1>
                <p className="text-purple-200 text-sm">Access the administrative dashboard</p>
              </motion.div>

              <motion.form 
                variants={formVariants}
                initial="hidden"
                animate="visible"
                onSubmit={handleSubmit} 
                className="space-y-5"
              >
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Email Address
                  </label>
                  <div className={`relative transition-all duration-200 ${
                    isFocused.email ? 'scale-[1.02]' : ''
                  }`}>
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsFocused({ ...isFocused, email: true })}
                      onBlur={() => setIsFocused({ ...isFocused, email: false })}
                      placeholder="admin@unibridge.com"
                      className="pl-10 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Password
                  </label>
                  <div className={`relative transition-all duration-200 ${
                    isFocused.password ? 'scale-[1.02]' : ''
                  }`}>
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsFocused({ ...isFocused, password: true })}
                      onBlur={() => setIsFocused({ ...isFocused, password: false })}
                      placeholder="••••••••"
                      className="pl-10 pr-10 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-white/30 bg-white/10 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-purple-200">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => router.push('/admin/forgot-password')}
                    className="text-sm text-purple-300 hover:text-white transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-sm text-red-200 flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl py-3 font-semibold gap-2 shadow-lg hover:shadow-xl transition-all"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        Access Admin Dashboard
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.form>

              {/* Security Note */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 pt-6 border-t border-white/10 text-center"
              >
                <div className="flex items-center justify-center gap-2 text-xs text-purple-300">
                  <Fingerprint className="h-3 w-3" />
                  <span>Secure admin access with 2FA enabled</span>
                </div>
              </motion.div>

              {/* Demo Credentials */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Key className="h-4 w-4 text-purple-400" />
                  <p className="text-xs font-semibold text-purple-200">Demo Admin Credentials</p>
                </div>
                <div className="space-y-1 text-xs text-purple-300">
                  <p>📧 Email: admin@unibridge.com</p>
                  <p>🔑 Password: Admin@123</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fillDemoCredentials}
                  className="mt-2 text-purple-300 hover:text-white hover:bg-white/10 w-full"
                >
                  Use Demo Credentials
                </Button>
              </motion.div>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-purple-200">
                  Don't have admin access?{' '}
                  <Link
                    href="/admin/register"
                    className="text-white hover:underline font-semibold"
                  >
                    Request Access
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}