import { requireAuth, sanitizeUser } from "@/lib/server/auth";
import { apiError, apiOk } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";

export async function PATCH(request: Request) {
  try {
    const currentUser = await requireAuth();
    const body = (await request.json()) as {
      name?: unknown;
      phone?: unknown;
      address?: unknown;
      bio?: unknown;
      avatar?: unknown;
    };

    const data = {
      name: typeof body.name === "string" ? body.name.trim() : undefined,
      phone: typeof body.phone === "string" ? body.phone.trim() : undefined,
      address: typeof body.address === "string" ? body.address.trim() : undefined,
      bio: typeof body.bio === "string" ? body.bio.trim() : undefined,
      avatar: typeof body.avatar === "string" ? body.avatar.trim() : undefined,
    };

    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data,
      include: {
        studentProfile: true,
        parentProfile: true,
        lecturerProfile: true,
        adminProfile: true,
      },
    });

    return apiOk({ user: sanitizeUser(updated) });
  } catch {
    return apiError(401, "Unauthorized");
  }
}