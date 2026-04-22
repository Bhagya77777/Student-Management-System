"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { lecturerSidebarItems } from "@/components/sidebar/lecturerSidebarItems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Save,
  Search,
  Edit,
  Download,
  Upload,
  TrendingUp,
  AlertCircle,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Student = {
  id: string;
  name: string;
  studentId?: string;
  studentProfile?: { studentCode: string } | null;
};

type MarkRecord = {
  id: string;
  subject: string;
  assessment: string;
  score: number;
  maxScore: number;
  examDate: string;
  studentName: string;
  studentCode: string;
};

type Course = {
  id: number | string;
  name: string;
  code?: string;
  assessments?: string[];
};

function resolveStudentCode(student: Student): string {
  return (
    student.studentId ||
    student.studentProfile?.studentCode ||
    ""
  ).trim();
}

const ITEMS_PER_PAGE = 10;

export default function LecturerMarksPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState("Mid-term");
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<MarkRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMarks, setEditingMarks] = useState<Record<string, number>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [crudSaving, setCrudSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crudStudentSearch, setCrudStudentSearch] = useState("");
  const [crudSubjectSearch, setCrudSubjectSearch] = useState("");
  const [recordStudentSearch, setRecordStudentSearch] = useState("");
  const [recordSubjectSearch, setRecordSubjectSearch] = useState("");

  // Pagination states
  const [rosterCurrentPage, setRosterCurrentPage] = useState(1);
  const [recordsCurrentPage, setRecordsCurrentPage] = useState(1);

  // Dropdown open states
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

  const [crudForm, setCrudForm] = useState({
    id: "",
    studentCode: "",
    subject: "",
    assessment: "Mid-term",
    score: "0",
    maxScore: "100",
    examDate: new Date().toISOString().split("T")[0],
  });

  const syncMarksForCourse = async (courseName: string) => {
    const marksResponse = await fetch(
      `/api/marks?subject=${encodeURIComponent(courseName)}`,
      { credentials: "include" },
    );
    if (!marksResponse.ok) {
      return;
    }

    const data = (await marksResponse.json()) as { records?: MarkRecord[] };
    setRecords(
      (data.records ?? []).filter((record) => record.subject === courseName),
    );
  };

  // Fetch lecturer's courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/marks", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          const subjects = Array.from(
            new Set(
              (data.records || [])
                .map((record: { subject?: string }) => record.subject)
                .filter(Boolean),
            ),
          ) as string[];
          const courseList: Course[] = subjects.map((subject, index) => ({
            id: index + 1,
            name: subject,
            assessments: ["Mid-term", "Final", "Assignment 1", "Quiz"],
          }));
          setCourses(courseList);
          setSelectedCourse(courseList[0] || null);
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Failed to load courses");
        setCourses([]);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const loadMarks = async () => {
      if (!selectedCourse) return;

      setLoading(true);
      try {
        const [studentsResponse] = await Promise.all([
          fetch("/api/users?role=student", { credentials: "include" }),
        ]);

        if (studentsResponse.ok) {
          const data = (await studentsResponse.json()) as { users?: Student[] };
          setStudents(data.users ?? []);
        }

        await syncMarksForCourse(selectedCourse.name);
        setError(null);
      } catch (err) {
        console.error("Failed to load marks:", err);
        setError("Failed to load marks data");
      } finally {
        setLoading(false);
      }
    };

    void loadMarks();
  }, [selectedCourse?.name]);

  const roster = useMemo(
    () =>
      students.filter((student) => {
        const code = resolveStudentCode(student);
        if (!code) {
          return false;
        }

        const query = searchTerm.toLowerCase();
        return (
          student.name.toLowerCase().includes(query) ||
          code.toLowerCase().includes(query)
        );
      }),
    [searchTerm, students],
  );

  // Paginated roster
  const paginatedRoster = useMemo(() => {
    const start = (rosterCurrentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return roster.slice(start, end);
  }, [roster, rosterCurrentPage]);

  const totalRosterPages = Math.ceil(roster.length / ITEMS_PER_PAGE);

  const markMap = useMemo(() => {
    const map = new Map<string, MarkRecord>();
    for (const record of records) {
      if (record.assessment === selectedAssessment) {
        map.set(record.studentCode, record);
      }
    }
    return map;
  }, [records, selectedAssessment]);

  const handleSaveMarks = async () => {
    if (!selectedCourse) {
      return;
    }

    const course = selectedCourse;

    setSaving(true);
    const response = await fetch("/api/marks", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: course.name,
        assessment: selectedAssessment,
        records: roster
          .filter((student) => Boolean(resolveStudentCode(student)))
          .map((student) => ({
            studentCode: resolveStudentCode(student),
            subject: course.name,
            assessment: selectedAssessment,
            score:
              editingMarks[resolveStudentCode(student)] ??
              markMap.get(resolveStudentCode(student))?.score ??
              0,
            maxScore: 100,
          })),
      }),
    });
    if (response.ok) {
      await syncMarksForCourse(course.name);
      setEditingMarks({});
      setIsEditing(false);
    }
    setSaving(false);
  };

  const sortedRecords = useMemo(
    () =>
      [...records]
        .filter(
          (record) =>
            record.studentName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            record.studentCode.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .sort((a, b) =>
          `${b.examDate}-${b.assessment}`.localeCompare(
            `${a.examDate}-${a.assessment}`,
          ),
        ),
    [records, searchTerm],
  );

  const availableSubjects = useMemo(() => {
    const values = new Set<string>();
    for (const course of courses) {
      if (course.name) values.add(course.name);
    }
    for (const record of records) {
      if (record.subject) values.add(record.subject);
    }
    if (selectedCourse?.name) values.add(selectedCourse.name);
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [courses, records, selectedCourse?.name]);

  const filteredCrudStudents = useMemo(() => {
    const query = crudStudentSearch.trim().toLowerCase();
    return students.filter((student) => {
      const code = resolveStudentCode(student);
      if (!query) return Boolean(code);
      return (
        student.name.toLowerCase().includes(query) ||
        code.toLowerCase().includes(query)
      );
    });
  }, [students, crudStudentSearch]);

  const filteredCrudRecords = useMemo(() => {
    const studentQuery = recordStudentSearch.trim().toLowerCase();
    const subjectQuery = recordSubjectSearch.trim().toLowerCase();

    return sortedRecords.filter((record) => {
      const studentMatch =
        !studentQuery ||
        record.studentName.toLowerCase().includes(studentQuery) ||
        record.studentCode.toLowerCase().includes(studentQuery);
      const subjectMatch =
        !subjectQuery || record.subject.toLowerCase().includes(subjectQuery);
      return studentMatch && subjectMatch;
    });
  }, [sortedRecords, recordStudentSearch, recordSubjectSearch]);

  // Paginated records
  const paginatedRecords = useMemo(() => {
    const start = (recordsCurrentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredCrudRecords.slice(start, end);
  }, [filteredCrudRecords, recordsCurrentPage]);

  const totalRecordsPages = Math.ceil(
    filteredCrudRecords.length / ITEMS_PER_PAGE,
  );

  useEffect(() => {
    if (!selectedCourse?.name) {
      return;
    }

    setCrudForm((current) => ({
      ...current,
      subject: current.id ? current.subject : selectedCourse.name,
    }));
    setCrudSubjectSearch((current) =>
      current.trim().length > 0 ? current : selectedCourse.name,
    );
  }, [selectedCourse?.name]);

  const startEditRecord = (record: MarkRecord) => {
    setCrudForm({
      id: record.id,
      studentCode: record.studentCode,
      subject: record.subject,
      assessment: record.assessment,
      score: String(record.score),
      maxScore: String(record.maxScore),
      examDate: record.examDate,
    });
    setCrudStudentSearch(`${record.studentName} (${record.studentCode})`);
  };

  const resetCrudForm = () => {
    setCrudForm({
      id: "",
      studentCode: "",
      subject: selectedCourse?.name || "",
      assessment: "Mid-term",
      score: "0",
      maxScore: "100",
      examDate: new Date().toISOString().split("T")[0],
    });
    setCrudStudentSearch("");
    setCrudSubjectSearch(selectedCourse?.name || "");
  };

  const handleCreateRecord = async () => {
    if (!crudForm.studentCode || !crudForm.subject || !crudForm.assessment) {
      setError("Student, subject, and assessment are required for new marks.");
      return;
    }

    setCrudSaving(true);
    const response = await fetch("/api/marks", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        record: {
          studentCode: crudForm.studentCode,
          subject: crudForm.subject,
          assessment: crudForm.assessment,
          score: Number(crudForm.score),
          maxScore: Number(crudForm.maxScore),
        },
        examDate: crudForm.examDate,
      }),
    });

    if (response.ok && selectedCourse) {
      await syncMarksForCourse(selectedCourse.name);
      resetCrudForm();
      setError(null);
    } else {
      setError("Failed to create mark record");
    }
    setCrudSaving(false);
  };

  const handleUpdateRecord = async () => {
    if (!crudForm.id) {
      return;
    }

    setCrudSaving(true);
    const response = await fetch(`/api/marks/${crudForm.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: crudForm.subject,
        assessment: crudForm.assessment,
        score: Number(crudForm.score),
        maxScore: Number(crudForm.maxScore),
        examDate: crudForm.examDate,
      }),
    });

    if (response.ok && selectedCourse) {
      await syncMarksForCourse(selectedCourse.name);
      resetCrudForm();
      setError(null);
    } else {
      setError("Failed to update mark record");
    }
    setCrudSaving(false);
  };

  const handleDeleteRecord = async (recordId: string) => {
    setCrudSaving(true);
    const response = await fetch(`/api/marks/${recordId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok && selectedCourse) {
      await syncMarksForCourse(selectedCourse.name);
      if (crudForm.id === recordId) {
        resetCrudForm();
      }
      setError(null);
    } else {
      setError("Failed to delete mark record");
    }
    setCrudSaving(false);
  };

  const average = useMemo(() => {
    const scores = roster
      .map(
        (student) =>
          editingMarks[resolveStudentCode(student)] ??
          markMap.get(resolveStudentCode(student))?.score,
      )
      .filter((value): value is number => typeof value === "number");
    if (scores.length === 0) {
      return 0;
    }
    return Number(
      (scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(
        1,
      ),
    );
  }, [editingMarks, markMap, roster]);

  const highest = useMemo(() => {
    const scores = roster
      .map(
        (student) =>
          editingMarks[resolveStudentCode(student)] ??
          markMap.get(resolveStudentCode(student))?.score,
      )
      .filter((value): value is number => typeof value === "number");
    return scores.length > 0 ? Math.max(...scores) : 0;
  }, [editingMarks, markMap, roster]);

  const passRate = useMemo(() => {
    const scores = roster
      .map(
        (student) =>
          editingMarks[resolveStudentCode(student)] ??
          markMap.get(resolveStudentCode(student))?.score,
      )
      .filter((value): value is number => typeof value === "number");
    if (scores.length === 0) return 0;
    return Number(
      (
        (scores.filter((value) => value >= 50).length / scores.length) *
        100
      ).toFixed(1),
    );
  }, [editingMarks, markMap, roster]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-purple-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={lecturerSidebarItems} activeItem="marks" />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Marks Management" />

          <main className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Enter Marks
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Record and manage student grades
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">
                {courses.map((course) => (
                  <Button
                    key={course.id}
                    variant={
                      selectedCourse?.id === course.id ? "default" : "outline"
                    }
                    onClick={() => setSelectedCourse(course)}
                    className={
                      selectedCourse?.id === course.id
                        ? "bg-purple-600 hover:bg-purple-700"
                        : ""
                    }
                  >
                    {course.name}
                  </Button>
                ))}
              </div>

              {selectedCourse?.assessments && (
                <div className="flex gap-2 flex-wrap">
                  {selectedCourse.assessments.map((assessment) => (
                    <Badge
                      key={assessment}
                      variant={
                        selectedAssessment === assessment
                          ? "default"
                          : "outline"
                      }
                      className={`cursor-pointer px-3 py-1 ${selectedAssessment === assessment ? "bg-purple-600" : "hover:bg-purple-50"}`}
                      onClick={() => setSelectedAssessment(assessment)}
                    >
                      {assessment}
                    </Badge>
                  ))}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {selectedCourse?.name ?? "No Course Selected"} -{" "}
                        {selectedAssessment} Marks
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-1">
                        Total Students: {roster.length}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search by name or ID..."
                          value={searchTerm}
                          onChange={(event) => {
                            setSearchTerm(event.target.value);
                            setRosterCurrentPage(1);
                          }}
                          className="pl-9 w-64"
                        />
                      </div>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Upload className="h-4 w-4" /> Import
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Download className="h-4 w-4" /> Export
                      </Button>
                      {!isEditing ? (
                        <Button
                          onClick={() => setIsEditing(true)}
                          className="bg-purple-600 hover:bg-purple-700 gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Marks
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSaveMarks}
                          disabled={saving}
                          className="bg-green-600 hover:bg-green-700 gap-1"
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}{" "}
                          Save Changes
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-500">Average Marks</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {average.toFixed(1)}%
                      </p>
                      <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                        <TrendingUp className="h-3 w-3" /> +2.5%
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-500">Highest Marks</p>
                      <p className="text-2xl font-bold text-green-600">
                        {highest || 0}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Top score</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-xs text-gray-500">Pass Rate</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {passRate}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Students above 50%
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">
                            Student
                          </th>
                          <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">
                            Student ID
                          </th>
                          <th className="text-right py-3 px-3 text-xs font-semibold text-gray-600">
                            Marks (%)
                          </th>
                          <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">
                            Status
                          </th>
                          <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">
                            Grade
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="py-6 text-center text-sm text-gray-500"
                            >
                              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />{" "}
                              Loading roster
                            </td>
                          </tr>
                        ) : paginatedRoster.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="py-6 text-center text-sm text-gray-500"
                            >
                              No students found
                            </td>
                          </tr>
                        ) : (
                          paginatedRoster.map((student) => {
                            const studentCode = resolveStudentCode(student);
                            if (!studentCode) {
                              return null;
                            }
                            const existingMark = markMap.get(studentCode);
                            const currentValue =
                              editingMarks[studentCode] ??
                              existingMark?.score ??
                              0;
                            const percent = currentValue;
                            const grade =
                              percent >= 85
                                ? "A"
                                : percent >= 75
                                  ? "B+"
                                  : percent >= 65
                                    ? "B"
                                    : percent >= 50
                                      ? "C"
                                      : "F";
                            return (
                              <tr
                                key={student.id}
                                className="border-b border-gray-50 hover:bg-gray-50/50"
                              >
                                <td className="py-3 px-3 text-sm font-medium text-gray-900">
                                  {student.name}
                                </td>
                                <td className="py-3 px-3 text-sm text-gray-600">
                                  {studentCode}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  {isEditing ? (
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={currentValue}
                                      onChange={(event) =>
                                        setEditingMarks((current) => ({
                                          ...current,
                                          [studentCode]: Number(
                                            event.target.value,
                                          ),
                                        }))
                                      }
                                      className="w-24 text-right"
                                    />
                                  ) : (
                                    <span
                                      className={`font-semibold ${percent >= 75 ? "text-green-600" : percent >= 50 ? "text-blue-600" : "text-gray-600"}`}
                                    >
                                      {percent}%
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3">
                                  <Badge
                                    className={
                                      percent >= 50
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }
                                  >
                                    {percent >= 50 ? "Pass" : "Fail"}
                                  </Badge>
                                </td>
                                <td className="py-3 px-3">
                                  <Badge
                                    className={
                                      percent >= 85
                                        ? "bg-green-100 text-green-800"
                                        : percent >= 75
                                          ? "bg-blue-100 text-blue-700"
                                          : percent >= 65
                                            ? "bg-sky-100 text-sky-700"
                                            : percent >= 50
                                              ? "bg-orange-100 text-orange-700"
                                              : "bg-red-100 text-red-700"
                                    }
                                  >
                                    {grade}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>

                    {/* Pagination for roster */}
                    {totalRosterPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          Showing {(rosterCurrentPage - 1) * ITEMS_PER_PAGE + 1}{" "}
                          to{" "}
                          {Math.min(
                            rosterCurrentPage * ITEMS_PER_PAGE,
                            roster.length,
                          )}{" "}
                          of {roster.length} students
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setRosterCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={rosterCurrentPage === 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <div className="flex gap-1">
                            {Array.from(
                              { length: Math.min(5, totalRosterPages) },
                              (_, i) => {
                                let pageNum: number;
                                if (totalRosterPages <= 5) {
                                  pageNum = i + 1;
                                } else if (rosterCurrentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (
                                  rosterCurrentPage >=
                                  totalRosterPages - 2
                                ) {
                                  pageNum = totalRosterPages - 4 + i;
                                } else {
                                  pageNum = rosterCurrentPage - 2 + i;
                                }
                                return (
                                  <Button
                                    key={pageNum}
                                    variant={
                                      rosterCurrentPage === pageNum
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                      setRosterCurrentPage(pageNum)
                                    }
                                    className={`h-8 w-8 p-0 ${rosterCurrentPage === pageNum ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              },
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setRosterCurrentPage((p) =>
                                Math.min(totalRosterPages, p + 1),
                              )
                            }
                            disabled={rosterCurrentPage === totalRosterPages}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    Marks Add / Edit Flow
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Search student
                      </p>
                      <div className="relative">
                        <Input
                          value={crudStudentSearch}
                          onChange={(event) => {
                            setCrudStudentSearch(event.target.value);
                            setIsStudentDropdownOpen(true);
                          }}
                          onFocus={() => setIsStudentDropdownOpen(true)}
                          onBlur={() =>
                            setTimeout(
                              () => setIsStudentDropdownOpen(false),
                              200,
                            )
                          }
                          placeholder="Type name or student code"
                        />
                        {isStudentDropdownOpen &&
                          filteredCrudStudents.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
                              {filteredCrudStudents
                                .slice(0, 10)
                                .map((student) => {
                                  const code = resolveStudentCode(student);
                                  if (!code) return null;
                                  return (
                                    <div
                                      key={student.id}
                                      className="px-3 py-2 hover:bg-purple-50 cursor-pointer text-sm"
                                      onClick={() => {
                                        setCrudForm((prev) => ({
                                          ...prev,
                                          studentCode: code,
                                        }));
                                        setCrudStudentSearch(
                                          `${student.name} (${code})`,
                                        );
                                        setIsStudentDropdownOpen(false);
                                      }}
                                    >
                                      {student.name}{" "}
                                      <span className="text-gray-400">
                                        ({code})
                                      </span>
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Search subject
                      </p>
                      <div className="relative">
                        <Input
                          value={crudSubjectSearch}
                          onChange={(event) => {
                            setCrudSubjectSearch(event.target.value);
                            setCrudForm((current) => ({
                              ...current,
                              subject: event.target.value,
                            }));
                            setIsSubjectDropdownOpen(true);
                          }}
                          onFocus={() => setIsSubjectDropdownOpen(true)}
                          onBlur={() =>
                            setTimeout(
                              () => setIsSubjectDropdownOpen(false),
                              200,
                            )
                          }
                          placeholder="Type or choose subject"
                        />
                        {isSubjectDropdownOpen &&
                          availableSubjects.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
                              {availableSubjects.slice(0, 10).map((subject) => (
                                <div
                                  key={subject}
                                  className="px-3 py-2 hover:bg-purple-50 cursor-pointer text-sm"
                                  onClick={() => {
                                    setCrudSubjectSearch(subject);
                                    setCrudForm((current) => ({
                                      ...current,
                                      subject,
                                    }));
                                    setIsSubjectDropdownOpen(false);
                                  }}
                                >
                                  {subject}
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Assessment</p>
                      <Input
                        value={crudForm.assessment}
                        onChange={(event) =>
                          setCrudForm((current) => ({
                            ...current,
                            assessment: event.target.value,
                          }))
                        }
                        placeholder="Assessment"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Score</p>
                      <Input
                        type="number"
                        min="0"
                        value={crudForm.score}
                        onChange={(event) =>
                          setCrudForm((current) => ({
                            ...current,
                            score: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Max Score</p>
                      <Input
                        type="number"
                        min="1"
                        value={crudForm.maxScore}
                        onChange={(event) =>
                          setCrudForm((current) => ({
                            ...current,
                            maxScore: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-6 gap-3 items-end">
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Exam Date</p>
                      <Input
                        type="date"
                        value={crudForm.examDate}
                        onChange={(event) =>
                          setCrudForm((current) => ({
                            ...current,
                            examDate: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="col-span-4 flex gap-2">
                      <Button
                        onClick={handleCreateRecord}
                        disabled={crudSaving}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {crudSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Create"
                        )}
                      </Button>
                      <Button
                        onClick={handleUpdateRecord}
                        disabled={!crudForm.id || crudSaving}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Update
                      </Button>
                      <Button
                        variant="outline"
                        onClick={resetCrudForm}
                        disabled={crudSaving}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="mb-3 grid grid-cols-2 gap-3">
                      <Input
                        value={recordStudentSearch}
                        onChange={(event) => {
                          setRecordStudentSearch(event.target.value);
                          setRecordsCurrentPage(1);
                        }}
                        placeholder="Filter records by student"
                      />
                      <Input
                        value={recordSubjectSearch}
                        onChange={(event) => {
                          setRecordSubjectSearch(event.target.value);
                          setRecordsCurrentPage(1);
                        }}
                        placeholder="Filter records by subject"
                      />
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600">
                            Student
                          </th>
                          <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600">
                            Subject
                          </th>
                          <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600">
                            Assessment
                          </th>
                          <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600">
                            Exam Date
                          </th>
                          <th className="text-right py-2 px-2 text-xs font-semibold text-gray-600">
                            Score
                          </th>
                          <th className="text-right py-2 px-2 text-xs font-semibold text-gray-600">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRecords.map((record) => (
                          <tr
                            key={record.id}
                            className="border-b border-gray-50"
                          >
                            <td className="py-2 px-2 text-sm text-gray-900">
                              {record.studentName} ({record.studentCode})
                            </td>
                            <td className="py-2 px-2 text-sm text-gray-700">
                              {record.subject}
                            </td>
                            <td className="py-2 px-2 text-sm text-gray-700">
                              {record.assessment}
                            </td>
                            <td className="py-2 px-2 text-sm text-gray-700">
                              {record.examDate}
                            </td>
                            <td className="py-2 px-2 text-sm text-right font-medium text-gray-900">
                              {record.score}/{record.maxScore}
                            </td>
                            <td className="py-2 px-2 text-right">
                              <div className="inline-flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditRecord(record)}
                                  disabled={crudSaving}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600"
                                  onClick={() => handleDeleteRecord(record.id)}
                                  disabled={crudSaving}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {paginatedRecords.length === 0 && (
                          <tr>
                            <td
                              colSpan={6}
                              className="py-6 text-center text-sm text-gray-500"
                            >
                              No marks records found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {/* Pagination for records */}
                    {totalRecordsPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          Showing{" "}
                          {(recordsCurrentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                          {Math.min(
                            recordsCurrentPage * ITEMS_PER_PAGE,
                            filteredCrudRecords.length,
                          )}{" "}
                          of {filteredCrudRecords.length} records
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setRecordsCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={recordsCurrentPage === 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <div className="flex gap-1">
                            {Array.from(
                              { length: Math.min(5, totalRecordsPages) },
                              (_, i) => {
                                let pageNum: number;
                                if (totalRecordsPages <= 5) {
                                  pageNum = i + 1;
                                } else if (recordsCurrentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (
                                  recordsCurrentPage >=
                                  totalRecordsPages - 2
                                ) {
                                  pageNum = totalRecordsPages - 4 + i;
                                } else {
                                  pageNum = recordsCurrentPage - 2 + i;
                                }
                                return (
                                  <Button
                                    key={pageNum}
                                    variant={
                                      recordsCurrentPage === pageNum
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                      setRecordsCurrentPage(pageNum)
                                    }
                                    className={`h-8 w-8 p-0 ${recordsCurrentPage === pageNum ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              },
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setRecordsCurrentPage((p) =>
                                Math.min(totalRecordsPages, p + 1),
                              )
                            }
                            disabled={recordsCurrentPage === totalRecordsPages}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
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
