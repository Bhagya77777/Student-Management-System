"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ChatAssistantV2 } from "@/components/ChatAssistantV2";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Users,
  Bell,
  PieChart,
  MessageSquare,
  Settings,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  GraduationCap,
  DollarSign,
  Calendar,
  Activity,
  UserCheck,
  UserX,
  Eye,
  Download,
  ChevronRight
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
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";

// Mock data
const initialUserStats = {
  total: 2547,
  students: 2150,
  parents: 350,
  lecturers: 42,
  admins: 5,
  active: 2380,
  inactive: 167,
  newThisMonth: 156,
};

const initialSystemStats = {
  notices: 24,
  publishedNotices: 18,
  draftNotices: 6,
  polls: 8,
  activePolls: 3,
  completedPolls: 5,
  leaveRequests: 12,
  pendingLeaves: 4,
  approvedLeaves: 8,
};

const initialRecentActivity = [
  { id: 1, user: "Kavita Perera", action: "Submitted leave request", time: "5 min ago", type: "leave" },
  { id: 2, user: "Prof. Smith", action: "Published new notice", time: "1 hour ago", type: "notice" },
  { id: 3, user: "Amara Silva", action: "Completed fee payment", time: "2 hours ago", type: "payment" },
  { id: 4, user: "Dr. Johnson", action: "Updated marks", time: "3 hours ago", type: "marks" },
  { id: 5, user: "New Student", action: "Registered", time: "5 hours ago", type: "registration" },
];

const initialWeeklyData = [
  { day: "Mon", users: 45, notices: 3, leaves: 2 },
  { day: "Tue", users: 52, notices: 1, leaves: 3 },
  { day: "Wed", users: 48, notices: 4, leaves: 1 },
  { day: "Thu", users: 61, notices: 2, leaves: 4 },
  { day: "Fri", users: 38, notices: 3, leaves: 2 },
  { day: "Sat", users: 25, notices: 0, leaves: 1 },
  { day: "Sun", users: 18, notices: 1, leaves: 0 },
];

const initialUserDistribution = [
  { name: "Students", value: 2150, color: "#3b82f6" },
  { name: "Parents", value: 350, color: "#10b981" },
  { name: "Lecturers", value: 42, color: "#f59e0b" },
  { name: "Admins", value: 5, color: "#8b5cf6" },
];

const adminSidebarItems = [
  { id: "overview", label: "Dashboard", icon: <Shield className="h-4 w-4" />, href: "/admin" },
  { id: "users", label: "User Management", icon: <Users className="h-4 w-4" />, href: "/admin/users" },
  { id: "notices", label: "Notice Board", icon: <Bell className="h-4 w-4" />, href: "/admin/notices" },
  { id: "polls", label: "Poll Management", icon: <PieChart className="h-4 w-4" />, href: "/admin/polls" },
  { id: "leave", label: "Leave Requests", icon: <Clock className="h-4 w-4" />, href: "/admin/leave" },
  { id: "payments", label: "Payment Reports", icon: <DollarSign className="h-4 w-4" />, href: "/admin/payments" },
  { id: "chat", label: "Chat Support", icon: <MessageSquare className="h-4 w-4" />, href: "/admin/chat" },
  { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" />, href: "/admin/settings" },
];

export default function AdminDashboardPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("week");
  const [userStats, setUserStats] = useState(initialUserStats);
  const [systemStats, setSystemStats] = useState(initialSystemStats);
  const [recentActivity, setRecentActivity] = useState(initialRecentActivity);
  const [weeklyData, setWeeklyData] = useState(initialWeeklyData);
  const [userDistribution, setUserDistribution] = useState(initialUserDistribution);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [usersRes, noticesRes, pollsRes, leavesRes, paymentsRes] = await Promise.all([
          fetch("/api/users", { credentials: "include" }),
          fetch("/api/notices", { credentials: "include" }),
          fetch("/api/polls", { credentials: "include" }),
          fetch("/api/leaves", { credentials: "include" }),
          fetch("/api/payments", { credentials: "include" }),
        ]);

        const users = usersRes.ok ? await usersRes.json() : null;
        const notices = noticesRes.ok ? await noticesRes.json() : null;
        const polls = pollsRes.ok ? await pollsRes.json() : null;
        const leaves = leavesRes.ok ? await leavesRes.json() : null;
        const payments = paymentsRes.ok ? await paymentsRes.json() : null;

        const userList = Array.isArray(users?.users) ? users.users : [];
        const noticesList = Array.isArray(notices?.notices) ? notices.notices : [];
        const pollsList = Array.isArray(polls?.polls) ? polls.polls : [];
        const leavesList = Array.isArray(leaves?.leaves) ? leaves.leaves : [];
        const paymentsList = Array.isArray(payments?.payments) ? payments.payments : [];

        const roleCount = userList.reduce(
          (acc: Record<string, number>, item: any) => {
            const role = String(item.role || "student");
            acc[role] = (acc[role] || 0) + 1;
            return acc;
          },
          { student: 0, parent: 0, lecturer: 0, admin: 0 }
        );

        const activeUsers = userList.filter((item: any) => String(item.status || "active") === "active").length;
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        const newThisMonth = userList.filter((item: any) => {
          const value = new Date(item.joinDate || item.createdAt || now);
          return value.getFullYear() === year && value.getMonth() === month;
        }).length;

        setUserStats({
          total: userList.length,
          students: roleCount.student || 0,
          parents: roleCount.parent || 0,
          lecturers: roleCount.lecturer || 0,
          admins: roleCount.admin || 0,
          active: activeUsers,
          inactive: Math.max(0, userList.length - activeUsers),
          newThisMonth,
        });

        setSystemStats({
          notices: noticesList.length,
          publishedNotices: noticesList.filter((item: any) => String(item.status) === "published").length,
          draftNotices: noticesList.filter((item: any) => String(item.status) !== "published").length,
          polls: pollsList.length,
          activePolls: pollsList.filter((item: any) => String(item.status) === "active").length,
          completedPolls: pollsList.filter((item: any) => String(item.status) === "completed").length,
          leaveRequests: leavesList.length,
          pendingLeaves: leavesList.filter((item: any) => String(item.status) === "pending").length,
          approvedLeaves: leavesList.filter((item: any) => String(item.status) === "approved").length,
        });

        setUserDistribution([
          { name: "Students", value: roleCount.student || 0, color: "#3b82f6" },
          { name: "Parents", value: roleCount.parent || 0, color: "#10b981" },
          { name: "Lecturers", value: roleCount.lecturer || 0, color: "#f59e0b" },
          { name: "Admins", value: roleCount.admin || 0, color: "#8b5cf6" },
        ]);

        const activityRows = [
          ...leavesList.slice(0, 2).map((item: any, index: number) => ({
            id: index + 1,
            user: String(item.studentName || "Student"),
            action: `Submitted ${String(item.type || "leave").toLowerCase()}`,
            time: String(item.appliedDate || "recently"),
            type: "leave",
          })),
          ...noticesList.slice(0, 2).map((item: any, index: number) => ({
            id: index + 10,
            user: "Admin",
            action: `Updated notice: ${String(item.title || "Notice")}`,
            time: String(item.publishedDate || "recently"),
            type: "notice",
          })),
          ...paymentsList.slice(0, 1).map((item: any, index: number) => ({
            id: index + 20,
            user: String(item.studentName || "Student"),
            action: `Payment ${String(item.status || "updated")}`,
            time: String(item.updatedAt || "recently"),
            type: "payment",
          })),
        ];

        if (activityRows.length > 0) {
          setRecentActivity(activityRows);
        }

        const weekTemplate = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        setWeeklyData(
          weekTemplate.map((day, index) => ({
            day,
            users: Math.max(0, Math.round((newThisMonth || 1) / 7) + (index % 2)),
            notices: Math.max(0, Math.round(noticesList.length / 7) + (index % 3 === 0 ? 1 : 0)),
            leaves: Math.max(0, Math.round(leavesList.length / 7) + (index % 2 === 0 ? 1 : 0)),
          }))
        );
      } catch {
        return;
      }
    };

    void loadAdminData();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={adminSidebarItems} activeItem="overview" />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Admin Dashboard" />
          
          <main className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Here's what's happening across your institution today
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4">
                <MetricCard label="Total Users" value={userStats.total.toLocaleString()} variant="primary" size="sm" icon={Users} />
                <MetricCard label="Active Users" value={userStats.active.toLocaleString()} variant="success" size="sm" icon={UserCheck} />
                <MetricCard label="New This Month" value={`+${userStats.newThisMonth}`} variant="warning" size="sm" icon={TrendingUp} />
                <MetricCard label="Pending Approvals" value={systemStats.pendingLeaves} variant="default" size="sm" icon={Clock} />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-3 gap-6">
                {/* User Activity Chart */}
                <Card className="col-span-2 border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">Platform Activity</CardTitle>
                      <div className="flex gap-2">
                        <Button variant={timeRange === "week" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("week")} className={timeRange === "week" ? "bg-blue-600" : ""}>Week</Button>
                        <Button variant={timeRange === "month" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("month")} className={timeRange === "month" ? "bg-blue-600" : ""}>Month</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="day" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip />
                          <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} name="New Users" />
                          <Bar dataKey="notices" fill="#10b981" radius={[4, 4, 0, 0]} name="Notices" />
                          <Bar dataKey="leaves" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Leave Requests" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* User Distribution */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">User Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={userDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {userDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-2 border-t border-gray-100">
                      {userDistribution.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-xs text-gray-600">{item.name}</span>
                          </div>
                          <span className="text-xs font-semibold text-gray-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity & Quick Actions */}
              <div className="grid grid-cols-3 gap-6">
                {/* Recent Activity */}
                <Card className="col-span-2 border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                      <Button variant="ghost" size="sm" className="gap-1">
                        View All
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              activity.type === "leave" ? "bg-yellow-100" :
                              activity.type === "notice" ? "bg-blue-100" :
                              activity.type === "payment" ? "bg-green-100" : "bg-purple-100"
                            }`}>
                              {activity.type === "leave" && <Clock className="h-4 w-4 text-yellow-600" />}
                              {activity.type === "notice" && <Bell className="h-4 w-4 text-blue-600" />}
                              {activity.type === "payment" && <DollarSign className="h-4 w-4 text-green-600" />}
                              {activity.type === "marks" && <FileText className="h-4 w-4 text-purple-600" />}
                              {activity.type === "registration" && <UserCheck className="h-4 w-4 text-emerald-600" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                              <p className="text-xs text-gray-500">{activity.action}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700">
                      <Bell className="h-4 w-4" />
                      Create New Notice
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <PieChart className="h-4 w-4" />
                      Create New Poll
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Users className="h-4 w-4" />
                      Add New User
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Download className="h-4 w-4" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* System Status */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm bg-green-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-gray-600">System Status</span>
                      <Badge className="bg-green-600 text-white ml-auto">Operational</Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-blue-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-gray-600">Notices Published</span>
                      <Badge className="bg-blue-600 text-white ml-auto">{systemStats.publishedNotices}/{systemStats.notices}</Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-yellow-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs text-gray-600">Pending Leaves</span>
                      <Badge className="bg-yellow-600 text-white ml-auto">{systemStats.pendingLeaves}</Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-purple-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-purple-600" />
                      <span className="text-xs text-gray-600">Active Polls</span>
                      <Badge className="bg-purple-600 text-white ml-auto">{systemStats.activePolls}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
        <ChatAssistantV2 />
      </div>
    </div>
  );
}