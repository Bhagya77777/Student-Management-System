"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { parentSidebarItems } from "@/components/sidebar/parentSidebarItems";
import { ChatAssistantV2 } from "@/components/ChatAssistantV2";
import { NoticeBoard } from "@/components/NoticeBoard";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap,
  UserCheck,
  Heart,
  Clock as ClockIcon,
  Eye,
  Send,
  TrendingUp,
  Award,
  Calendar,
  AlertCircle,
  ChevronRight,
  Download
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ReferenceLine
} from "recharts";

// Mock data for child's GPA history
const initialGpaData = [
  { semester: "Sem 1", gpa: 3.2 },
  { semester: "Sem 2", gpa: 3.5 },
  { semester: "Sem 3", gpa: 3.7 },
  { semester: "Sem 4", gpa: 3.85 },
];

// Mock data for child's subject performance
const initialChildSubjectPerformance = [
  { subject: "Data Structures", marks: 85, grade: "A", attendance: 92 },
  { subject: "Algorithms", marks: 78, grade: "B+", attendance: 88 },
  { subject: "Database Systems", marks: 92, grade: "A", attendance: 95 },
  { subject: "Web Development", marks: 88, grade: "A-", attendance: 94 },
  { subject: "Operating Systems", marks: 82, grade: "B+", attendance: 89 },
];

// Mock data for fee status
const initialFeeStatus = {
  semester: "Spring 2024",
  totalFee: 250000,
  paid: 200000,
  due: 50000,
  dueDate: "2024-04-15",
};

// Mock data for recent announcements
const initialRecentAnnouncements = [
  { id: 1, title: "Parent-Teacher Meeting", date: "2024-03-30", important: true },
  { id: 2, title: "Fee Payment Deadline", date: "2024-04-15", important: true },
  { id: 3, title: "Sports Day Registration", date: "2024-03-25", important: false },
];

export default function ParentDashboardPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [activeTab] = useState("overview");
  const [gpaData, setGpaData] = useState(initialGpaData);
  const [childSubjectPerformance, setChildSubjectPerformance] = useState(initialChildSubjectPerformance);
  const [feeStatus, setFeeStatus] = useState(initialFeeStatus);
  const [recentAnnouncements, setRecentAnnouncements] = useState(initialRecentAnnouncements);
  const [metrics, setMetrics] = useState({ gpa: 3.85, attendance: 92.5, pendingApprovals: 1 });

  useEffect(() => {
    const loadParentData = async () => {
      try {
        const [attendanceRes, marksRes, paymentsRes, noticesRes, leavesRes] = await Promise.all([
          fetch("/api/attendance", { credentials: "include" }),
          fetch("/api/marks", { credentials: "include" }),
          fetch("/api/payments", { credentials: "include" }),
          fetch("/api/notices", { credentials: "include" }),
          fetch("/api/leaves", { credentials: "include" }),
        ]);

        const attendance = attendanceRes.ok ? await attendanceRes.json() : null;
        const marks = marksRes.ok ? await marksRes.json() : null;
        const payments = paymentsRes.ok ? await paymentsRes.json() : null;
        const notices = noticesRes.ok ? await noticesRes.json() : null;
        const leaves = leavesRes.ok ? await leavesRes.json() : null;

        const averageMarks = Number(marks?.summary?.averageMarks ?? 0);
        const gpa = Number((Math.min(4, averageMarks / 25) || 0).toFixed(2));
        const attendanceRate = Number(attendance?.summary?.attendanceRate ?? 0);
        const pendingApprovals = Array.isArray(leaves?.leaves)
          ? leaves.leaves.filter((leave: any) => String(leave.status) === "pending").length
          : 0;

        setMetrics({ gpa, attendance: attendanceRate, pendingApprovals });

        setGpaData([
          { semester: "Sem 1", gpa: Number((Math.max(2.5, gpa - 0.6)).toFixed(2)) },
          { semester: "Sem 2", gpa: Number((Math.max(2.8, gpa - 0.35)).toFixed(2)) },
          { semester: "Sem 3", gpa: Number((Math.max(3.0, gpa - 0.15)).toFixed(2)) },
          { semester: "Sem 4", gpa },
        ]);

        const marksBySubject: Record<string, { total: number; count: number }> =
          Array.isArray(marks?.records)
          ? marks.records.reduce((acc: Record<string, { total: number; count: number }>, record: any) => {
              const scorePct = record.maxScore > 0 ? (Number(record.score) / Number(record.maxScore)) * 100 : 0;
              const subject = String(record.subject || "Subject");
              acc[subject] = acc[subject] || { total: 0, count: 0 };
              acc[subject].total += scorePct;
              acc[subject].count += 1;
              return acc;
            }, {})
          : {};

        const subjectRows = Object.entries(marksBySubject).map(([subject, value]) => {
          const avg = Number((value.total / value.count).toFixed(0));
          return {
            subject,
            marks: avg,
            grade: avg >= 85 ? "A" : avg >= 75 ? "B+" : avg >= 65 ? "B" : "C",
            attendance: Number(attendanceRate.toFixed(0)),
          };
        });

        if (subjectRows.length > 0) {
          setChildSubjectPerformance(subjectRows.slice(0, 5));
        }

        const totalDue = Number(payments?.summary?.totalDue ?? 0);
        const totalPaid = Number(payments?.summary?.totalPaid ?? 0);
        const totalFee = totalDue + totalPaid;
        setFeeStatus({
          semester: "Current Semester",
          totalFee: totalFee || initialFeeStatus.totalFee,
          paid: totalPaid,
          due: totalDue,
          dueDate: Array.isArray(payments?.payments) && payments.payments[0]?.dueDate ? String(payments.payments[0].dueDate) : initialFeeStatus.dueDate,
        });

        const noticeRows = Array.isArray(notices?.notices)
          ? notices.notices.slice(0, 3).map((notice: any, index: number) => ({
              id: index + 1,
              title: String(notice.title || "Notice"),
              date: String(notice.publishedDate || ""),
              important: String(notice.priority || "") === "high",
            }))
          : [];

        if (noticeRows.length > 0) {
          setRecentAnnouncements(noticeRows);
        }
      } catch {
        return;
      }
    };

    void loadParentData();
  }, [user?.id]);

  const paidPercentage = feeStatus.totalFee > 0 ? (feeStatus.paid / feeStatus.totalFee) * 100 : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            GPA: <span className="font-bold text-emerald-600">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={parentSidebarItems} activeItem="overview" />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Parent Portal" />
          
          <main className="flex-1 overflow-auto">
            <div className="p-6 space-y-5">
              {/* Welcome Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.name?.split(' ')[0] || 'Parent'}!
                </h2>
                <p className="text-gray-500 text-sm">
                  Monitor your child's academic progress and stay connected
                </p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <MetricCard
                  label="Child's GPA"
                  value={metrics.gpa.toFixed(2)}
                  variant="primary"
                  size="sm"
                  icon={GraduationCap}
                />
                <MetricCard
                  label="Attendance"
                  value={`${metrics.attendance.toFixed(1)}%`}
                  variant="success"
                  size="sm"
                  icon={UserCheck}
                />
                <MetricCard
                  label="Fee Status"
                  value={`${feeStatus.paid.toLocaleString()} LKR`}
                  variant="warning"
                  size="sm"
                  icon={Heart}
                />
                <MetricCard
                  label="Pending Approvals"
                  value={metrics.pendingApprovals.toString()}
                  variant="default"
                  size="sm"
                  icon={ClockIcon}
                />
              </div>

              {/* GPA Chart + Fee Status Row */}
              <div className="grid grid-cols-3 gap-5">
                {/* GPA Chart */}
                <Card className="col-span-2 border-0 shadow-sm overflow-hidden">
                  <div className="bg-linear-to-r from-emerald-600 to-teal-600 px-5 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-sm">
                          Academic Performance Tracker
                        </h3>
                        <p className="text-emerald-100 text-xs mt-0.5">
                          Child's GPA progression
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4 text-emerald-100" />
                        <span className="text-xs text-emerald-100">Current: {metrics.gpa.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="pt-4 pb-2">
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={gpaData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="semester" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 11 }} />
                          <YAxis domain={[2.5, 4.1]} stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 11 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <ReferenceLine y={3.0} stroke="#f59e0b" strokeDasharray="5 5" />
                          <ReferenceLine y={3.5} stroke="#10b981" strokeDasharray="5 5" />
                          <Area type="monotone" dataKey="gpa" stroke="none" fill="url(#colorGpaParent)" fillOpacity={0.1} />
                          <Line
                            type="monotone"
                            dataKey="gpa"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ fill: "#10b981", r: 5, stroke: "#fff", strokeWidth: 2 }}
                            activeDot={{ r: 7 }}
                          />
                          <defs>
                            <linearGradient id="colorGpaParent" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Fee Status Card */}
                <Card className="border-0 shadow-sm">
                  <div className="bg-linear-to-r from-amber-50 to-orange-50 px-5 py-3 border-b border-amber-100">
                    <h3 className="font-semibold text-gray-900 text-sm">Fee Status</h3>
                    <p className="text-gray-500 text-xs mt-0.5">{feeStatus.semester}</p>
                  </div>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Total Fee</span>
                      <span className="text-sm font-bold text-gray-900">{feeStatus.totalFee.toLocaleString()} LKR</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Paid</span>
                      <span className="text-sm font-bold text-green-600">{feeStatus.paid.toLocaleString()} LKR</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Due</span>
                      <span className="text-sm font-bold text-red-600">{feeStatus.due.toLocaleString()} LKR</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Payment Progress</span>
                        <span className="text-xs font-medium text-emerald-600">{paidPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-emerald-500 to-teal-500 rounded-full"
                          style={{ width: `${paidPercentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-gray-500">
                        Due Date: <span className="font-medium text-gray-700">{feeStatus.dueDate}</span>
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2 gap-2">
                      Pay Now
                      <Send className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Subject Performance + Notices Row */}
              <div className="grid grid-cols-3 gap-5">
                {/* Subject Performance */}
                <Card className="col-span-2 border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">Subject-wise Performance</CardTitle>
                      <Button variant="ghost" size="sm" className="text-xs gap-1">
                        <Eye className="h-3 w-3" />
                        Full Report
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Subject</th>
                            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Marks</th>
                            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Grade</th>
                            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Attendance</th>
                           </tr>
                        </thead>
                        <tbody>
                          {childSubjectPerformance.map((subject, idx) => (
                            <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                              <td className="py-2 px-3 text-sm font-medium text-gray-900">{subject.subject}</td>
                              <td className="py-2 px-3 text-sm text-gray-700">{subject.marks}%</td>
                              <td className="py-2 px-3">
                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                                  subject.grade === 'A' || subject.grade === 'A-' 
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {subject.grade}
                                </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${
                                    subject.attendance >= 90 ? 'text-green-600' : subject.attendance >= 75 ? 'text-blue-600' : 'text-yellow-600'
                                  }`}>
                                    {subject.attendance}%
                                  </span>
                                  <div className="flex-1 max-w-16">
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          subject.attendance >= 90 ? 'bg-green-500' : subject.attendance >= 75 ? 'bg-blue-500' : 'bg-yellow-500'
                                        }`}
                                        style={{ width: `${subject.attendance}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Notices & Announcements */}
                <div className="space-y-5">
                  <NoticeBoard targetAudience="Parents" maxNotices={3} />
                  
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold">Announcements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {recentAnnouncements.map((announcement) => (
                          <div key={announcement.id} className="p-2 border-l-2 border-emerald-500 bg-emerald-50/30 rounded-r-lg">
                            <p className="text-sm font-medium text-gray-900">{announcement.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{announcement.date}</p>
                            {announcement.important && (
                              <span className="inline-flex items-center gap-1 text-xs text-red-600 mt-1">
                                <AlertCircle className="h-3 w-3" />
                                Important
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
        <ChatAssistantV2 />
      </div>
    </div>
  );
}