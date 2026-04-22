import { Role, UserStatus } from "@prisma/client";
import { requireAuth } from "@/lib/server/auth";
import { apiError, apiOk } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { userUpdateSchema } from "@/lib/server/validation";

function ensureAdmin(role: Role) {
  return role === "admin";
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    if (!ensureAdmin(currentUser.role)) {
      return apiError(403, "Only admins can update users");
    }

    const { id } = await context.params;
    const json = await request.json();
    const parsed = userUpdateSchema.safeParse(json);

    if (!parsed.success) {
      return apiError(400, parsed.error.issues[0]?.message || "Invalid update data");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone ?? undefined,
        address: parsed.data.address ?? undefined,
        bio: parsed.data.bio ?? undefined,
        status: (parsed.data.status as UserStatus | undefined) ?? undefined,
      },
      include: {
        studentProfile: true,
        parentProfile: true,
        lecturerProfile: true,
        adminProfile: true,
      },
    });

    return apiOk({ user: updated });
  } catch (error) {
    console.error("Update user error", error);
    return apiError(500, "Failed to update user");
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    if (!ensureAdmin(currentUser.role)) {
      return apiError(403, "Only admins can delete users");
    }

    const { id } = await context.params;

    if (id === currentUser.id) {
      return apiError(400, "You cannot delete your own admin account");
    }

    await prisma.user.delete({ where: { id } });
    return apiOk({ success: true });
  } catch (error) {
    console.error("Delete user error", error);
    return apiError(500, "Failed to delete user");
  }
}

