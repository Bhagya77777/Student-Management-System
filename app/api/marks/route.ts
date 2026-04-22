import { requireAuth } from "@/lib/server/auth";
import { apiError, apiOk } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { todayDateOnlyLocal } from "@/lib/server/date";

function mapMark(record: {
  id: string;
  subject: string;
  assessment: string;
  score: number;
  maxScore: number;
  examDate: string;
  createdAt: Date;
  student: {
    studentCode: string;
    batch: string;
    department: string | null;
    user: { name: string };
  };
}) {
  return {
    id: record.id,
    subject: record.subject,
    assessment: record.assessment,
    score: record.score,
    maxScore: record.maxScore,
    examDate: record.examDate,
    createdAt: record.createdAt.toISOString(),
    studentName: record.student.user.name,
    studentCode: record.student.studentCode,
    batch: record.student.batch,
    department: record.student.department,
  };
}

export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth();
    const url = new URL(request.url);
    const studentCode = url.searchParams.get("studentCode");
    const subject = url.searchParams.get("subject");

    let studentProfileId: number | undefined;
    let studentCodeFilter: string | undefined;
    const lecturerDepartment = currentUser.role === "lecturer" ? currentUser.lecturerProfile?.department || null : null;

    if (currentUser.role === "lecturer" && !lecturerDepartment) {
      return apiError(403, "Lecturer department is required");
    }

    if (studentCode) {
      if (currentUser.role !== "admin" && currentUser.role !== "lecturer") {
        return apiError(403, "Forbidden");
      }

      studentCodeFilter = studentCode;
    } else if (currentUser.role === "student") {
      studentProfileId = currentUser.studentProfile?.id;
    } else if (currentUser.role === "parent") {
      studentCodeFilter = currentUser.parentProfile?.childStudentCode || undefined;
    }

    const records = await prisma.markRecord.findMany({
      where: {
        ...(subject ? { subject } : {}),
        student: {
          ...(studentProfileId ? { id: studentProfileId } : {}),
          ...(studentCodeFilter ? { studentCode: studentCodeFilter } : {}),
          ...(lecturerDepartment ? { department: lecturerDepartment } : {}),
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    const totalMarks = records.reduce((sum, record) => sum + (record.score / record.maxScore) * 100, 0);
    const averageMarks = records.length > 0 ? totalMarks / records.length : 0;

    return apiOk({
      records: records.map(mapMark),
      summary: {
        total: records.length,
        averageMarks: Number(averageMarks.toFixed(2)),
        highestMarks: records.length > 0 ? Math.max(...records.map((record) => (record.score / record.maxScore) * 100)) : 0,
      },
    });
  } catch {
    return apiError(401, "Unauthorized");
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();

    if (currentUser.role !== "admin" && currentUser.role !== "lecturer") {
      return apiError(403, "Only lecturers and admins can update marks");
    }

    const body = await request.json();
    const examDate = typeof body.examDate === "string" ? body.examDate : todayDateOnlyLocal();
    const entries = Array.isArray(body.records) ? body.records : body.record ? [body.record] : [];
    const lecturerDepartment = currentUser.role === "lecturer" ? currentUser.lecturerProfile?.department || null : null;

    if (currentUser.role === "lecturer" && !lecturerDepartment) {
      return apiError(403, "Lecturer department is required");
    }

    if (entries.length === 0) {
      return apiError(400, "No mark records provided");
    }

    const saved: Array<Record<string, unknown>> = [];

    for (const entry of entries) {
      const studentCode = String(entry.studentCode || "");
      const subject = String(entry.subject || body.subject || "");
      const assessment = String(entry.assessment || body.assessment || "Assessment");
      const score = Number(entry.score);
      const maxScore = Number(entry.maxScore || 100);

      if (!studentCode || !subject || Number.isNaN(score)) {
        continue;
      }

      const student = await prisma.studentProfile.findUnique({
        where: { studentCode },
        include: { user: true },
      });

      if (!student) {
        continue;
      }

      if (lecturerDepartment && student.department !== lecturerDepartment) {
        return apiError(403, `You can only manage marks for students in your department (${lecturerDepartment})`);
      }

      await prisma.markRecord.deleteMany({
        where: {
          studentProfileId: student.id,
          subject,
          assessment,
          examDate,
        },
      });

      const record = await prisma.markRecord.create({
        data: {
          studentProfileId: student.id,
          subject,
          assessment,
          score,
          maxScore,
          examDate,
        },
        include: {
          student: {
            include: {
              user: true,
            },
          },
        },
      });

      saved.push(mapMark(record));
    }

    return apiOk({ records: saved }, 201);
  } catch (error) {
    console.error("Marks save error", error);
    return apiError(500, "Failed to save marks");
  }
}
