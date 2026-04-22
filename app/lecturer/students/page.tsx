"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { lecturerSidebarItems } from "@/components/sidebar/lecturerSidebarItems";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Search, TrendingUp, UserCheck } from "lucide-react";

type Student = {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  batch?: string;
  department?: string;
};

type Prediction = {
  student: {
    name: string;
    studentCode: string;
  };
  metrics: {
    attendanceRate: number;
    averageMark: number;
    riskScore: number;
    riskCategory: "low" | "moderate" | "high";
  };
  predictions: {
    nextMonthExpectedAttendance: number;
    nextExamExpectedScore: number;
  };
};

export default function LecturerStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [predictingId, setPredictingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadStudents() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/users?role=student");
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json?.error || "Failed to load students");
        }
        setStudents(json.users || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load students");
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, []);

  const filtered = students.filter((student) => {
    const q = query.toLowerCase().trim();
    if (!q) {
      return true;
    }

    return (
      student.name.toLowerCase().includes(q) ||
      student.email.toLowerCase().includes(q) ||
      (student.studentId || "").toLowerCase().includes(q)
    );
  });

  async function runPrediction(student: Student) {
    if (!student.studentId) {
      setError("Student profile is missing a student ID");
      return;
    }

    setPredictingId(student.id);
    setError(null);

    try {
      const response = await fetch(`/api/predictions/student/${student.studentId}`);
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || "Prediction failed");
      }
      setPrediction(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed");
    } finally {
      setPredictingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-purple-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={lecturerSidebarItems} activeItem="students" />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Student Management" />

          <main className="flex-1 overflow-auto p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Students and Predictions</h2>
              <p className="text-sm text-gray-600 mt-1">Browse students and calculate risk-based academic predictions.</p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search student by name, email, ID"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {loading ? (
                <p className="text-sm text-gray-500">Loading students...</p>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-gray-500">No students found.</p>
              ) : (
                filtered.map((student) => (
                  <Card key={student.id} className="border-0 shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{student.name}</h4>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {student.studentId && <Badge className="bg-blue-100 text-blue-700">{student.studentId}</Badge>}
                        {student.batch && <Badge className="bg-emerald-100 text-emerald-700">Batch {student.batch}</Badge>}
                      </div>

                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
                        disabled={predictingId === student.id}
                        onClick={() => runPrediction(student)}
                      >
                        <TrendingUp className="h-4 w-4" />
                        {predictingId === student.id ? "Predicting..." : "Run Prediction"}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {prediction && (
              <Card className="border-0 shadow-sm bg-linear-to-r from-purple-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-purple-600" />
                    Prediction Summary for {prediction.student.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Attendance</p>
                      <p className="text-xl font-bold text-gray-900">{prediction.metrics.attendanceRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Average Mark</p>
                      <p className="text-xl font-bold text-gray-900">{prediction.metrics.averageMark}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Risk Score</p>
                      <p className="text-xl font-bold text-gray-900">{prediction.metrics.riskScore}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Risk Category</p>
                      <p className="text-xl font-bold text-gray-900">{prediction.metrics.riskCategory}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Next Exam Prediction</p>
                      <p className="text-xl font-bold text-gray-900">{prediction.predictions.nextExamExpectedScore}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
