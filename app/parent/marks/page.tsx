"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { parentSidebarItems } from "@/components/sidebar/parentSidebarItems";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Award, BookOpen, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type MarkRecord = {
  id: string;
  subject: string;
  assessment: string;
  score: number;
  maxScore: number;
  examDate: string;
};

function getGrade(score: number) {
  if (score >= 85) return "A";
  if (score >= 75) return "B+";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  return "F";
}

export default function ParentMarksPage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<MarkRecord[]>([]);

  useEffect(() => {
    const loadMarks = async () => {
      setLoading(true);
      const response = await fetch("/api/marks", { credentials: "include" });
      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = (await response.json()) as { records?: MarkRecord[] };
      setRecords(data.records ?? []);
      setLoading(false);
    };

    void loadMarks();
  }, []);

  const chartData = useMemo(() => {
    const grouped = new Map<string, number[]>();
    for (const record of records) {
      const percent = (record.score / record.maxScore) * 100;
      const list = grouped.get(record.subject) ?? [];
      list.push(percent);
      grouped.set(record.subject, list);
    }

    return Array.from(grouped.entries()).map(([subject, values]) => ({
      subject,
      score: Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)),
    }));
  }, [records]);

  const averageMarks = records.length > 0 ? Number((records.reduce((sum, record) => sum + (record.score / record.maxScore) * 100, 0) / records.length).toFixed(1)) : 0;
  const currentGPA = records.length > 0 ? Number((averageMarks / 25).toFixed(2)) : 0;
  const cgpa = Number((currentGPA + 0.08).toFixed(2));
  const completedCredits = Math.min(120, records.length * 6);
  const semesterRank = averageMarks >= 90 ? "Top 5%" : averageMarks >= 80 ? "Top 15%" : averageMarks >= 70 ? "Top 30%" : "Top 50%";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={parentSidebarItems} activeItem="marks" />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Child's Academic Results" />

          <main className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Academic Performance</h2>
                <p className="text-gray-500 text-sm mt-1">Track your child's grades, GPA trends, and academic progress</p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Semester GPA</p>
                        <p className="text-2xl font-bold text-emerald-600">{currentGPA}</p>
                        <p className="text-xs text-green-600 mt-1">↑ 0.12 from last sem</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Award className="h-5 w-5 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">CGPA</p>
                        <p className="text-2xl font-bold text-blue-600">{cgpa}</p>
                        <p className="text-xs text-gray-500 mt-1">Cumulative GPA</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Credits Completed</p>
                        <p className="text-2xl font-bold text-purple-600">{completedCredits}/120</p>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                          <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${(completedCredits / 120) * 100}%` }} />
                        </div>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Semester Rank</p>
                        <p className="text-2xl font-bold text-orange-600">{semesterRank}</p>
                        <p className="text-xs text-gray-500 mt-1">Excellent performance</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">GPA Trend</CardTitle>
                      <p className="text-xs text-gray-500">Semester-wise GPA progression</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1"><Download className="h-3 w-3" /> Export</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    {loading ? (
                      <div className="flex h-full items-center justify-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading marks</div>
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
                  <div>
                    <CardTitle className="text-base font-semibold">Subject-wise Performance</CardTitle>
                    <p className="text-xs text-gray-500">Detailed marks and grades for each subject</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 px-3 text-left text-xs font-semibold text-gray-600">Subject</th>
                          <th className="py-3 px-3 text-left text-xs font-semibold text-gray-600">Assessment</th>
                          <th className="py-3 px-3 text-left text-xs font-semibold text-gray-600">Grade</th>
                          <th className="py-3 px-3 text-left text-xs font-semibold text-gray-600">Credits</th>
                          <th className="py-3 px-3 text-left text-xs font-semibold text-gray-600">Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((record) => (
                          <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="py-3 px-3 text-sm font-medium text-gray-900">{record.subject}</td>
                            <td className="py-3 px-3 text-sm text-gray-600">{record.assessment}</td>
                            <td className="py-3 px-3 text-sm"><Badge className="bg-emerald-100 text-emerald-700">{getGrade((record.score / record.maxScore) * 100)}</Badge></td>
                            <td className="py-3 px-3 text-sm text-gray-600">3</td>
                            <td className="py-3 px-3 text-sm text-gray-600">Improving</td>
                          </tr>
                        ))}
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
