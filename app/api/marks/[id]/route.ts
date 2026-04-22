import { requireAuth } from "@/lib/server/auth";
import { apiError, apiOk } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    if (currentUser.role !== "admin" && currentUser.role !== "lecturer") {
      return apiError(403, "Forbidden");
    }

    const { id } = await params;
    const existing = await prisma.markRecord.findUnique({
      where: { id },
      include: {
        student: true,
      },
    });

    if (!existing) {
      return apiError(404, "Mark record not found");
    }

    if (
      currentUser.role === "lecturer" &&
      existing.student.department !== currentUser.lecturerProfile?.department
    ) {
      return apiError(403, "You can only manage marks for students in your department");
    }

    const body = (await request.json()) as {
      subject?: unknown;
      assessment?: unknown;
      score?: unknown;
      maxScore?: unknown;
      examDate?: unknown;
    };

    const score = Number(body.score);
    const maxScore = Number(body.maxScore);

    if (Number.isNaN(score) || Number.isNaN(maxScore) || maxScore <= 0) {
      return apiError(400, "Invalid score or max score");
    }

    const updated = await prisma.markRecord.update({
      where: { id },
      data: {
        subject: typeof body.subject === "string" ? body.subject.trim() : undefined,
        assessment: typeof body.assessment === "string" ? body.assessment.trim() : undefined,
        score,
        maxScore,
        examDate: typeof body.examDate === "string" ? body.examDate : undefined,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    return apiOk({
      record: {
        id: updated.id,
        subject: updated.subject,
        assessment: updated.assessment,
        score: updated.score,
        maxScore: updated.maxScore,
        examDate: updated.examDate,
        createdAt: updated.createdAt.toISOString(),
        studentName: updated.student.user.name,
        studentCode: updated.student.studentCode,
        batch: updated.student.batch,
        department: updated.student.department,
      },
    });
  } catch (error) {
    console.error("Update mark error", error);
    return apiError(500, "Failed to update mark record");
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    if (currentUser.role !== "admin" && currentUser.role !== "lecturer") {
      return apiError(403, "Forbidden");
    }

    const { id } = await params;
    const existing = await prisma.markRecord.findUnique({
      where: { id },
      include: {
        student: true,
      },
    });

    if (!existing) {
      return apiError(404, "Mark record not found");
    }

    if (
      currentUser.role === "lecturer" &&
      existing.student.department !== currentUser.lecturerProfile?.department
    ) {
      return apiError(403, "You can only manage marks for students in your department");
    }

    await prisma.markRecord.delete({ where: { id } });
    return apiOk({ deleted: true });
  } catch (error) {
    console.error("Delete mark error", error);
    return apiError(500, "Failed to delete mark record");
  }
}
