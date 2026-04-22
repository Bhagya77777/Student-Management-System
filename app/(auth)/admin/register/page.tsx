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
  User,
  Building,
  Phone,
  CheckCircle2,
  AlertCircle,
  Key,
  Briefcase,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

export default function AdminRegisterPage() {
  const router = useRouter();
  const { registerAdmin, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    phone: false,
    department: false,
    position: false,
    password: false,
    confirmPassword: false
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    employeeId: "",
    password: "",
    confirmPassword: "",
    adminCode: "",
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

    if (!formData.adminCode) {
      setError("Please enter the admin registration code");
      return;
    }

    if (formData.adminCode !== "ADMIN2024") {
      setError("Invalid admin registration code");
      return;
    }

    try {
      await registerAdmin({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        position: formData.position,
        employeeId: formData.employeeId,
        phone: formData.phone,
        adminCode: formData.adminCode,
      });
      setSuccess("Registration successful. Redirecting...");
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
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

  const departments = [
    "Information Technology",
    "Human Resources",
    "Academic Affairs",
    "Finance",
    "Student Services",
    "Admissions",
    "Library Services",
    "Facilities Management"
  ];

  const positions = [
    "System Administrator",
    "Database Administrator",
    "Network Administrator",
    "IT Manager",
    "Academic Coordinator",
    "Student Affairs Officer",
    "Finance Officer",
    "HR Manager"
  ];

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
      <div style={{position: 'absolute', inset: 0, opacity: 0.5, background: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cdefs%3E%3Cpattern id=\"grid\" width=\"60\" height=\"60\" patternUnits=\"userSpaceOnUse\"%3E%3Cpath d=\"M 60 0 L 0 0 0 60\" fill=\"none\" stroke=\"rgba(255,255,255,0.03)\" stroke-width=\"1\"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\"100%25\" height=\"100%25\" fill=\"url(%23grid)\"/%3E%3C/svg%3E')"}} />

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
                <p className="text-xs text-purple-200">Admin Registration</p>
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
            className="w-full max-w-2xl"
          >
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
                  <ShieldCheck className="h-10 w-10 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mt-4 mb-2">Admin Registration</h1>
              <p className="text-purple-200 text-sm">Create an administrator account</p>
            </motion.div>

            {/* Success Message */}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-green-500/20 border border-green-500/30 text-sm text-green-200 flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </motion.div>
            )}

            <motion.form 
              variants={formVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit} 
              className="space-y-4"
            >
              {/* ...existing code for form fields, error, and submit button... */}
            </motion.form>

            {/* Security Note */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 pt-6 border-t border-white/10 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-xs text-purple-300">
                <Shield className="h-3 w-3" />
                <span>Admin accounts require approval before activation</span>
              </div>
            </motion.div>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-purple-200">
                Already have admin access?{' '}
                <Link
                  href="/admin/login"
                  className="text-white hover:underline font-semibold"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}