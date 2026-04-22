'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Subject {
  id: string;
  name: string;
  marks: number;
  maxMarks: number;
  grade: string;
  attendance: number;
}

interface SubjectPerformanceProps {
  subjects?: Subject[];
}

const defaultSubjects: Subject[] = [
  { id: '1', name: 'Data Structures', marks: 85, maxMarks: 100, grade: 'A', attendance: 92 },
  { id: '2', name: 'Web Development', marks: 88, maxMarks: 100, grade: 'A+', attendance: 95 },
  { id: '3', name: 'Database Systems', marks: 79, maxMarks: 100, grade: 'B+', attendance: 88 },
  { id: '4', name: 'Software Engineering', marks: 92, maxMarks: 100, grade: 'A+', attendance: 98 },
  { id: '5', name: 'Operating Systems', marks: 82, maxMarks: 100, grade: 'A', attendance: 89 },
  { id: '6', name: 'Algorithms', marks: 87, maxMarks: 100, grade: 'A', attendance: 91 },
];

function getGradeColor(grade: string) {
  switch (grade.toUpperCase()) {
    case 'A':
    case 'A+':
      return 'text-success bg-success/10';
    case 'B':
    case 'B+':
      return 'text-blue-600 bg-blue-50';
    case 'C':
    case 'C+':
      return 'text-warning bg-warning/10';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

function getAttendanceColor(attendance: number) {
  if (attendance >= 90) return 'text-success';
  if (attendance >= 75) return 'text-blue-600';
  return 'text-warning';
}

export function SubjectPerformance({ subjects = defaultSubjects }: SubjectPerformanceProps) {
  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Subject Wise Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Marks</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Grade</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr
                  key={subject.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-4 px-4 text-gray-900 font-medium">{subject.name}</td>
                  <td className="py-4 px-4 text-gray-700">
                    {subject.marks}/{subject.maxMarks}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getGradeColor(subject.grade)}`}>
                      {subject.grade}
                    </span>
                  </td>
                  <td className={`py-4 px-4 font-semibold ${getAttendanceColor(subject.attendance)}`}>
                    {subject.attendance}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
