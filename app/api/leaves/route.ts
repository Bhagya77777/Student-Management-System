import { LeaveStatus, LeaveType } from "@prisma/client";
import { requireAuth } from "@/lib/server/auth";
import { apiError, apiOk } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { leaveCreateSchema } from "@/lib/server/validation";
import { parseDateOnlyLocal, todayDateOnlyLocal } from "@/lib/server/date";

function normalizeLeaveType(type: LeaveType) {
  return type.charAt(0).toUpperCase() + type.slice(1) + " Leave";
}

function mapLeave(leave: {
  id: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  reason: string;
  appliedAt: Date;
  documentName: string | null;
  decisionNote: string | null;
}) {
  return {
    id: leave.id,
    type: normalizeLeaveType(leave.leaveType),
    leaveType: leave.leaveType,
    startDate: leave.startDate,
    endDate: leave.endDate,
    status: leave.status,
    reason: leave.reason,
    appliedDate: leave.appliedAt.toISOString().split("T")[0],
    documentName: leave.documentName,
    decisionNote: leave.decisionNote,
  };
}

export async function GET() {
  try {
    const currentUser = await requireAuth();

    let whereClause:
      | {
          studentProfileId?: number;
          student?: { studentCode?: string; department?: string };
        }
      | undefined;

    if (currentUser.role === "student") {
      whereClause = currentUser.studentProfile?.id
        ? { studentProfileId: currentUser.studentProfile.id }
        : { studentProfileId: -1 };
    } else if (currentUser.role === "parent") {
      const childStudentCode = currentUser.parentProfile?.childStudentCode;
      whereClause = childStudentCode ? { student: { studentCode: childStudentCode } } : { studentProfileId: -1 };
    } else if (currentUser.role === "lecturer") {
      const department = currentUser.lecturerProfile?.department;
      whereClause = department ? { student: { department } } : { studentProfileId: -1 };
    } else if (currentUser.role === "admin") {
      whereClause = undefined;
    } else {
      return apiError(403, "Forbidden");
    }

    const leaves = await prisma.leaveRequest.findMany({
      where: whereClause,
      orderBy: { appliedAt: "desc" },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    return apiOk({
      leaves: leaves.map((leave) => ({
        ...mapLeave(leave),
        studentName: leave.student.user.name,
        studentCode: leave.student.studentCode,
        studentDepartment: leave.student.department,
      })),
    });
  } catch {
    return apiError(401, "Unauthorized");
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();

    if (currentUser.role !== "student" || !currentUser.studentProfile) {
      return apiError(403, "Only students can create leave requests");
    }

    const json = await request.json();
    const parsed = leaveCreateSchema.safeParse(json);

    if (!parsed.success) {
      return apiError(400, parsed.error.issues[0]?.message || "Invalid leave data");
    }

    const { startDate, endDate, leaveType, reason } = parsed.data;

    const start = parseDateOnlyLocal(startDate);
    const end = parseDateOnlyLocal(endDate);
    const today = parseDateOnlyLocal(todayDateOnlyLocal());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (start.getTime() < tomorrow.getTime()) {
      return apiError(400, "Leave must be requested at least one day in advance.");
    }

    if (end.getTime() < start.getTime()) {
      return apiError(400, "End date cannot be before start date");
    }

    const conflict = await prisma.leaveRequest.findFirst({
      where: {
        studentProfileId: currentUser.studentProfile.id,
        status: { in: ["pending", "approved"] },
        OR: [
          { startDate: { lte: endDate }, endDate: { gte: startDate } },
        ],
      },
    });

    if (conflict) {
      return apiError(409, "You already have a pending/approved leave request for this date range");
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        studentProfileId: currentUser.studentProfile.id,
        leaveType,
        startDate,
        endDate,
        reason,
      },
    });

    return apiOk({ leave: mapLeave(leave) }, 201);
  } catch (error) {
    console.error("Create leave error", error);
    return apiError(500, "Failed to create leave request");
  }
}
