import bcrypt from "bcryptjs";
import { apiError, apiOk } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { loginSchema } from "@/lib/server/validation";
import { issueAuthCookie, sanitizeUser } from "@/lib/server/auth";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = loginSchema.safeParse(json);

    if (!parsed.success) {
      return apiError(400, parsed.error.issues[0]?.message || "Invalid login payload");
    }

    const { email, password, role } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        parentProfile: true,
        lecturerProfile: true,
        adminProfile: true,
      },
    });

    if (!user) {
      return apiError(401, "Invalid email or password");
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return apiError(401, "Invalid email or password");
    }

    if (role && user.role !== role) {
      return apiError(403, `This account is not registered as a ${role}.`);
    }

    await issueAuthCookie({ userId: user.id, role: user.role });
    return apiOk({ user: sanitizeUser(user) });
  } catch (error) {
    console.error("Login error", error);
    return apiError(500, "Failed to login");
  }
}
