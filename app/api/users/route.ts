import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { requireAuth, sanitizeUser } from "@/lib/server/auth";
import { apiError, apiOk } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { registerSchema } from "@/lib/server/validation";

export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth();

    if (currentUser.role !== "admin" && currentUser.role !== "lecturer") {
      return apiError(403, "Forbidden");
    }

    const url = new URL(request.url);
    const role = url.searchParams.get("role") as Role | null;
    const q = url.searchParams.get("q")?.trim() || "";

    const users = await prisma.user.findMany({
      where: {
        role: role || undefined,
        OR: q
          ? [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ]
          : undefined,
      },
      orderBy: { createdAt: "desc" },
      include: {
        studentProfile: true,
        parentProfile: true,
        lecturerProfile: true,
        adminProfile: true,
      },
      take: 500,
    });

    return apiOk({ users: users.map((user) => sanitizeUser(user)) });
  } catch {
    return apiError(401, "Unauthorized");
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();

    if (currentUser.role !== "admin") {
      return apiError(403, "Only admins can create users");
    }

    const parsed = registerSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError(400, parsed.error.issues[0]?.message || "Invalid request");
    }

    const body = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return apiError(409, "Email already in use");
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    const created = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        name: body.name,
        role: body.role,
        phone: body.phone,
        studentProfile:
          body.role === "student" && body.studentId && body.batch
            ? {
                create: {
                  studentCode: body.studentId,
                  batch: body.batch,
                  department: body.department,
                },
              }
            : undefined,
        parentProfile:
          body.role === "parent" && body.childStudentId
            ? {
                create: {
                  childStudentCode: body.childStudentId,
                  relation: body.relation || "Parent",
                },
              }
            : undefined,
        lecturerProfile:
          body.role === "lecturer" && body.employeeId && body.department && body.position && body.qualification && body.specialization
            ? {
                create: {
                  employeeCode: body.employeeId,
                  department: body.department,
                  position: body.position,
                  qualification: body.qualification,
                  specialization: body.specialization,
                },
              }
            : undefined,
        adminProfile:
          body.role === "admin" && body.employeeId && body.department && body.position
            ? {
                create: {
                  employeeCode: body.employeeId,
                  department: body.department,
                  position: body.position,
                },
              }
            : undefined,
      },
      include: {
        studentProfile: true,
        parentProfile: true,
        lecturerProfile: true,
        adminProfile: true,
      },
    });

    return apiOk({ user: sanitizeUser(created) }, 201);
  } catch (error) {
    console.error("Create user error", error);
    return apiError(500, "Failed to create user");
  }
}
