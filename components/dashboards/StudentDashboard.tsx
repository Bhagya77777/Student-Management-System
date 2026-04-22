"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ChatAssistantV2 } from "@/components/ChatAssistantV2";
import { NoticeBoard } from "@/components/NoticeBoard";
import { PollWidget } from "@/components/PollWidget";
import { MetricCard } from "@/components/MetricCard";
import { SubjectPerformance } from "@/components/SubjectPerformance";
import { SemesterProgress } from "@/components/SemesterProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Plus,
  TrendingUp,
  Award,
  Clock,
  Send,
  X,
  Paperclip,
  CheckCircle,
  AlertCircle,
  Target,
  Brain,
  Zap,
  ArrowUp,
  ArrowDown,
  Info,
  CalendarDays,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ReferenceLine,
} from "recharts";

// Mock data for GPA history and predictions
const initialGpaData = [
  { semester: "Sem 1", gpa: 3.2, predicted: false, type: "Actual" },
  { semester: "Sem 2", gpa: 3.5, predicted: false, type: "Actual" },
  { semester: "Sem 3", gpa: 3.7, predicted: false, type: "Actual" },
  { semester: "Sem 4", gpa: 3.85, predicted: false, type: "Actual" },
  { semester: "Sem 5", gpa: 3.92, predicted: true, type: "Predicted" },
  { semester: "Sem 6", gpa: 3.95, predicted: true, type: "Predicted" },
  { semester: "Sem 7", gpa: 3.98, predicted: true, type: "Predicted" },
  { semester: "Sem 8", gpa: 4.0, predicted: true, type: "Predicted" },
];

const initialSubjectPredictions = [
  {
    subject: "Data Structures",
    currentMarks: 85,
    predictedMarks: 88,
    improvement: "+3",
    trend: "up",
  },
  {
    subject: "Algorithms",
    currentMarks: 78,
    predictedMarks: 82,
    improvement: "+4",
    trend: "up",
  },
  {
    subject: "Database Systems",
    currentMarks: 92,
    predictedMarks: 91,
    improvement: "-1",
    trend: "down",
  },
  {
    subject: "Web Development",
    currentMarks: 88,
    predictedMarks: 90,
    improvement: "+2",
    trend: "up",
  },
  {
    subject: "Operating Systems",
    currentMarks: 82,
    predictedMarks: 85,
    improvement: "+3",
    trend: "up",
  },
];

const initialSemesterPrediction = {
  currentGPA: 3.85,
  predictedNextSem: 3.92,
  predictedFinal: 3.95,
  confidence: 85,
  improvementAreas: ["Algorithms (+4%)", "Operating Systems (+3%)"],
};

// Mock data for leave requests
const initialLeaveRequestsData = [
  {
    id: 1,
    type: "Medical Leave",
    startDate: "2024-01-10",
    endDate: "2024-01-12",
    status: "approved",
    reason: "Flu and fever",
  },
  {
    id: 2,
    type: "Personal Leave",
    startDate: "2024-02-05",
    endDate: "2024-02-07",
    status: "pending",
    reason: "Family event",
  },
];

export function StudentDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    document: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [gpaData, setGpaData] = useState(initialGpaData);
  const [subjectPredictions, setSubjectPredictions] = useState(initialSubjectPredictions);
  const [semesterPrediction, setSemesterPrediction] = useState(initialSemesterPrediction);
  const [leaveRequestsData, setLeaveRequestsData] = useState(initialLeaveRequestsData);
  const [studentMetrics, setStudentMetrics] = useState({
    currentGpa: user?.role === "student" ? user.gpa || 0 : 0,
    attendance: 0,
    credits: user?.role === "student" ? user.credits || 0 : 0,
    totalCredits: user?.role === "student" ? user.totalCredits || 120 : 120,
    predictedGpa: initialSemesterPrediction.predictedNextSem,
  });

  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => setSubmitSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (user?.role !== "student") {
        return;
      }

      try {
        const [attendanceRes, marksRes, leavesRes, predictionRes] = await Promise.all([
          fetch("/api/attendance", { credentials: "include" }),
          fetch("/api/marks", { credentials: "include" }),
          fetch("/api/leaves", { credentials: "include" }),
          fetch(`/api/predictions/student/${user.studentId}`, { credentials: "include" }),
        ]);

        const attendance = attendanceRes.ok ? await attendanceRes.json() : null;
        const marks = marksRes.ok ? await marksRes.json() : null;
        const leaves = leavesRes.ok ? await leavesRes.json() : null;
        const prediction = predictionRes.ok ? await predictionRes.json() : null;

        const averageMarks = Number(marks?.summary?.averageMarks ?? 0);
        const currentGpa = Number((Math.min(4, averageMarks / 25) || user.gpa || 0).toFixed(2));
        const predictedExamScore = Number(prediction?.predictions?.nextExamExpectedScore ?? averageMarks);
        const predictedNextSem = Number((Math.min(4, predictedExamScore / 25) || currentGpa).toFixed(2));
        const predictedFinal = Number((Math.min(4, predictedNextSem + 0.08)).toFixed(2));

        setStudentMetrics({
          currentGpa,
          attendance: Number(attendance?.summary?.attendanceRate ?? 0),
          credits: user.credits || 0,
          totalCredits: user.totalCredits || 120,
          predictedGpa: predictedNextSem,
        });

        setGpaData([
          { semester: "Sem 1", gpa: Number((Math.max(2.5, currentGpa - 0.6)).toFixed(2)), predicted: false, type: "Actual" },
          { semester: "Sem 2", gpa: Number((Math.max(2.8, currentGpa - 0.35)).toFixed(2)), predicted: false, type: "Actual" },
          { semester: "Sem 3", gpa: Number((Math.max(3.0, currentGpa - 0.15)).toFixed(2)), predicted: false, type: "Actual" },
          { semester: "Sem 4", gpa: currentGpa, predicted: false, type: "Actual" },
          { semester: "Sem 5", gpa: predictedNextSem, predicted: true, type: "Predicted" },
          { semester: "Sem 6", gpa: Number((Math.min(4, predictedNextSem + 0.03)).toFixed(2)), predicted: true, type: "Predicted" },
          { semester: "Sem 7", gpa: Number((Math.min(4, predictedNextSem + 0.06)).toFixed(2)), predicted: true, type: "Predicted" },
          { semester: "Sem 8", gpa: predictedFinal, predicted: true, type: "Predicted" },
        ]);

        const marksBySubject = Array.isArray(marks?.records)
          ? marks.records.reduce((acc: Record<string, { total: number; count: number }>, record: any) => {
              const scorePct = record.maxScore > 0 ? (Number(record.score) / Number(record.maxScore)) * 100 : 0;
              const subject = String(record.subject || "Subject");
              acc[subject] = acc[subject] || { total: 0, count: 0 };
              acc[subject].total += scorePct;
              acc[subject].count += 1;
              return acc;
            }, {})
          : {};

        const dynamicSubjects = Object.entries(marksBySubject)
          .slice(0, 5)
          .map(([subject, value]) => {
            const typedValue = value as { total: number; count: number };
            const currentMarks = Number((typedValue.total / typedValue.count).toFixed(0));
            const predictedMarks = Number((Math.min(100, currentMarks + 3)).toFixed(0));
            return {
              subject,
              currentMarks,
              predictedMarks,
              improvement: `${predictedMarks >= currentMarks ? "+" : ""}${predictedMarks - currentMarks}`,
              trend: predictedMarks >= currentMarks ? "up" : "down",
            };
          });

        if (dynamicSubjects.length > 0) {
          setSubjectPredictions(dynamicSubjects);
        }

        const confidenceFromRisk = Number(prediction?.metrics?.riskScore ?? 25);
        const confidence = Math.max(60, Math.min(95, 100 - confidenceFromRisk));
        setSemesterPrediction({
          currentGPA: currentGpa,
          predictedNextSem: predictedNextSem,
          predictedFinal: predictedFinal,
          confidence,
          improvementAreas:
            dynamicSubjects.length > 0
              ? dynamicSubjects.slice(0, 2).map((item) => `${item.subject} (${item.improvement}%)`)
              : initialSemesterPrediction.improvementAreas,
        });

        const mappedLeaves = Array.isArray(leaves?.leaves)
          ? leaves.leaves.slice(0, 5).map((leave: any, index: number) => ({
              id: index + 1,
              type: String(leave.type || "Leave"),
              startDate: String(leave.startDate || ""),
              endDate: String(leave.endDate || ""),
              status: String(leave.status || "pending"),
              reason: String(leave.reason || ""),
            }))
          : [];

        if (mappedLeaves.length > 0) {
          setLeaveRequestsData(mappedLeaves);
        }
      } catch {
        return;
      }
    };

    void loadDashboardData();
  }, [user]);

  const sidebarItems = [
    {
      id: "overview",
      label: t("nav.dashboard"),
      icon: <LayoutDashboard className="h-4 w-4" />,
      href: "/student/dashboard",
    },
    {
      id: "attendance",
      label: t("nav.attendance"),
      icon: <Calendar className="h-4 w-4" />,
      href: "/student/attendance",
    },
    {
      id: "marks",
      label: t("nav.marks"),
      icon: <Award className="h-4 w-4" />,
      href: "/student/marks",
    },
    {
      id: "leave",
      label: t("nav.leave"),
      icon: <Clock className="h-4 w-4" />,
      href: "/student/leave",
    },
    {
      id: "chat",
      label: t("nav.chat"),
      icon: <MessageSquare className="h-4 w-4" />,
      href: "/student/chat",
    },
  ];

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitting(false);
    setSubmitSuccess(true);
    setShowLeaveForm(false);
    setLeaveForm({ startDate: "", endDate: "", reason: "", document: null });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          <div className="mt-1 space-y-1">
            {payload.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600">{item.name}:</span>
                <span className="text-sm font-bold text-gray-900">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          {payload[0]?.payload?.predicted && (
            <div className="mt-2 pt-1 border-t border-gray-100">
              <p className="text-xs text-blue-600 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Based on current performance trend
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar
          items={sidebarItems}
          activeItem={activeTab}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title={t("common.student")} />

          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-5"
                  >
                    {/* Welcome Section */}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user?.name?.split(" ")[0] || "Student"}!
                      </h2>
                      <p className="text-gray-500 text-sm">
                        Track your academic progress and see where you're heading
                      </p>
                    </div>

                    {/* Key Metrics - 4 cards */}
                    <div className="grid grid-cols-4 gap-4">
                      <MetricCard
                        label="Current GPA"
                        value={studentMetrics.currentGpa.toFixed(2)}
                        variant="primary"
                        size="sm"
                        icon={TrendingUp}
                      />
                      <MetricCard
                        label="Attendance"
                        value={`${studentMetrics.attendance.toFixed(1)}%`}
                        variant="success"
                        size="sm"
                      />
                      <MetricCard
                        label="Credits"
                        value={`${studentMetrics.credits}/${studentMetrics.totalCredits}`}
                        variant="default"
                        size="sm"
                      />
                      <MetricCard
                        label="Predicted GPA"
                        value={studentMetrics.predictedGpa.toFixed(2)}
                        variant="warning"
                        size="sm"
                        icon={Target}
                      />
                    </div>

                    {/* Two Column Layout - Left: GPA Chart, Right: Predictions */}
                    <div className="grid grid-cols-3 gap-5">
                      {/* GPA Chart - Takes 2 columns */}
                      <Card className="col-span-2 border-0 shadow-sm overflow-hidden">
                        <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-5 py-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-white font-semibold text-sm">
                                GPA Performance Tracker
                              </h3>
                              <p className="text-blue-100 text-xs mt-0.5">
                                Historical data & AI-powered predictions
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-white" />
                                <span className="text-xs text-blue-100">Actual</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-yellow-300" />
                                <span className="text-xs text-blue-100">Predicted</span>
                              </div>
                              <div className="h-6 w-px bg-blue-400" />
                              <div className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3 text-blue-100" />
                                <span className="text-xs text-blue-100">8 Semesters</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <CardContent className="pt-4 pb-2">
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={gpaData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                  dataKey="semester" 
                                  stroke="#6b7280"
                                  tick={{ fill: '#6b7280', fontSize: 11 }}
                                  axisLine={{ stroke: '#e5e7eb' }}
                                />
                                <YAxis 
                                  domain={[2.5, 4.1]} 
                                  stroke="#6b7280"
                                  tick={{ fill: '#6b7280', fontSize: 11 }}
                                  tickFormatter={(value) => value.toFixed(1)}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                
                                <ReferenceLine 
                                  y={3.0} 
                                  stroke="#f59e0b" 
                                  strokeDasharray="5 5"
                                  label={{ 
                                    value: "Minimum", 
                                    position: "right", 
                                    fill: "#f59e0b", 
                                    fontSize: 10,
                                    fontWeight: 500
                                  }} 
                                />
                                <ReferenceLine 
                                  y={3.5} 
                                  stroke="#10b981" 
                                  strokeDasharray="5 5"
                                  label={{ 
                                    value: "Good", 
                                    position: "right", 
                                    fill: "#10b981", 
                                    fontSize: 10,
                                    fontWeight: 500
                                  }} 
                                />
                                
                                <Area
                                  type="monotone"
                                  dataKey="gpa"
                                  stroke="none"
                                  fill="url(#colorGradient)"
                                  fillOpacity={0.1}
                                />
                                
                                <Line
                                  type="monotone"
                                  dataKey="gpa"
                                  name="GPA"
                                  stroke="#3b82f6"
                                  strokeWidth={3}
                                  dot={({ payload, index }) => (
                                    <circle
                                      key={payload?.semester || index}
                                      cx={0}
                                      cy={0}
                                      r={5}
                                      fill="#3b82f6"
                                      stroke="#fff"
                                      strokeWidth={2}
                                      style={{ display: payload.predicted ? 'none' : undefined }}
                                    />
                                  )}
                                  activeDot={{ r: 7, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                                />
                                
                                <Line
                                  type="monotone"
                                  dataKey="gpa"
                                  name="Predicted GPA"
                                  stroke="#fbbf24"
                                  strokeWidth={2.5}
                                  strokeDasharray="8 8"
                                  dot={({ payload, index }) => (
                                    <circle
                                      key={payload?.semester || index}
                                      cx={0}
                                      cy={0}
                                      r={4}
                                      fill="#fbbf24"
                                      stroke="#fff"
                                      strokeWidth={2}
                                      style={{ display: payload.predicted ? undefined : 'none' }}
                                    />
                                  )}
                                  activeDot={{ r: 6, fill: "#fbbf24", stroke: "#fff", strokeWidth: 2 }}
                                />
                                
                                <defs>
                                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3 mt-3 pt-2 border-t border-gray-100">
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Current</p>
                              <p className="text-sm font-bold text-blue-600">{studentMetrics.currentGpa.toFixed(2)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Next Semester</p>
                              <p className="text-sm font-bold text-yellow-600">{semesterPrediction.predictedNextSem.toFixed(2)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Graduation Target</p>
                              <p className="text-sm font-bold text-green-600">4.0</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Prediction Stats */}
                      <Card className="border-0 shadow-sm">
                        <div className="bg-linear-to-r from-purple-50 to-indigo-50 px-5 py-3 border-b border-purple-100">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            GPA Insights
                          </h3>
                          <p className="text-gray-500 text-xs mt-0.5">
                            AI-powered semester predictions
                          </p>
                        </div>
                        <CardContent className="pt-4 space-y-4">
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                            <div>
                              <p className="text-xs text-gray-500">Next Semester</p>
                              <p className="text-xl font-bold text-blue-600">
                                {semesterPrediction.predictedNextSem}
                              </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <TrendingUp className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                            <div>
                              <p className="text-xs text-gray-500">Final Year</p>
                              <p className="text-xl font-bold text-green-600">
                                {semesterPrediction.predictedFinal}
                              </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <Award className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                            <div>
                              <p className="text-xs text-gray-500">Confidence</p>
                              <p className="text-xl font-bold text-purple-600">
                                {semesterPrediction.confidence}%
                              </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <Brain className="h-5 w-5 text-purple-600" />
                            </div>
                          </div>
                          
                          <div className="mt-2 p-2 bg-blue-50/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Info className="h-3 w-3 text-blue-500" />
                              <p className="text-xs text-gray-600">
                                Based on <span className="font-medium">85% confidence</span> using historical data
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Subject Predictions */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-semibold">
                            Subject Performance Predictions
                          </CardTitle>
                          <Button variant="ghost" size="sm" className="text-xs gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Full Report
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-5 gap-3">
                          {subjectPredictions.map((subject, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-sm text-gray-900 truncate">
                                  {subject.subject}
                                </h4>
                                <div
                                  className={`flex items-center gap-0.5 text-xs font-medium ${
                                    subject.trend === "up"
                                      ? "text-green-600"
                                      : "text-orange-600"
                                  }`}
                                >
                                  {subject.trend === "up" ? (
                                    <ArrowUp className="h-3 w-3" />
                                  ) : (
                                    <ArrowDown className="h-3 w-3" />
                                  )}
                                  {subject.improvement}
                                </div>
                              </div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-500">Current</span>
                                <span className="text-sm font-semibold text-gray-700">
                                  {subject.currentMarks}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-blue-600">Predicted</span>
                                <span className="text-sm font-bold text-blue-600">
                                  {subject.predictedMarks}%
                                </span>
                              </div>
                              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-linear-to-r from-blue-500 to-indigo-500 rounded-full"
                                  style={{ width: `${subject.predictedMarks}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 flex items-center justify-between p-2 bg-blue-50/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-medium text-gray-700">
                              Focus on:
                            </span>
                            {semesterPrediction.improvementAreas.map(
                              (area, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs text-blue-600 bg-white px-2 py-0.5 rounded"
                                >
                                  {area}
                                </span>
                              )
                            )}
                          </div>
                          <Zap className="h-3 w-3 text-blue-400" />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Three Column Layout - Subject Performance, Semester Progress, Notice Board */}
                    <div className="grid grid-cols-3 gap-5">
                      {/* Left Column - Subject Performance */}
                      <div className="col-span-2 space-y-5">
                        <SubjectPerformance />
                        <SemesterProgress progress={80} />
                      </div>
                      
                      {/* Right Column - Notice Board */}
                      <div className="space-y-5">
                        <PollWidget maxPolls={2} />
                        <NoticeBoard targetAudience="Students" maxNotices={4} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Attendance Tab */}
                {activeTab === "attendance" && (
                  <motion.div
                    key="attendance"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-5"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Attendance Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Overall Attendance</p>
                              <p className="text-2xl font-bold text-blue-600">94.2%</p>
                              <p className="text-xs text-green-600 mt-1">↑ 2% from last month</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Classes Conducted</p>
                              <p className="text-2xl font-bold text-green-600">45</p>
                              <p className="text-xs text-gray-500 mt-1">Present: 42 | Absent: 3</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-gray-900">Subject-wise Attendance</h4>
                            <div className="space-y-2">
                              {[
                                { subject: "Data Structures", attendance: 92 },
                                { subject: "Web Development", attendance: 95 },
                                { subject: "Database Systems", attendance: 88 },
                                { subject: "Software Engineering", attendance: 98 },
                                { subject: "Operating Systems", attendance: 89 },
                              ].map((item) => (
                                <div key={item.subject}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-700">{item.subject}</span>
                                    <span className="text-xs font-semibold text-gray-900">{item.attendance}%</span>
                                  </div>
                                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        item.attendance >= 90 ? "bg-green-500" : item.attendance >= 75 ? "bg-blue-500" : "bg-yellow-500"
                                      }`}
                                      style={{ width: `${item.attendance}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Marks Tab */}
                {activeTab === "marks" && (
                  <motion.div
                    key="marks"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Academic Results</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-5">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Semester GPA</p>
                              <p className="text-2xl font-bold text-blue-600">3.85</p>
                              <p className="text-xs text-green-600 mt-1">↑ 0.12</p>
                            </div>
                            <div className="p-3 bg-linear-to-br from-green-50 to-green-100 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">CGPA</p>
                              <p className="text-2xl font-bold text-green-600">3.72</p>
                            </div>
                            <div className="p-3 bg-linear-to-br from-purple-50 to-purple-100 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Credits</p>
                              <p className="text-2xl font-bold text-purple-600">48/120</p>
                            </div>
                          </div>
                          <SubjectPerformance />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Leave Tab */}
                {activeTab === "leave" && (
                  <motion.div
                    key="leave"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-5"
                  >
                    {submitSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="text-green-700">Request submitted!</p>
                      </motion.div>
                    )}

                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Leave Request</CardTitle>
                          <Button onClick={() => setShowLeaveForm(!showLeaveForm)} size="sm" className="gap-1">
                            <Plus className="h-3 w-3" />
                            New
                          </Button>
                        </div>
                      </CardHeader>
                      <AnimatePresence>
                        {showLeaveForm && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <CardContent className="border-t pt-4">
                              <form onSubmit={handleLeaveSubmit} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                      type="date"
                                      value={leaveForm.startDate}
                                      onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                                      className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                      type="date"
                                      value={leaveForm.endDate}
                                      onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                                      className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                                      required
                                    />
                                  </div>
                                </div>
                                <div>
                                  <textarea
                                    value={leaveForm.reason}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                                    rows={2}
                                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                                    placeholder="Reason..."
                                    required
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button type="submit" disabled={submitting} size="sm">
                                    {submitting ? "..." : "Submit"}
                                    <Send className="h-3 w-3 ml-1" />
                                  </Button>
                                  <Button type="button" variant="outline" size="sm" onClick={() => setShowLeaveForm(false)}>
                                    Cancel
                                  </Button>
                                </div>
                              </form>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Leave History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {leaveRequestsData.map((request) => (
                            <div key={request.id} className="p-3 border border-gray-100 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-sm">{request.type}</h4>
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                      {getStatusIcon(request.status)}
                                      {request.status}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">{request.startDate} - {request.endDate}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Chat Tab */}
                {activeTab === "chat" && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Messages & Support</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center justify-center py-8">
                          <MessageSquare className="h-10 w-10 text-gray-300 mb-2" />
                          <p className="text-gray-500 text-sm text-center">Chat support coming soon</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
        <ChatAssistantV2 />
      </div>
    </div>
  );
}