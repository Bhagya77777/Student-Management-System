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
  CheckCircle2,
  User,
  Phone,
  GraduationCap,
  Heart,
  BookOpen,
  Shield,
  ChevronLeft,
  Sparkles,
  Building,
  Briefcase,
  Key,
  Calendar,
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
    gradient: "from-blue-600 to-indigo-600",
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
    gradient: "from-emerald-600 to-teal-600",
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
    gradient: "from-purple-600 to-pink-600",
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
    gradient: "from-red-600 to-orange-600",
  },
];

export default function CommonRegisterPage() {
  const router = useRouter();
  const {
    registerStudent,
    registerParent,
    registerLecturer,
    registerAdmin,
    isLoading,
  } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFocused, setIsFocused] = useState<Record<string, boolean>>({});

  // Form data for each role
  const [studentData, setStudentData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
    batch: "",
    phone: "",
    department: "",
  });

  const [parentData, setParentData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    childStudentId: "",
    phone: "",
    relation: "",
  });

  const [lecturerData, setLecturerData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    employeeId: "",
    department: "",
    position: "",
    qualification: "",
    specialization: "",
    phone: "",
    lecturerCode: "",
  });

  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    employeeId: "",
    department: "",
    position: "",
    phone: "",
    adminCode: "",
  });

  useEffect(() => {
    setError("");
    setSuccess("");
  }, [selectedRole]);

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (studentData.password !== studentData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (studentData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      await registerStudent({
        name: studentData.name,
        email: studentData.email,
        password: studentData.password,
        studentId: studentData.studentId,
        batch: studentData.batch,
        phone: studentData.phone,
        department: studentData.department,
      });
      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => router.push("/student/dashboard"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (parentData.password !== parentData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await registerParent({
        name: parentData.name,
        email: parentData.email,
        password: parentData.password,
        childStudentId: parentData.childStudentId,
        phone: parentData.phone,
        relation: parentData.relation,
      });
      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => router.push("/parent/dashboard"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const handleLecturerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (lecturerData.password !== lecturerData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (lecturerData.lecturerCode !== "LECT2024") {
      setError("Invalid lecturer registration code");
      return;
    }

    try {
      await registerLecturer({
        name: lecturerData.name,
        email: lecturerData.email,
        password: lecturerData.password,
        employeeId: lecturerData.employeeId,
        department: lecturerData.department,
        position: lecturerData.position,
        qualification: lecturerData.qualification,
        specialization: lecturerData.specialization,
        phone: lecturerData.phone,
        lecturerCode: lecturerData.lecturerCode,
      });
      setSuccess("Registration request submitted! Please wait for approval.");
      setTimeout(() => router.push("/lecturer/dashboard"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (adminData.password !== adminData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (adminData.adminCode !== "ADMIN2024") {
      setError("Invalid admin registration code");
      return;
    }

    try {
      await registerAdmin({
        name: adminData.name,
        email: adminData.email,
        password: adminData.password,
        employeeId: adminData.employeeId,
        department: adminData.department,
        position: adminData.position,
        phone: adminData.phone,
        adminCode: adminData.adminCode,
      });
      setSuccess("Registration request submitted! Please wait for approval.");
      setTimeout(() => router.push("/admin/dashboard"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const selectedRoleData = roles.find((r) => r.id === selectedRole);
  const RoleIcon = selectedRoleData?.icon || GraduationCap;
  const gradientClass =
    selectedRoleData?.gradient || "from-blue-600 to-indigo-600";

  const handleFocus = (field: string) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field: string) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-50 via-white to-blue-50/30">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(0,82,204,0.05)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
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
            onClick={() => router.push("/")}
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
              onClick={() => router.push("/")}
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
                  Create Your Account
                </h2>
                <p className="text-gray-500">
                  Select your role to get started with UniBridge
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
                          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                            isSelected ? role.bgColor : "bg-gray-100"
                          }`}
                        >
                          <Icon
                            className={`h-6 w-6 ${isSelected ? role.textColor : "text-gray-500"}`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${isSelected ? "text-gray-900" : "text-gray-700"}`}
                          >
                            {role.label}
                          </h3>
                          <p
                            className={`text-sm ${isSelected ? "text-gray-600" : "text-gray-500"}`}
                          >
                            {role.description}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2
                            className={`h-5 w-5 ${role.textColor}`}
                          />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <p className="text-xs font-medium text-blue-800">
                    Why Join UniBridge?
                  </p>
                </div>
                <p className="text-xs text-blue-600">
                  Access academic records, track progress, communicate with
                  lecturers, and manage leave requests all in one place.
                </p>
              </div>
            </motion.div>

            {/* Right Side - Registration Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                {/* Role Badge */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`h-12 w-12 rounded-xl bg-linear-to-r ${gradientClass} flex items-center justify-center shadow-md`}
                  >
                    <RoleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedRoleData?.label} Registration
                    </h3>
                    <p className="text-sm text-gray-500">
                      Create your {selectedRoleData?.label.toLowerCase()}{" "}
                      account
                    </p>
                  </div>
                </div>

                {/* Success Message */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {success}
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </motion.div>
                )}

                {/* Student Registration Form */}
                {selectedRole === "student" && (
                  <form onSubmit={handleStudentSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            value={studentData.name}
                            onChange={(e) =>
                              setStudentData({
                                ...studentData,
                                name: e.target.value,
                              })
                            }
                            placeholder="John Doe"
                            className="pl-10 rounded-xl border-gray-200 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="email"
                            value={studentData.email}
                            onChange={(e) =>
                              setStudentData({
                                ...studentData,
                                email: e.target.value,
                              })
                            }
                            placeholder="student@university.edu"
                            className="pl-10 rounded-xl border-gray-200 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Student ID *
                        </label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            value={studentData.studentId}
                            onChange={(e) =>
                              setStudentData({
                                ...studentData,
                                studentId: e.target.value,
                              })
                            }
                            placeholder="STU2024001"
                            className="pl-10 rounded-xl border-gray-200 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Batch/Year *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            value={studentData.batch}
                            onChange={(e) =>
                              setStudentData({
                                ...studentData,
                                batch: e.target.value,
                              })
                            }
                            placeholder="2024"
                            className="pl-10 rounded-xl border-gray-200 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            value={studentData.department}
                            onChange={(e) =>
                              setStudentData({
                                ...studentData,
                                department: e.target.value,
                              })
                            }
                            placeholder="Computer Science"
                            className="pl-10 rounded-xl border-gray-200 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="tel"
                            value={studentData.phone}
                            onChange={(e) =>
                              setStudentData({
                                ...studentData,
                                phone: e.target.value,
                              })
                            }
                            placeholder="+94 77 123 4567"
                            className="pl-10 rounded-xl border-gray-200 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={studentData.password}
                            onChange={(e) =>
                              setStudentData({
                                ...studentData,
                                password: e.target.value,
                              })
                            }
                            placeholder="••••••••"
                            className="pl-10 pr-10 rounded-xl border-gray-200 focus:border-blue-500"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            value={studentData.confirmPassword}
                            onChange={(e) =>
                              setStudentData({
                                ...studentData,
                                confirmPassword: e.target.value,
                              })
                            }
                            placeholder="••••••••"
                            className="pl-10 pr-10 rounded-xl border-gray-200 focus:border-blue-500"
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full bg-linear-to-r ${gradientClass} text-white rounded-xl py-3 font-semibold gap-2`}
                    >
                      {isLoading
                        ? "Creating account..."
                        : "Create Student Account"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                )}

                {/* Parent Registration Form */}
                {selectedRole === "parent" && (
                  <form onSubmit={handleParentSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            value={parentData.name}
                            onChange={(e) =>
                              setParentData({
                                ...parentData,
                                name: e.target.value,
                              })
                            }
                            placeholder="Jane Doe"
                            className="pl-10 rounded-xl border-gray-200 focus:border-emerald-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="email"
                            value={parentData.email}
                            onChange={(e) =>
                              setParentData({
                                ...parentData,
                                email: e.target.value,
                              })
                            }
                            placeholder="parent@email.com"
                            className="pl-10 rounded-xl border-gray-200 focus:border-emerald-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Child's Student ID *
                        </label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            value={parentData.childStudentId}
                            onChange={(e) =>
                              setParentData({
                                ...parentData,
                                childStudentId: e.target.value,
                              })
                            }
                            placeholder="STU2024001"
                            className="pl-10 rounded-xl border-gray-200 focus:border-emerald-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Relation to Child
                        </label>
                        <div className="relative">
                          <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            value={parentData.relation}
                            onChange={(e) =>
                              setParentData({
                                ...parentData,
                                relation: e.target.value,
                              })
                            }
                            placeholder="Mother / Father / Guardian"
                            className="pl-10 rounded-xl border-gray-200 focus:border-emerald-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="tel"
                            value={parentData.phone}
                            onChange={(e) =>
                              setParentData({
                                ...parentData,
                                phone: e.target.value,
                              })
                            }
                            placeholder="+94 77 123 4567"
                            className="pl-10 rounded-xl border-gray-200 focus:border-emerald-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={parentData.password}
                            onChange={(e) =>
                              setParentData({
                                ...parentData,
                                password: e.target.value,
                              })
                            }
                            placeholder="••••••••"
                            className="pl-10 pr-10 rounded-xl border-gray-200 focus:border-emerald-500"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            value={parentData.confirmPassword}
                            onChange={(e) =>
                              setParentData({
                                ...parentData,
                                confirmPassword: e.target.value,
                              })
                            }
                            placeholder="••••••••"
                            className="pl-10 pr-10 rounded-xl border-gray-200 focus:border-emerald-500"
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full bg-linear-to-r ${gradientClass} text-white rounded-xl py-3 font-semibold gap-2`}
                    >
                      {isLoading
                        ? "Creating account..."
                        : "Create Parent Account"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                )}

                {/* Lecturer Registration Form */}
                {selectedRole === "lecturer" && (
                  <form onSubmit={handleLecturerSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            value={lecturerData.name}
                            onChange={(e) =>
                              setLecturerData({
                                ...lecturerData,
                                name: e.target.value,
                              })
                            }
                            placeholder="Dr. John Smith"
                            className="pl-10 rounded-xl border-gray-200 focus:border-purple-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="email"
                            value={lecturerData.email}
                            onChange={(e) =>
                              setLecturerData({
                                ...lecturerData,
                                email: e.target.value,
                              })
                            }
                            placeholder="professor@university.edu"
                            className="pl-10 rounded-xl border-gray-200 focus:border-purple-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Employee ID *
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            value={lecturerData.employeeId}
                            onChange={(e) =>
                              setLecturerData({
                                ...lecturerData,
                                employeeId: e.target.value,
                              })
                            }
                            placeholder="LEC2024001"
                            className="pl-10 rounded-xl border-gray-200 focus:border-purple-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department *
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            value={lecturerData.department}
                            onChange={(e) =>
                              setLecturerData({
                                ...lecturerData,
                                department: e.target.value,
                              })
                            }
                            placeholder="Computer Science"
                            className="pl-10 rounded-xl border-gray-200 focus:border-purple-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Position *
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            value={lecturerData.position}
                            onChange={(e) =>
                              setLecturerData({
                                ...lecturerData,
                                position: e.target.value,
                              })
                            }
                            placeholder="Senior Lecturer / Professor"
                            className="pl-10 rounded-xl border-gray-200 focus:border-purple-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Qualification *
                        </label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            value={lecturerData.qualification}
                            onChange={(e) =>
                              setLecturerData({
                                ...lecturerData,
                                qualification: e.target.value,
                              })
                            }
                            placeholder="Ph.D. / Master's Degree"
                            className="pl-10 rounded-xl border-gray-200 focus:border-purple-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Specialization/Expertise *
                        </label>
                        <div className="relative">
                          <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            value={lecturerData.specialization}
                            onChange={(e) =>
                              setLecturerData({
                                ...lecturerData,
                                specialization: e.target.value,
                              })
                            }
                            placeholder="Data Structures, Algorithms, Database Systems"
                            className="pl-10 rounded-xl border-gray-200 focus:border-purple-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="tel"
                            value={lecturerData.phone}
                            onChange={(e) =>
                              setLecturerData({
                                ...lecturerData,
                                phone: e.target.value,
                              })
                            }
                            placeholder="+94 77 123 4567"
                            className="pl-10 rounded-xl border-gray-200 focus:border-purple-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Registration Code *
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="password"
                            value={lecturerData.lecturerCode}
                            onChange={(e) =>
                              setLecturerData({
                                ...lecturerData,
                                lecturerCode: e.target.value,
                              })
                            }
                            placeholder="Enter registration code"
                            className="pl-10 rounded-xl border-gray-200 focus:border-purple-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={lecturerData.password}
                            onChange={(e) =>
                              setLecturerData({
                                ...lecturerData,
                                password: e.target.value,
                              })
                            }
                            placeholder="••••••••"
                            className="pl-10 pr-10 rounded-xl border-gray-200 focus:border-purple-500"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            value={lecturerData.confirmPassword}
                            onChange={(e) =>
                              setLecturerData({
                                ...lecturerData,
                                confirmPassword: e.target.value,
                              })
                            }
                            placeholder="••••••••"
                            className="pl-10 pr-10 rounded-xl border-gray-200 focus:border-purple-500"
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Registration code: LECT2024
                    </p>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full bg-linear-to-r ${gradientClass} text-white rounded-xl py-3 font-semibold gap-2`}
                    >
                      {isLoading
                        ? "Creating account..."
                        : "Create Lecturer Account"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                )}

                {/* Admin Registration Form */}
                {selectedRole === "admin" && (
                  <form onSubmit={handleAdminSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            value={adminData.name}
                            onChange={(e) =>
                              setAdminData({
                                ...adminData,
                                name: e.target.value,
                              })
                            }
                            placeholder="Admin User"
                            className="pl-10 rounded-xl border-gray-200 focus:border-red-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="email"
                            value={adminData.email}
                            onChange={(e) =>
                              setAdminData({
                                ...adminData,
                                email: e.target.value,
                              })
                            }
                            placeholder="admin@unibridge.com"
                            className="pl-10 rounded-xl border-gray-200 focus:border-red-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Employee ID *
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            value={adminData.employeeId}
                            onChange={(e) =>
                              setAdminData({
                                ...adminData,
                                employeeId: e.target.value,
                              })
                            }
                            placeholder="ADM2024001"
                            className="pl-10 rounded-xl border-gray-200 focus:border-red-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department *
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            value={adminData.department}
                            onChange={(e) =>
                              setAdminData({
                                ...adminData,
                                department: e.target.value,
                              })
                            }
                            placeholder="IT Services"
                            className="pl-10 rounded-xl border-gray-200 focus:border-red-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Position *
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            value={adminData.position}
                            onChange={(e) =>
                              setAdminData({
                                ...adminData,
                                position: e.target.value,
                              })
                            }
                            placeholder="System Administrator"
                            className="pl-10 rounded-xl border-gray-200 focus:border-red-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="tel"
                            value={adminData.phone}
                            onChange={(e) =>
                              setAdminData({
                                ...adminData,
                                phone: e.target.value,
                              })
                            }
                            placeholder="+94 77 123 4567"
                            className="pl-10 rounded-xl border-gray-200 focus:border-red-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Registration Code *
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="password"
                            value={adminData.adminCode}
                            onChange={(e) =>
                              setAdminData({
                                ...adminData,
                                adminCode: e.target.value,
                              })
                            }
                            placeholder="Enter registration code"
                            className="pl-10 rounded-xl border-gray-200 focus:border-red-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={adminData.password}
                            onChange={(e) =>
                              setAdminData({
                                ...adminData,
                                password: e.target.value,
                              })
                            }
                            placeholder="••••••••"
                            className="pl-10 pr-10 rounded-xl border-gray-200 focus:border-red-500"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            value={adminData.confirmPassword}
                            onChange={(e) =>
                              setAdminData({
                                ...adminData,
                                confirmPassword: e.target.value,
                              })
                            }
                            placeholder="••••••••"
                            className="pl-10 pr-10 rounded-xl border-gray-200 focus:border-red-500"
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Registration code: ADMIN2024
                    </p>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full bg-linear-to-r ${gradientClass} text-white rounded-xl py-3 font-semibold gap-2`}
                    >
                      {isLoading
                        ? "Creating account..."
                        : "Create Admin Account"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                )}

                {/* Login Link */}
                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
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
              By creating an account, you agree to our{" "}
              <a
                href="#"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Privacy Policy
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
