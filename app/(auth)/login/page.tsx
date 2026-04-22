"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowRight, 
  Eye, 
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  Fingerprint,
  Shield,
  GraduationCap,
  Heart,
  BookOpen,
  ChevronLeft,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

const roles = [
  { 
    id: "student", 
    label: "Student", 
    icon: GraduationCap, 
    color: "blue", 
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-600",
    description: "Access your academics, track GPA, view attendance",
    gradient: "from-blue-600 to-indigo-600"
  },
  { 
    id: "parent", 
    label: "Parent", 
    icon: Heart, 
    color: "emerald", 
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-600",
    description: "Monitor your child's progress, approve leaves",
    gradient: "from-emerald-600 to-teal-600"
  },
  { 
    id: "lecturer", 
    label: "Lecturer", 
    icon: BookOpen, 
    color: "purple", 
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-600",
    description: "Manage courses, record marks, track attendance",
    gradient: "from-purple-600 to-pink-600"
  },
  { 
    id: "admin", 
    label: "Admin", 
    icon: Shield, 
    color: "red", 
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-600",
    description: "System administration and user management",
    gradient: "from-red-600 to-orange-600"
  },
];

const demoCredentials: Record<string, { email: string; password: string }> = {
  student: { email: "kavita@university.edu", password: "password123" },
  parent: { email: "amara@email.com", password: "password123" },
  lecturer: { email: "prof.smith@university.edu", password: "Lecturer@123" },
  admin: { email: "admin@unibridge.com", password: "Admin@123" },
};

export default function CommonLoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });

  useEffect(() => {
    // Auto-fill demo credentials for the selected role
    const demo = demoCredentials[selectedRole as keyof typeof demoCredentials];
    if (demo) {
      setEmail(demo.email);
      setPassword(demo.password);
    }
  }, [selectedRole]);

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    try {
      await login(email, password, selectedRole as any);
      // Redirect based on role
      switch (selectedRole) {
        case "student":
          router.push("/student/dashboard");
          break;
        case "parent":
          router.push("/parent/dashboard");
          break;
        case "lecturer":
          router.push("/lecturer/dashboard");
          break;
        case "admin":
          router.push("/admin/dashboard");
          break;
        default:
          router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    }
  };

  const selectedRoleData = roles.find(r => r.id === selectedRole);
  const RoleIcon = selectedRoleData?.icon || GraduationCap;
  const gradientClass = selectedRoleData?.gradient || "from-blue-600 to-indigo-600";

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-50 via-white to-blue-50/30">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(0,82,204,0.05)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg blur-sm opacity-60" />
              <div className="relative h-9 w-9 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                UB
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                UniBridge
              </h1>
              <p className="text-xs text-gray-500">Education Connected</p>
            </div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              className="gap-2 text-gray-600 hover:text-blue-600"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </motion.div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        <div className="w-full max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Side - Role Selection */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-500">
                  Select your role to access your dashboard
                </p>
              </div>

              <div className="space-y-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <motion.button
                      key={role.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRoleChange(role.id)}
                      className={`w-full p-4 rounded-xl border transition-all text-left ${
                        isSelected
                          ? `${role.bgColor} border-${role.color}-300 shadow-md`
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                          isSelected ? role.bgColor : 'bg-gray-100'
                        }`}>
                          <Icon className={`h-6 w-6 ${isSelected ? role.textColor : 'text-gray-500'}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                            {role.label}
                          </h3>
                          <p className={`text-sm ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}>
                            {role.description}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className={`h-5 w-5 ${role.textColor}`} />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Demo Info */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <p className="text-xs font-medium text-blue-800">Demo Credentials Auto-filled</p>
                </div>
                <p className="text-xs text-blue-600">
                  Select a role above to use demo credentials. Feel free to explore all features!
                </p>
              </div>
            </motion.div>

            {/* Right Side - Login Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                {/* Role Badge */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`h-12 w-12 rounded-xl bg-linear-to-r ${gradientClass} flex items-center justify-center shadow-md`}>
                    <RoleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedRoleData?.label} Login
                    </h3>
                    <p className="text-sm text-gray-500">
                      Sign in to your {selectedRoleData?.label.toLowerCase()} portal
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className={`relative transition-all duration-200 ${isFocused.email ? 'scale-[1.02]' : ''}`}>
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setIsFocused({ ...isFocused, email: true })}
                        onBlur={() => setIsFocused({ ...isFocused, email: false })}
                        placeholder="Enter your email"
                        className="pl-10 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className={`relative transition-all duration-200 ${isFocused.password ? 'scale-[1.02]' : ''}`}>
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setIsFocused({ ...isFocused, password: true })}
                        onBlur={() => setIsFocused({ ...isFocused, password: false })}
                        placeholder="Enter your password"
                        className="pl-10 pr-10 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => router.push('/forgot-password')}
                      className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 flex items-center gap-2"
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
                      className={`w-full bg-linear-to-r ${gradientClass} hover:opacity-90 text-white rounded-xl py-3 font-semibold gap-2 shadow-md hover:shadow-lg transition-all`}
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          Sign in to {selectedRoleData?.label} Portal
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>

                {/* Register Link */}
                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link
                      href={`/${selectedRole}/register`}
                      className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    >
                      Create {selectedRoleData?.label} Account
                    </Link>
                  </p>
                </div>

                {/* Security Note */}
                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Fingerprint className="h-3 w-3" />
                    <span>Secure login with 256-bit encryption</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-gray-400">
              By signing in, you agree to our{" "}
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">Privacy Policy</a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}