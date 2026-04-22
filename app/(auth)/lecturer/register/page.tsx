"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  ArrowLeft, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Mail,
  Lock,
  User,
  Building,
  Phone,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Key
} from "lucide-react";
import Link from "next/link";

export default function LecturerRegisterPage() {
  const router = useRouter();
  const { registerLecturer, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    phone: false,
    department: false,
    qualification: false,
    password: false,
    confirmPassword: false
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    qualification: "",
    employeeId: "",
    specialization: "",
    password: "",
    confirmPassword: "",
    lecturerCode: "",
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!formData.lecturerCode) {
      setError("Please enter the lecturer registration code");
      return;
    }

    if (formData.lecturerCode !== "LECT2024") {
      setError("Invalid lecturer registration code");
      return;
    }

    try {
      await registerLecturer({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        department: formData.department,
        qualification: formData.qualification,
        employeeId: formData.employeeId,
        specialization: formData.specialization,
        lecturerCode: formData.lecturerCode,
        position: "Lecturer", // Add default or form value as required
      });
      setSuccess("Registration successful. Redirecting...");
      setTimeout(() => {
        router.push("/lecturer/dashboard");
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const departments = [
    "Computer Science",
    "Engineering",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Business Administration",
    "Economics",
    "Psychology",
    "English Literature"
  ];

  const qualifications = [
    "Ph.D.",
    "Master's Degree",
    "Bachelor's Degree",
    "Post Graduate Diploma"
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-150 h-150 rounded-full bg-linear-to-r from-purple-500/20 to-indigo-500/20 blur-3xl"
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 100 }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <motion.nav 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="backdrop-blur-xl bg-white/10 border-b border-white/10 sticky top-0"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-purple-500 to-indigo-500 rounded-lg blur-sm opacity-60" />
                <div className="relative h-9 w-9 rounded-lg bg-linear-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-center text-sm font-bold">
                  UB
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">UniBridge</h1>
                <p className="text-xs text-purple-200">Lecturer Registration</p>
              </div>
            </div>
            <Button onClick={() => router.push('/')} variant="ghost" className="gap-2 text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </motion.nav>

        {/* Form Section */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-linear-to-r from-purple-500 to-indigo-500 rounded-2xl blur-xl opacity-50" />
                  <div className="relative h-20 w-20 rounded-2xl bg-linear-to-r from-purple-500 to-indigo-500 flex items-center justify-center mx-auto shadow-lg">
                    <GraduationCap className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-white mt-4 mb-2">Lecturer Registration</h1>
                <p className="text-purple-200 text-sm">Join our academic community</p>
              </div>

              {success && (
                <div className="mb-4 p-3 rounded-xl bg-green-500/20 border border-green-500/30 text-sm text-green-200 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Full Name <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" />
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Dr. John Smith"
                        className="pl-10 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Email <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" />
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="professor@university.edu"
                        className="pl-10 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" />
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+94 77 123 4567"
                        className="pl-10 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Employee ID */}
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Employee ID</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" />
                      <Input
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        placeholder="EMP2024001"
                        className="pl-10 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Department</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" />
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full pl-10 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-300 py-2"
                      >
                        <option value="" className="bg-gray-800">Select department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept} className="bg-gray-800">{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Qualification */}
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Highest Qualification</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" />
                      <select
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        className="w-full pl-10 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-300 py-2"
                      >
                        <option value="" className="bg-gray-800">Select qualification</option>
                        {qualifications.map(qual => (
                          <option key={qual} value={qual} className="bg-gray-800">{qual}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Specialization */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-purple-200 mb-2">Specialization/Expertise</label>
                    <Input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder="e.g., Data Structures, Algorithms, Database Systems"
                      className="rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Lecturer Code */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-purple-200 mb-2">Lecturer Registration Code <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" />
                      <Input
                        type="password"
                        name="lecturerCode"
                        value={formData.lecturerCode}
                        onChange={handleChange}
                        placeholder="Enter registration code"
                        className="pl-10 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                        disabled={isLoading}
                      />
                    </div>
                    <p className="text-xs text-purple-300 mt-1">Contact the administration to get the registration code</p>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Password <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="pl-10 pr-10 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-purple-300 mt-1">Minimum 8 characters</p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Confirm Password <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="pl-10 pr-10 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-sm text-red-200 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <Button type="submit" disabled={isLoading} className="w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl py-3 font-semibold gap-2">
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Register as Lecturer
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-purple-200">
                  Already have an account?{' '}
                  <Link href="/lecturer/login" className="text-white hover:underline font-semibold">
                    Sign in here
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