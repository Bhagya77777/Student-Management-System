import { requireAuth } from "@/lib/server/auth";
import { apiError, apiOk } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    if (currentUser.role !== "admin" && currentUser.role !== "lecturer") {
      return apiError(403, "Forbidden");
    }

    const { id } = await params;
    await prisma.attendanceRecord.delete({ where: { id } });
    return apiOk({ deleted: true });
  } catch (error) {
    console.error("Delete attendance error", error);
    return apiError(500, "Failed to delete attendance record");
  }
}
