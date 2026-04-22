"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { studentSidebarItems } from "@/components/sidebar/studentSidebarItems";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from "date-fns";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type AttendanceRecord = {
  id: string;
  date: string;
  present: boolean;
  studentName: string;
  studentCode: string;
};

type AttendanceResponse = {
  history: AttendanceRecord[];
  summary: {
    total: number;
    present: number;
    absent: number;
    attendanceRate: number;
  };
};

function groupByWeek(records: AttendanceRecord[]) {
  return records
    .slice()
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((record) => ({
      date: format(parseISO(record.date), "MMM d"),
      attendance: record.present ? 100 : 0,
    }))
    .slice(-8);
}

export default function StudentAttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceResponse["summary"]>({
    total: 0,
    present: 0,
    absent: 0,
    attendanceRate: 0,
  });

  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      const response = await fetch("/api/attendance", { credentials: "include" });
      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = (await response.json()) as AttendanceResponse | { history?: AttendanceRecord[]; summary?: AttendanceResponse["summary"] };
      setRecords("history" in data ? data.history ?? [] : []);
      setSummary("summary" in data ? data.summary ?? { total: 0, present: 0, absent: 0, attendanceRate: 0 } : { total: 0, present: 0, absent: 0, attendanceRate: 0 });
      setLoading(false);
    };

    void loadAttendance();
  }, []);

  const chartData = useMemo(() => groupByWeek(records), [records]);
  const selectedDayRecord = selectedDate
    ? records.find((record) => record.date === format(selectedDate, "yyyy-MM-dd"))
    : undefined;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={studentSidebarItems} activeItem="attendance" />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Attendance" />

          <main className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Attendance Overview</h2>
                <p className="text-gray-500 text-sm mt-1">Your attendance history is loaded from the database.</p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500">Attendance Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{summary.attendanceRate}%</p>
                    <p className="text-xs text-green-600 mt-1">From {summary.total} records</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500">Present Days</p>
                    <p className="text-2xl font-bold text-green-600">{summary.present}</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500">Absent Days</p>
                    <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500">Latest Status</p>
                    <p className="text-2xl font-bold text-gray-900">{records[0] ? (records[0].present ? "Present" : "Absent") : "N/A"}</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="chart" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="chart">Trend</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>

                <TabsContent value="chart" className="mt-6">
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">Recent Attendance Trend</CardTitle>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Download className="h-3 w-3" />
                          Export
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        {loading ? (
                          <div className="flex h-full items-center justify-center text-sm text-gray-500 gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading attendance
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="date" stroke="#6b7280" />
                              <YAxis domain={[0, 100]} stroke="#6b7280" />
                              <Tooltip formatter={(value) => `${value}%`} />
                              <Line type="monotone" dataKey="attendance" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="calendar" className="mt-6 grid grid-cols-3 gap-6">
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
                      <CardTitle className="text-base font-semibold">
                        {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedDayRecord ? (
                        <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{selectedDayRecord.studentName}</p>
                            <p className="text-xs text-gray-500">{selectedDayRecord.studentCode}</p>
                          </div>
                          <Badge className={selectedDayRecord.present ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                            {selectedDayRecord.present ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                            {selectedDayRecord.present ? "Present" : "Absent"}
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          No attendance record for the selected day.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
