import { requireAuth } from "@/lib/server/auth";
import { apiError, apiOk } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    if (currentUser.role !== "admin") {
      return apiError(403, "Only admins can update polls");
    }

    const { id } = await params;
    const body = await request.json();
    const status = body.status === "completed" ? "completed" : "active";

    const poll = await prisma.poll.update({
      where: { id },
      data: { status },
      include: { options: true },
    });

    return apiOk({ poll });
  } catch (error) {
    console.error("Update poll error", error);
    return apiError(500, "Failed to update poll");
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    if (currentUser.role !== "admin") {
      return apiError(403, "Only admins can delete polls");
    }

    const { id } = await params;
    await prisma.poll.delete({ where: { id } });
    return apiOk({ deleted: true });
  } catch (error) {
    console.error("Delete poll error", error);
    return apiError(500, "Failed to delete poll");
  }
}
