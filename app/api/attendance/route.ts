import { requireAuth } from "@/lib/server/auth";
import { apiError, apiOk } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { parseDateOnlyLocal, todayDateOnlyLocal } from "@/lib/server/date";

function resolveStudentFilter(currentUser: Awaited<ReturnType<typeof requireAuth>>) {
  if (currentUser.role === "student") {
    return currentUser.studentProfile?.id;
  }

  if (currentUser.role === "parent") {
    return currentUser.parentProfile?.childStudentCode;
  }

  return undefined;
}

function mapAttendance(record: {
  id: string;
  date: string;
  present: boolean;
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
    date: record.date,
    present: record.present,
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
    const date = url.searchParams.get("date");

    let studentProfileId: number | undefined;
    let studentCodeFilter: string | undefined;

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

    const records = await prisma.attendanceRecord.findMany({
      where: {
        ...(date ? { date } : {}),
        student: {
          ...(studentProfileId ? { id: studentProfileId } : {}),
          ...(studentCodeFilter ? { studentCode: studentCodeFilter } : {}),
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

    const allStudentRecords = await prisma.attendanceRecord.findMany({
      where: {
        ...(studentProfileId ? { studentProfileId } : {}),
        ...(studentCodeFilter ? { student: { studentCode: studentCodeFilter } } : {}),
      },
      orderBy: { date: "asc" },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    const total = allStudentRecords.length;
    const present = allStudentRecords.filter((record) => record.present).length;
    const attendanceRate = total > 0 ? (present / total) * 100 : 0;

    return apiOk({
      date,
      records: records.map(mapAttendance),
      history: allStudentRecords.map(mapAttendance),
      summary: {
        total,
        present,
        absent: total - present,
        attendanceRate: Number(attendanceRate.toFixed(2)),
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
      return apiError(403, "Only lecturers and admins can update attendance");
    }

    const body = await request.json();
    const date = typeof body.date === "string" ? body.date : todayDateOnlyLocal();
    const parsedDate = parseDateOnlyLocal(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return apiError(400, "Invalid attendance date");
    }

    const entries = Array.isArray(body.records) ? body.records : body.record ? [body.record] : [];

    if (entries.length === 0) {
      return apiError(400, "No attendance records provided");
    }

    const saved: Array<Record<string, unknown>> = [];

    for (const entry of entries) {
      const studentCode = String(entry.studentCode || "");
      const present = Boolean(entry.present);

      if (!studentCode) {
        continue;
      }

      const student = await prisma.studentProfile.findUnique({
        where: { studentCode },
        include: { user: true },
      });

      if (!student) {
        continue;
      }

      await prisma.attendanceRecord.deleteMany({
        where: {
          studentProfileId: student.id,
          date,
        },
      });

      const record = await prisma.attendanceRecord.create({
        data: {
          studentProfileId: student.id,
          date,
          present,
        },
        include: {
          student: {
            include: {
              user: true,
            },
          },
        },
      });

      saved.push(mapAttendance(record));
    }

    return apiOk({ records: saved }, 201);
  } catch (error) {
    console.error("Attendance save error", error);
    return apiError(500, "Failed to save attendance records");
  }
}
