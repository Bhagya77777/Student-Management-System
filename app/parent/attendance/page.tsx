"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { parentSidebarItems } from "@/components/sidebar/parentSidebarItems";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isSameDay, parseISO } from "date-fns";
import { BookOpen, CheckCircle, Download, Loader2, TrendingUp, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type AttendanceRecord = {
  id: string;
  date: string;
  present: boolean;
  studentName: string;
  studentCode: string;
};

export default function ParentAttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewType, setViewType] = useState<"overview" | "schedule">("overview");
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      const response = await fetch("/api/attendance", { credentials: "include" });
      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = (await response.json()) as { history?: AttendanceRecord[] };
      setRecords(data.history ?? []);
      setLoading(false);
    };

    void loadAttendance();
  }, []);

  const chartData = useMemo(
    () =>
      records
        .slice()
        .sort((left, right) => left.date.localeCompare(right.date))
        .map((record) => ({
          day: format(parseISO(record.date), "MMM d"),
          attendance: record.present ? 100 : 0,
        }))
        .slice(-8),
    [records]
  );

  const attendanceRate = records.length > 0 ? Math.round((records.filter((record) => record.present).length / records.length) * 100) : 0;
  const selectedRecord = selectedDate ? records.find((record) => record.date === format(selectedDate, "yyyy-MM-dd")) : undefined;
  const totalClasses = records.length;
  const presentClasses = records.filter((record) => record.present).length;
  const requiredToReach90 = Math.max(0, Math.round((90 - attendanceRate) / 5));
  const attendanceLabel = attendanceRate >= 90 ? "Excellent" : attendanceRate >= 80 ? "Good" : "Needs Attention";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={parentSidebarItems} activeItem="attendance" />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Child's Attendance" />

          <main className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Attendance Overview</h2>
                <p className="text-gray-500 text-sm mt-1">Track your child's class attendance and weekly schedule</p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Overall Attendance</p>
                        <p className="text-2xl font-bold text-emerald-600">{attendanceRate}%</p>
                        <p className="text-xs text-green-600 mt-1">↑ 2% from last month</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Classes Conducted</p>
                        <p className="text-2xl font-bold text-blue-600">{totalClasses}</p>
                        <p className="text-xs text-gray-500 mt-1">Present: {presentClasses}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Required to Reach 90%</p>
                        <p className="text-2xl font-bold text-orange-600">{requiredToReach90}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Attendance Rate</p>
                        <p className="text-2xl font-bold text-purple-600">{attendanceLabel}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs value={viewType} onValueChange={(value) => setViewType(value as "overview" | "schedule")} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">Weekly Attendance Trend</CardTitle>
                        <Button variant="outline" size="sm" className="gap-1"><Download className="h-3 w-3" /> Export</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        {loading ? (
                          <div className="flex h-full items-center justify-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading attendance</div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="day" stroke="#6b7280" />
                              <YAxis domain={[0, 100]} stroke="#6b7280" />
                              <Tooltip formatter={(value) => `${value}%`} />
                              <Line type="monotone" dataKey="attendance" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Attendance History</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {records.map((record) => (
                          <div key={record.id} className="p-3 rounded-lg border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-gray-400" />
                                <span className="font-medium text-gray-900">{record.studentName}</span>
                                <Badge variant="outline" className="text-xs">{record.studentCode}</Badge>
                              </div>
                              <span className={`text-sm font-bold ${record.present ? "text-green-600" : "text-red-600"}`}>
                                {record.present ? "Present" : "Absent"}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                              <span>Date: {record.date}</span>
                              <span>Status: {record.present ? "Attended" : "Missed"}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${record.present ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: record.present ? "100%" : "0%" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="schedule" className="mt-6 space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                    <Card className="col-span-1 border-0 shadow-sm h-fit">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Calendar</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-lg" />
                      </CardContent>
                    </Card>

                    <Card className="col-span-2 border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Selected Attendance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedRecord ? (
                          <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{selectedRecord.studentName}</p>
                              <p className="text-xs text-gray-500">{selectedRecord.studentCode}</p>
                            </div>
                            <Badge className={selectedRecord.present ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                              {selectedRecord.present ? <CheckCircle className="mr-1 h-3 w-3" /> : <AlertCircle className="mr-1 h-3 w-3" />}
                              {selectedRecord.present ? "Present" : "Absent"}
                            </Badge>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">Pick a date to inspect the latest record.</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
