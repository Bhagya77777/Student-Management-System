'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SemesterProgressProps {
  progress?: number;
  semester?: string;
}

export function SemesterProgress({
  progress = 80,
  semester = 'Spring 2024',
}: SemesterProgressProps) {
  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Semester Progress</CardTitle>
          <span className="text-sm font-semibold text-primary">{semester}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Completion</span>
            <span className="text-2xl font-bold text-primary">{progress}%</span>
          </div>
          <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Progress Breakdown */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-600 mb-1">Courses Completed</p>
            <p className="text-2xl font-bold text-gray-900">4</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Assignments Pending</p>
            <p className="text-2xl font-bold text-warning">2</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Exams Remaining</p>
            <p className="text-2xl font-bold text-primary">2</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
