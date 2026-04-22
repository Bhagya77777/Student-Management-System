import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { apiError, apiOk } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { registerSchema } from "@/lib/server/validation";
import { issueAuthCookie, sanitizeUser } from "@/lib/server/auth";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = registerSchema.safeParse(json);

    if (!parsed.success) {
      return apiError(400, parsed.error.issues[0]?.message || "Invalid request body");
    }

    const body = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return apiError(409, "Email already registered");
    }

    if (body.role === "lecturer" && body.lecturerCode !== "LECT2024") {
      return apiError(400, "Invalid lecturer registration code");
    }

    if (body.role === "admin" && body.adminCode !== "ADMIN2024") {
      return apiError(400, "Invalid admin registration code");
    }

    const requiredByRole: Record<Role, string[]> = {
      student: ["studentId", "batch"],
      parent: ["childStudentId"],
      lecturer: ["employeeId", "department", "position", "qualification", "specialization"],
      admin: ["employeeId", "department", "position"],
    };

    for (const key of requiredByRole[body.role]) {
      if (!body[key as keyof typeof body]) {
        return apiError(400, `Missing required field: ${key}`);
      }
    }

    if (body.role === "parent") {
      const child = await prisma.studentProfile.findUnique({
        where: { studentCode: body.childStudentId as string },
      });
      if (!child) {
        return apiError(404, "Child student was not found");
      }
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    const createdUser = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        name: body.name,
        role: body.role,
        phone: body.phone,
        studentProfile:
          body.role === "student"
            ? {
                create: {
                  studentCode: body.studentId as string,
                  batch: body.batch as string,
                  department: body.department,
                },
              }
            : undefined,
        parentProfile:
          body.role === "parent"
            ? {
                create: {
                  childStudentCode: body.childStudentId as string,
                  relation: body.relation || "Parent",
                },
              }
            : undefined,
        lecturerProfile:
          body.role === "lecturer"
            ? {
                create: {
                  employeeCode: body.employeeId as string,
                  department: body.department as string,
                  position: body.position as string,
                  qualification: body.qualification as string,
                  specialization: body.specialization as string,
                },
              }
            : undefined,
        adminProfile:
          body.role === "admin"
            ? {
                create: {
                  employeeCode: body.employeeId as string,
                  department: body.department as string,
                  position: body.position as string,
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

    await issueAuthCookie({ userId: createdUser.id, role: createdUser.role });
    return apiOk({ user: sanitizeUser(createdUser) }, 201);
  } catch (error) {
    console.error("Register error", error);
    return apiError(500, "Failed to register user");
  }
}
