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

export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth();
    if (currentUser.role !== "lecturer" && currentUser.role !== "admin") {
      return apiError(403, "Forbidden");
    }

    const url = new URL(request.url);
    const lecturerProfileIdQuery = url.searchParams.get("lecturerProfileId");

    const lecturerProfileId =
      currentUser.role === "lecturer"
        ? currentUser.lecturerProfile?.id
        : lecturerProfileIdQuery
          ? Number(lecturerProfileIdQuery)
          : undefined;

    if (currentUser.role === "lecturer" && !lecturerProfileId) {
      return apiError(403, "Lecturer profile is required");
    }

    const schedules = await prisma.schedule.findMany({
      where: {
        ...(typeof lecturerProfileId === "number"
          ? { lecturerProfileId }
          : {}),
      },
      orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
    });

    return apiOk({ records: schedules.map(mapSchedule) });
  } catch {
    return apiError(401, "Unauthorized");
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();
    if (currentUser.role !== "lecturer" && currentUser.role !== "admin") {
      return apiError(403, "Forbidden");
    }

    const body = (await request.json()) as {
      lecturerProfileId?: unknown;
      date?: unknown;
      time?: unknown;
      course?: unknown;
      code?: unknown;
      room?: unknown;
      students?: unknown;
      status?: unknown;
    };

    const lecturerProfileId =
      currentUser.role === "lecturer"
        ? currentUser.lecturerProfile?.id
        : Number(body.lecturerProfileId);

    if (!lecturerProfileId || Number.isNaN(lecturerProfileId)) {
      return apiError(400, "Lecturer profile is required");
    }

    const date = typeof body.date === "string" ? body.date.trim() : "";
    const time = typeof body.time === "string" ? body.time.trim() : "";
    const course = typeof body.course === "string" ? body.course.trim() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";
    const room = typeof body.room === "string" ? body.room.trim() : "";
    const students = Number(body.students);

    if (!date || !time || !course || !code || !room || Number.isNaN(students) || students <= 0) {
      return apiError(400, "Invalid schedule payload");
    }

    const created = await prisma.schedule.create({
      data: {
        lecturerProfileId,
        date,
        timeSlot: time,
        course,
        courseCode: code,
        room,
        students,
        status: body.status === "postponed" ? "postponed" : "scheduled",
      },
    });

    return apiOk({ record: mapSchedule(created) }, 201);
  } catch (error) {
    console.error("Create schedule error", error);
    return apiError(500, "Failed to create schedule");
  }
}
