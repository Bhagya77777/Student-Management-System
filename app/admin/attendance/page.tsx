"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { adminSidebarItems } from "@/components/sidebar/adminSidebarItems";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Users, CheckCircle, XCircle, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type StudentOption = { label: string; value: string; code: string };

type AttendanceRecord = {
  id: string;
  date: string;
  present: boolean;
  studentName: string;
  studentCode: string;
  batch?: string;
  department?: string | null;
};

export default function AdminAttendancePage() {
  const [showDialog, setShowDialog] = useState(false);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [manualPresent, setManualPresent] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchResults, setSearchResults] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  // Fetch all students for dropdown (could be optimized with API pagination in real app)
  useEffect(() => {
    async function fetchStudents() {
      const res = await fetch("/api/users?role=student");
      if (!res.ok) return;
      const data = await res.json();
      setStudents(
        (data.users || []).map((u: any) => ({
          label: u.name + (u.studentId ? ` (${u.studentId})` : ""),
          value: u.studentId || u.id,
          code: u.studentId || u.id,
        }))
      );
    }
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!studentSearch) {
      setSearchResults(students.slice(0, 10));
    } else {
      setSearchResults(
        students.filter((s) =>
          s.label.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.code.toLowerCase().includes(studentSearch.toLowerCase())
        ).slice(0, 10)
      );
    }
  }, [studentSearch, students]);

  // Load attendance records
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

  async function handleManualAttendance(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    setSaving(true);
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: manualDate,
        records: [{ studentCode: selectedStudent.code, present: manualPresent }],
      }),
    });
    setSaving(false);
    if (res.ok) {
      setShowDialog(false);
      setSelectedStudent(null);
      setStudentSearch("");
      setManualPresent(true);
      setManualDate(new Date().toISOString().split("T")[0]);
      // Reload attendance
      const response = await fetch("/api/attendance", { credentials: "include" });
      const data = (await response.json()) as { history?: AttendanceRecord[] };
      setRecords(data.history ?? []);
    }
  }

  const presentCount = records.filter((record) => record.present).length;
  const absentCount = records.length - presentCount;
  const attendanceRate = records.length > 0 ? Number(((presentCount / records.length) * 100).toFixed(1)) : 0;

  const chartData = useMemo(() => {
    const byBatch = new Map<string, { present: number; total: number }>();
    for (const record of records) {
      const key = record.batch ?? record.department ?? "General";
      const entry = byBatch.get(key) ?? { present: 0, total: 0 };
      entry.total += 1;
      entry.present += record.present ? 1 : 0;
      byBatch.set(key, entry);
    }

    return Array.from(byBatch.entries()).map(([name, value]) => ({
      name,
      rate: value.total > 0 ? Number(((value.present / value.total) * 100).toFixed(1)) : 0,
    }));
  }, [records]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={adminSidebarItems} activeItem="attendance" />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Attendance Management" />

          <main className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Attendance Overview</h2>
                  <p className="text-gray-500 text-sm mt-1">Monitor and manage student attendance across all departments</p>
                </div>
                <Button onClick={() => setShowDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white">+ Add Attendance</Button>
              </div>

              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                  <form onSubmit={handleManualAttendance} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Student</label>
                      <Input
                        placeholder="Search student by name or ID"
                        value={studentSearch}
                        onChange={(e) => {
                          setStudentSearch(e.target.value);
                          setSelectedStudent(null);
                        }}
                        autoFocus
                      />
                      {studentSearch && (
                        <div className="border rounded bg-white shadow mt-1 max-h-40 overflow-y-auto z-50 relative">
                          {searchResults.length === 0 && <div className="p-2 text-gray-400">No students found</div>}
                          {searchResults.map((s) => (
                            <div
                              key={s.value}
                              className={`p-2 cursor-pointer hover:bg-blue-50 ${selectedStudent?.value === s.value ? "bg-blue-100" : ""}`}
                              onClick={() => {
                                setSelectedStudent(s);
                                setStudentSearch(s.label);
                              }}
                            >
                              {s.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <Input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} max={new Date().toISOString().split("T")[0]} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <div className="flex gap-2 mt-1">
                        <Button type="button" variant={manualPresent ? "default" : "outline"} onClick={() => setManualPresent(true)}>Present</Button>
                        <Button type="button" variant={!manualPresent ? "default" : "outline"} onClick={() => setManualPresent(false)}>Absent</Button>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                      <Button type="submit" disabled={!selectedStudent || saving} className="bg-blue-600 text-white">{saving ? "Saving..." : "Save Attendance"}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="grid grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500">Records</p>
                    <p className="text-2xl font-bold text-gray-900">{records.length}</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500">Present</p>
                    <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500">Absent</p>
                    <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500">Attendance Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{attendanceRate}%</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Attendance by Group</CardTitle>
                    <Button variant="outline" size="sm" className="gap-1"><Download className="h-3 w-3" /> Export</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    {loading ? (
                      <div className="flex h-full items-center justify-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading attendance</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" stroke="#6b7280" />
                          <YAxis domain={[0, 100]} stroke="#6b7280" />
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Bar dataKey="rate" fill="#2563eb" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Recent Records</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {records.map((record) => (
                      <div key={record.id} className="rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900">{record.studentName}</p>
                            <Badge className="bg-blue-100 text-blue-700">{record.studentCode}</Badge>
                          </div>
                          <p className="text-xs text-gray-500">{record.date}</p>
                        </div>
                        <Badge className={record.present ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {record.present ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                          {record.present ? "Present" : "Absent"}
                        </Badge>
                      </div>
                    ))}
                    {records.length === 0 && <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">No attendance records found.</div>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}