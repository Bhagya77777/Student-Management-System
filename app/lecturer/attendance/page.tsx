"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { lecturerSidebarItems } from "@/components/sidebar/lecturerSidebarItems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, Save, Search, CheckCircle, XCircle, UserCheck, UserX, Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { format } from "date-fns";

type Student = {
  id: string;
  name: string;
  email: string;
  studentProfile?: {
    studentCode: string;
    batch: string;
    department: string | null;
  } | null;
};

type AttendanceRecord = {
  id: string;
  date: string;
  present: boolean;
  studentName: string;
  studentCode: string;
};

type CourseGroup = {
  id: string;
  name: string;
  code: string;
  students: number;
};

export default function LecturerAttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attendanceByCode, setAttendanceByCode] = useState<Record<string, boolean>>({});
  const [attendanceTimeByCode, setAttendanceTimeByCode] = useState<Record<string, string>>({});

  const dateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [studentsResponse, attendanceResponse] = await Promise.all([
        fetch("/api/users?role=student", { credentials: "include" }),
        fetch(`/api/attendance?date=${dateKey}`, { credentials: "include" }),
      ]);

      if (studentsResponse.ok) {
        const data = (await studentsResponse.json()) as { users?: Student[] };
        setStudents(data.users ?? []);
      }

      if (attendanceResponse.ok) {
        const data = (await attendanceResponse.json()) as { records?: AttendanceRecord[] };
        const nextState: Record<string, boolean> = {};
        const nextTimes: Record<string, string> = {};
        for (const record of data.records ?? []) {
          nextState[record.studentCode] = record.present;
          nextTimes[record.studentCode] = record.present ? format(new Date(), "hh:mm a") : "-";
        }
        setAttendanceByCode(nextState);
        setAttendanceTimeByCode(nextTimes);
      }

      setLoading(false);
    };

    void loadData();
  }, [dateKey]);

  const roster = useMemo(
    () => students.filter((student) => student.name.toLowerCase().includes(searchTerm.toLowerCase()) || (student.studentProfile?.studentCode ?? "").toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm, students]
  );

  const courses = useMemo<CourseGroup[]>(() => {
    const groups = new Map<string, CourseGroup>();
    for (const student of students) {
      const department = student.studentProfile?.department ?? "General Studies";
      const code = (student.studentProfile?.batch ? `BATCH-${student.studentProfile.batch}` : "GEN-001");
      const current = groups.get(department) ?? { id: department, name: department, code, students: 0 };
      current.students += 1;
      groups.set(department, current);
    }
    return Array.from(groups.values());
  }, [students]);

  useEffect(() => {
    if (!selectedCourseId && courses[0]) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0] ?? null;

  const courseRoster = useMemo(() => {
    if (!selectedCourse) return roster;
    return roster.filter((student) => (student.studentProfile?.department ?? "General Studies") === selectedCourse.name);
  }, [roster, selectedCourse]);

  const presentCount = courseRoster.filter((student) => attendanceByCode[student.studentProfile?.studentCode ?? ""] ?? true).length;
  const absentCount = courseRoster.length - presentCount;
  const attendanceRate = courseRoster.length > 0 ? (presentCount / courseRoster.length) * 100 : 0;

  const toggleAttendance = (studentCode: string) => {
    setAttendanceByCode((current) => ({
      ...current,
      [studentCode]: !(current[studentCode] ?? true),
    }));
    setAttendanceTimeByCode((current) => ({
      ...current,
      [studentCode]: !(attendanceByCode[studentCode] ?? true) ? "-" : format(new Date(), "hh:mm a"),
    }));
  };

  const saveAttendance = async () => {
    setSaving(true);
    await fetch("/api/attendance", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: dateKey,
        records: courseRoster
          .filter((student) => student.studentProfile?.studentCode)
          .map((student) => ({
            studentCode: student.studentProfile?.studentCode,
            present: attendanceByCode[student.studentProfile?.studentCode ?? ""] ?? true,
          })),
      }),
    });
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-purple-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={lecturerSidebarItems} activeItem="attendance" />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Attendance Management" />

          <main className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Take Attendance</h2>
                <p className="text-gray-500 text-sm mt-1">Mark student attendance for your courses</p>
              </div>

              <div className="flex gap-3 flex-wrap">
                {courses.map((course) => (
                  <Button
                    key={course.id}
                    variant={selectedCourse?.id === course.id ? "default" : "outline"}
                    onClick={() => setSelectedCourseId(course.id)}
                    className={selectedCourse?.id === course.id ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    {course.name} ({course.code})
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm"><CardContent className="p-3"><p className="text-xs text-gray-500">Total Students</p><p className="text-xl font-bold text-gray-900">{courseRoster.length}</p></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-3"><p className="text-xs text-gray-500">Present</p><p className="text-xl font-bold text-green-600">{presentCount}</p></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-3"><p className="text-xs text-gray-500">Absent</p><p className="text-xl font-bold text-red-600">{absentCount}</p></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-3"><p className="text-xs text-gray-500">Attendance Rate</p><p className="text-xl font-bold text-purple-600">{attendanceRate.toFixed(1)}%</p></CardContent></Card>
              </div>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <CardTitle className="text-base font-semibold">Roster</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Search student..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="pl-9 w-64" />
                      </div>
                      <Button variant="outline" size="sm" className="gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        {format(selectedDate || new Date(), "MMM d")}
                      </Button>
                      {!saving ? (
                        <Button onClick={() => void saveAttendance()} className="bg-purple-600 hover:bg-purple-700 gap-1">
                          <RefreshCw className="h-4 w-4" />
                          Mark Attendance
                        </Button>
                      ) : (
                        <Button onClick={() => void saveAttendance()} disabled className="bg-green-600 hover:bg-green-700 gap-1">
                          <Save className="h-4 w-4" />
                          Save
                        </Button>
                      )}
                      <Button onClick={() => setSelectedDate(new Date())} variant="outline" size="sm" className="gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        Today
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-3 bg-blue-50 rounded-lg"><p className="text-xs text-gray-500">Total Students</p><p className="text-2xl font-bold text-blue-600">{courseRoster.length}</p></div>
                    <div className="p-3 bg-green-50 rounded-lg"><p className="text-xs text-gray-500">Present</p><p className="text-2xl font-bold text-green-600">{presentCount}</p></div>
                    <div className="p-3 bg-red-50 rounded-lg"><p className="text-xs text-gray-500">Absent</p><p className="text-2xl font-bold text-red-600">{absentCount}</p></div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Attendance Rate</span>
                      <span className="text-sm font-semibold text-purple-600">{attendanceRate.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${attendanceRate}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <Card className="col-span-1 border-0 shadow-sm h-fit">
                      <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Calendar</CardTitle></CardHeader>
                      <CardContent>
                        <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-lg" />
                      </CardContent>
                    </Card>

                    <div className="col-span-2">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">Student</th>
                              <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">Student ID</th>
                              <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">Status</th>
                              <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">Time</th>
                              <th className="text-center py-3 px-3 text-xs font-semibold text-gray-600">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loading ? (
                              <tr><td colSpan={5} className="py-6 text-center text-sm text-gray-500"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading roster</td></tr>
                            ) : (
                              courseRoster.map((student) => {
                                const studentCode = student.studentProfile?.studentCode ?? student.id;
                                const present = attendanceByCode[studentCode] ?? true;
                                return (
                                  <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="py-3 px-3 text-sm font-medium text-gray-900">{student.name}</td>
                                    <td className="py-3 px-3 text-sm text-gray-600">{studentCode}</td>
                                    <td className="py-3 px-3">
                                      <Badge className={present ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                        {present ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
                                        {present ? "Present" : "Absent"}
                                      </Badge>
                                    </td>
                                    <td className="py-3 px-3 text-sm text-gray-500">{attendanceTimeByCode[studentCode] ?? (present ? "09:00 AM" : "-")}</td>
                                    <td className="py-3 px-3 text-center">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleAttendance(studentCode)}
                                        className={present ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                                      >
                                        {present ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                      {!loading && courseRoster.length === 0 && <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-500 mt-3">No students found.</div>}
                    </div>
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
