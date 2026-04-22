import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { apiError, apiOk } from "@/lib/server/http";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export async function GET(_request: Request, context: { params: Promise<{ studentCode: string }> }) {
  try {
    const currentUser = await requireAuth();
    const { studentCode } = await context.params;

    if (currentUser.role === "student" && currentUser.studentProfile?.studentCode !== studentCode) {
      return apiError(403, "Forbidden");
    }

    if (
      currentUser.role === "parent" &&
      currentUser.parentProfile?.childStudentCode !== studentCode
    ) {
      return apiError(403, "Forbidden");
    }

    const student = await prisma.studentProfile.findUnique({
      where: { studentCode },
      include: {
        user: true,
        attendance: true,
        marks: true,
      },
    });

    if (!student) {
      return apiError(404, "Student not found");
    }

    const totalAttendance = student.attendance.length;
    const presentDays = student.attendance.filter((row) => row.present).length;
    const attendanceRate = totalAttendance > 0 ? (presentDays / totalAttendance) * 100 : 0;

    const avgMark =
      student.marks.length > 0
        ? student.marks.reduce((sum, m) => sum + (m.score / m.maxScore) * 100, 0) / student.marks.length
        : 0;

    // Simple interpretable risk model for early warning.
    const riskScore = clamp(Math.round(100 - attendanceRate * 0.6 - avgMark * 0.4), 0, 100);

    const category = riskScore < 35 ? "low" : riskScore < 65 ? "moderate" : "high";

    const nextMonthExpectedAttendance = clamp(Math.round(attendanceRate + (attendanceRate > 85 ? 2 : -3)), 0, 100);
    const nextExamExpectedScore = clamp(Math.round(avgMark + (attendanceRate > 90 ? 4 : attendanceRate < 75 ? -5 : 1)), 0, 100);

    return apiOk({
      student: {
        name: student.user.name,
        studentCode: student.studentCode,
      },
      metrics: {
        attendanceRate: Number(attendanceRate.toFixed(2)),
        averageMark: Number(avgMark.toFixed(2)),
        riskScore,
        riskCategory: category,
      },
      predictions: {
        nextMonthExpectedAttendance,
        nextExamExpectedScore,
      },
    });
  } catch (error) {
    console.error("Prediction error", error);
    return apiError(500, "Failed to calculate predictions");
  }
}
