import { requireAuth } from "@/lib/server/auth";
import { apiError, apiOk } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { leaveDecisionSchema } from "@/lib/server/validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();

    if (currentUser.role !== "parent" && currentUser.role !== "lecturer" && currentUser.role !== "admin") {
      return apiError(403, "Only parent/lecturer/admin can review leaves");
    }

    const { id } = await context.params;
    const parsed = leaveDecisionSchema.safeParse(await request.json());

    if (!parsed.success) {
      return apiError(400, parsed.error.issues[0]?.message || "Invalid decision payload");
    }

    if (parsed.data.status === "approved" && !parsed.data.documentName?.trim()) {
      return apiError(400, "Supporting document is required when approving a leave request");
    }

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { student: true },
    });

    if (!leave) {
      return apiError(404, "Leave request not found");
    }

    if (
      currentUser.role === "parent" &&
      leave.student.studentCode !== currentUser.parentProfile?.childStudentCode
    ) {
      return apiError(403, "You can only review your child's leave requests");
    }

    if (
      currentUser.role === "lecturer" &&
      leave.student.department !== currentUser.lecturerProfile?.department
    ) {
      return apiError(403, "You can only review leave requests in your department");
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: parsed.data.status,
        decisionNote: parsed.data.decisionNote,
        documentName: parsed.data.status === "approved" ? parsed.data.documentName?.trim() : leave.documentName,
        decidedAt: new Date(),
      },
    });

    return apiOk({ leave: updated });
  } catch (error) {
    console.error("Update leave status error", error);
    return apiError(500, "Failed to update leave status");
  }
}
