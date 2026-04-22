import { requireAuth } from "@/lib/server/auth";
import { apiError, apiOk } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";

function mapSchedule(record: {
  id: string;
  date: string;
  timeSlot: string;
  course: string;
  courseCode: string;
  room: string;
  students: number;
  status: "scheduled" | "postponed";
}) {
  return {
    id: record.id,
    date: record.date,
    time: record.timeSlot,
    course: record.course,
    code: record.courseCode,
    room: record.room,
    students: record.students,
    status: record.status,
  };
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await requireAuth();
    if (currentUser.role !== "lecturer" && currentUser.role !== "admin") {
      return apiError(403, "Forbidden");
    }

    const { id } = await params;
    const existing = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!existing) {
      return apiError(404, "Schedule not found");
    }

    if (
      currentUser.role === "lecturer" &&
      existing.lecturerProfileId !== currentUser.lecturerProfile?.id
    ) {
      return apiError(403, "You can only update your own schedule");
    }

    const body = (await request.json()) as {
      date?: unknown;
      time?: unknown;
      course?: unknown;
      code?: unknown;
      room?: unknown;
      students?: unknown;
      status?: unknown;
    };

    const date = typeof body.date === "string" ? body.date.trim() : "";
    const time = typeof body.time === "string" ? body.time.trim() : "";
    const course = typeof body.course === "string" ? body.course.trim() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";
    const room = typeof body.room === "string" ? body.room.trim() : "";
    const students = Number(body.students);

    if (!date || !time || !course || !code || !room || Number.isNaN(students) || students <= 0) {
      return apiError(400, "Invalid schedule payload");
    }

    const updated = await prisma.schedule.update({
      where: { id },
      data: {
        date,
        timeSlot: time,
        course,
        courseCode: code,
        room,
        students,
        status: body.status === "postponed" ? "postponed" : "scheduled",
      },
    });

    return apiOk({ record: mapSchedule(updated) });
  } catch (error) {
    console.error("Update schedule error", error);
    return apiError(500, "Failed to update schedule");
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await requireAuth();
    if (currentUser.role !== "lecturer" && currentUser.role !== "admin") {
      return apiError(403, "Forbidden");
    }

    const { id } = await params;
    const existing = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!existing) {
      return apiError(404, "Schedule not found");
    }

    if (
      currentUser.role === "lecturer" &&
      existing.lecturerProfileId !== currentUser.lecturerProfile?.id
    ) {
      return apiError(403, "You can only delete your own schedule");
    }

    await prisma.schedule.delete({ where: { id } });
    return apiOk({ deleted: true });
  } catch (error) {
    console.error("Delete schedule error", error);
    return apiError(500, "Failed to delete schedule");
  }
}
