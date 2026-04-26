"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ChatAssistantV2 } from "@/components/ChatAssistantV2";
import { NoticeBoard } from "@/components/NoticeBoard";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  Calendar, 
  Award,
  Clock,
  MessageSquare,
  Users,
  TrendingUp,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Eye,
  ChevronRight,
  Download,
  UserCheck,
  GraduationCap,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";

// Mock data
const initialStats = {
  totalStudents: 156,
  courses: 4,
  pendingLeaves: 3,
  todayClasses: 2,
  averageAttendance: 87.5,
  marksSubmitted: 78,
  totalMarks: 92,
};

const initialWeeklySchedule = [
  {
    day: "Monday",
    time: "09:00 - 11:00",
    course: "Data Structures",
    room: "A-101",
  },
  {
    day: "Tuesday",
    time: "10:00 - 12:00",
    course: "Algorithms",
    room: "B-203",
  },
  {
    day: "Wednesday",
    time: "14:00 - 16:00",
    course: "Database Systems",
    room: "Lab C-305",
  },
  {
    day: "Thursday",
    time: "09:00 - 11:00",
    course: "Data Structures",
    room: "A-101",
  },
  { day: "Friday", time: "11:00 - 13:00", course: "Algorithms", room: "B-203" },
];

const initialPendingLeaves = [
  {
    id: 1,
    student: "Kavita Perera",
    studentId: "STU2024001",
    type: "Medical Leave",
    dates: "Mar 20-22, 2024",
    reason: "Flu and fever",
    parentApproved: true,
  },
  {
    id: 2,
    student: "Ravi Kumar",
    studentId: "STU2024002",
    type: "Personal Leave",
    dates: "Mar 25-26, 2024",
    reason: "Family function",
    parentApproved: true,
  },
  {
    id: 3,
    student: "Amara Silva",
    studentId: "STU2024003",
    type: "Academic Leave",
    dates: "Apr 5-7, 2024",
    reason: "Conference",
    parentApproved: true,
  },
];

const initialAttendanceData = [
  { subject: "Data Structures", attendance: 92, total: 25 },
  { subject: "Algorithms", attendance: 88, total: 24 },
  { subject: "Database Systems", attendance: 95, total: 20 },
  { subject: "Software Engineering", attendance: 89, total: 22 },
];

const initialCoursePerformance = [
  { course: "Data Structures", average: 85, students: 42 },
  { course: "Algorithms", average: 78, students: 38 },
  { course: "Database Systems", average: 92, students: 40 },
  { course: "Software Engineering", average: 82, students: 36 },
];

const lecturerSidebarItems = [
  {
    id: "overview",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    href: "/lecturer",
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: <Calendar className="h-4 w-4" />,
    href: "/lecturer/attendance",
  },
  {
    id: "marks",
    label: "Marks",
    icon: <Award className="h-4 w-4" />,
    href: "/lecturer/marks",
  },
  {
    id: "leave",
    label: "Leave Approvals",
    icon: <Clock className="h-4 w-4" />,
    href: "/lecturer/leave",
  },
  {
    id: "students",
    label: "Students",
    icon: <Users className="h-4 w-4" />,
    href: "/lecturer/students",
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: <BookOpen className="h-4 w-4" />,
    href: "/lecturer/schedule",
  },
  {
    id: "chat",
    label: "Messages",
    icon: <MessageSquare className="h-4 w-4" />,
    href: "/lecturer/chat",
  },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function LecturerDashboardPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(initialStats);
  const [weeklySchedule, setWeeklySchedule] = useState(initialWeeklySchedule);
  const [pendingLeaves, setPendingLeaves] = useState(initialPendingLeaves);
  const [attendanceData, setAttendanceData] = useState(initialAttendanceData);
  const [coursePerformance, setCoursePerformance] = useState(initialCoursePerformance);

  useEffect(() => {
    const loadLecturerData = async () => {
      try {
        const [studentsRes, attendanceRes, marksRes, leavesRes] = await Promise.all([
          fetch("/api/users?role=student", { credentials: "include" }),
          fetch("/api/attendance", { credentials: "include" }),
          fetch("/api/marks", { credentials: "include" }),
          fetch("/api/leaves", { credentials: "include" }),
        ]);

        const students = studentsRes.ok ? await studentsRes.json() : null;
        const attendance = attendanceRes.ok ? await attendanceRes.json() : null;
        const marks = marksRes.ok ? await marksRes.json() : null;
        const leaves = leavesRes.ok ? await leavesRes.json() : null;

        const studentTotal = Array.isArray(students?.users) ? students.users.length : 0;
        const leavesList = Array.isArray(leaves?.leaves) ? leaves.leaves : [];
        const pendingCount = leavesList.filter((item: any) => String(item.status) === "pending").length;
        const marksList = Array.isArray(marks?.records) ? marks.records : [];
        const avgAttendance = Number(attendance?.summary?.attendanceRate ?? 0);

        setStats({
          totalStudents: studentTotal,
          courses: Math.max(1, new Set(marksList.map((item: any) => String(item.subject || "Subject"))).size),
          pendingLeaves: pendingCount,
          todayClasses: Math.min(4, Math.max(1, new Date().getDay() % 4 || 2)),
          averageAttendance: avgAttendance,
          marksSubmitted: marksList.length,
          totalMarks: marksList.length,
        });

        const courseMap = marksList.reduce((acc: Record<string, { total: number; count: number; students: Set<string> }>, row: any) => {
          const subject = String(row.subject || "Subject");
          const scorePct = row.maxScore > 0 ? (Number(row.score) / Number(row.maxScore)) * 100 : 0;
          acc[subject] = acc[subject] || { total: 0, count: 0, students: new Set<string>() };
          acc[subject].total += scorePct;
          acc[subject].count += 1;
          acc[subject].students.add(String(row.studentCode || ""));
          return acc;
        }, {});

        const performanceRows = Object.entries(courseMap).map(([course, value]) => {
          const typedValue = value as { total: number; count: number; students: Set<string> };
          return {
            course,
            average: Number((typedValue.total / typedValue.count).toFixed(0)),
            students: typedValue.students.size || typedValue.count,
          };
        });

        if (performanceRows.length > 0) {
          setCoursePerformance(performanceRows.slice(0, 4));
          setAttendanceData(
            performanceRows.slice(0, 4).map((item) => ({
              subject: item.course,
              attendance: Number(avgAttendance.toFixed(0)),
              total: item.students,
            }))
          );
          setWeeklySchedule(
            performanceRows.slice(0, 5).map((item, index) => ({
              day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][index] || "Day",
              time: ["09:00 - 11:00", "10:00 - 12:00", "14:00 - 16:00", "09:00 - 11:00", "11:00 - 13:00"][index] || "09:00 - 11:00",
              course: item.course,
              room: `Room-${index + 101}`,
            }))
          );
        }

        const leaveRows = leavesList
          .filter((item: any) => String(item.status) === "pending")
          .slice(0, 3)
          .map((item: any, index: number) => ({
            id: index + 1,
            student: String(item.studentName || "Student"),
            studentId: String(item.studentCode || "N/A"),
            type: String(item.type || "Leave"),
            dates: `${String(item.startDate || "")} - ${String(item.endDate || "")}`,
            reason: String(item.reason || ""),
            parentApproved: true,
          }));

        if (leaveRows.length > 0) {
          setPendingLeaves(leaveRows);
        }
      } catch {
        return;
      }
    };

    void loadLecturerData();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-purple-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={lecturerSidebarItems} activeItem="overview" />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Lecturer Portal" />

          <main className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.name?.split(" ")[0] || "Lecturer"}!
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Manage your courses, attendance, and student requests
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4">
                <MetricCard
                  label="Courses"
                  value={stats.courses.toString()}
                  variant="primary"
                  size="sm"
                  icon={BookOpen}
                />
                <MetricCard
                  label="Students"
                  value={stats.totalStudents.toString()}
                  variant="success"
                  size="sm"
                  icon={Users}
                />
                <MetricCard
                  label="Pending Leaves"
                  value={stats.pendingLeaves.toString()}
                  variant="warning"
                  size="sm"
                  icon={ClockIcon}
                />
                <MetricCard
                  label="Classes Today"
                  value={stats.todayClasses.toString()}
                  variant="default"
                  size="sm"
                  icon={Calendar}
                />
              </div>

              {/* Today's Schedule & Performance */}
              <div className="grid grid-cols-3 gap-6">
                {/* Today's Schedule */}
                <Card className="col-span-1 border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">
                      Today's Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {weeklySchedule.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.course}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {item.time}
                              </p>
                              <p className="text-xs text-purple-600">
                                Room: {item.room}
                              </p>
                            </div>
                            <Badge className="bg-purple-100 text-purple-700">
                              Today
                            </Badge>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 gap-1"
                      >
                        View Full Schedule
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="col-span-2 border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">
                      Course Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={coursePerformance}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e7eb"
                          />
                          <XAxis dataKey="course" stroke="#6b7280" />
                          <YAxis domain={[0, 100]} stroke="#6b7280" />
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Bar
                            dataKey="average"
                            fill="#8b5cf6"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Attendance Overview */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    Course-wise Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attendanceData.map((item) => (
                      <div key={item.subject}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {item.subject}
                          </span>
                          <span
                            className={`text-sm font-semibold ${item.attendance >= 90 ? "text-green-600" : item.attendance >= 75 ? "text-blue-600" : "text-yellow-600"}`}
                          >
                            {item.attendance}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.attendance >= 90 ? "bg-green-500" : item.attendance >= 75 ? "bg-blue-500" : "bg-yellow-500"}`}
                            style={{ width: `${item.attendance}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Total Classes: {item.total}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pending Leave Requests */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      Pending Leave Approvals
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View All
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingLeaves.map((leave) => (
                      <div
                        key={leave.id}
                        className="p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">
                                {leave.student}
                              </h4>
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Pending
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {leave.studentId}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {leave.type} • {leave.dates}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {leave.reason}
                            </p>
                            <Badge className="mt-2 bg-green-100 text-green-800 text-xs">
                              Parent Approved ✓
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50 gap-1"
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notice Board */}
              <NoticeBoard targetAudience="Lecturers" maxNotices={3} />
            </div>
          </main>
        </div>
        <ChatAssistantV2 />
      </div>
    </div>
  );
}
