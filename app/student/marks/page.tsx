"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { studentSidebarItems } from "@/components/sidebar/studentSidebarItems";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Download, BookOpen, Award, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type MarkRecord = {
  id: string;
  subject: string;
  assessment: string;
  score: number;
  maxScore: number;
  examDate: string;
};

type MarksResponse = {
  records: MarkRecord[];
  summary: {
    total: number;
    averageMarks: number;
    highestMarks: number;
  };
};

function getGrade(score: number) {
  if (score >= 85) return "A";
  if (score >= 75) return "B+";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  return "F";
}

function getGradeColor(grade: string) {
  switch (grade) {
    case "A":
    case "A+":
      return "bg-green-100 text-green-700";
    case "B+":
      return "bg-blue-100 text-blue-700";
    case "B":
      return "bg-sky-100 text-sky-700";
    case "C":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-red-100 text-red-700";
  }
}

export default function StudentMarksPage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<MarkRecord[]>([]);
  const [summary, setSummary] = useState<MarksResponse["summary"]>({
    total: 0,
    averageMarks: 0,
    highestMarks: 0,
  });

  useEffect(() => {
    const loadMarks = async () => {
      setLoading(true);
      const response = await fetch("/api/marks", { credentials: "include" });
      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = (await response.json()) as MarksResponse | { records?: MarkRecord[]; summary?: MarksResponse["summary"] };
      setRecords("records" in data ? data.records ?? [] : []);
      setSummary("summary" in data ? data.summary ?? { total: 0, averageMarks: 0, highestMarks: 0 } : { total: 0, averageMarks: 0, highestMarks: 0 });
      setLoading(false);
    };

    void loadMarks();
  }, []);

  const chartData = useMemo(() => {
    const subjectScores = new Map<string, number[]>();

    for (const record of records) {
      const score = (record.score / record.maxScore) * 100;
      const list = subjectScores.get(record.subject) ?? [];
      list.push(score);
      subjectScores.set(record.subject, list);
    }

    return Array.from(subjectScores.entries()).map(([subject, scores]) => ({
      subject,
      score: Number((scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(1)),
    }));
  }, [records]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={studentSidebarItems} activeItem="marks" />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Academic Results" />

          <main className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Academic Performance</h2>
                <p className="text-gray-500 text-sm mt-1">Track your grades, GPA trends, and academic progress</p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500">Average Marks</p>
                    <p className="text-2xl font-bold text-emerald-600">{summary.averageMarks}%</p>
                    <p className="text-xs text-green-600 mt-1">Across {summary.total} records</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500">Highest Marks</p>
                    <p className="text-2xl font-bold text-blue-600">{summary.highestMarks}%</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500">Subjects</p>
                    <p className="text-2xl font-bold text-gray-900">{new Set(records.map((record) => record.subject)).size}</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500">Latest Grade</p>
                    <p className="text-2xl font-bold text-gray-900">{records[0] ? getGrade((records[0].score / records[0].maxScore) * 100) : "N/A"}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Subject Performance</CardTitle>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="h-3 w-3" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    {loading ? (
                      <div className="flex h-full items-center justify-center gap-2 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading marks
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="subject" stroke="#6b7280" />
                          <YAxis domain={[0, 100]} stroke="#6b7280" />
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Bar dataKey="score" fill="#059669" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Marks List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 px-3 text-left text-xs font-semibold text-gray-600">Subject</th>
                          <th className="py-3 px-3 text-left text-xs font-semibold text-gray-600">Assessment</th>
                          <th className="py-3 px-3 text-right text-xs font-semibold text-gray-600">Score</th>
                          <th className="py-3 px-3 text-left text-xs font-semibold text-gray-600">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((record) => {
                          const percentage = (record.score / record.maxScore) * 100;
                          const grade = getGrade(percentage);
                          return (
                            <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                              <td className="py-3 px-3 text-sm font-medium text-gray-900">{record.subject}</td>
                              <td className="py-3 px-3 text-sm text-gray-600">{record.assessment}</td>
                              <td className="py-3 px-3 text-right text-sm font-semibold text-gray-900">{percentage.toFixed(1)}%</td>
                              <td className="py-3 px-3">
                                <Badge className={getGradeColor(grade)}>{grade}</Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
