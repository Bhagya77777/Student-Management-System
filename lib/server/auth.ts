import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";

const COOKIE_NAME = "ub_auth";
const FALLBACK_SECRET = "dev-only-change-me-now";

function getSecret() {
  const secret = process.env.JWT_SECRET || FALLBACK_SECRET;
  return new TextEncoder().encode(secret);
}

export async function issueAuthCookie(payload: { userId: string; role: Role }) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function requireAuth() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const { payload } = await jwtVerify(token, getSecret());
  const userId = payload.userId as string | undefined;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
      parentProfile: true,
      lecturerProfile: true,
      adminProfile: true,
    },
  });

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export function sanitizeUser(user: {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone: string | null;
  address: string | null;
  bio: string | null;
  avatar: string | null;
  joinDate: Date;
  studentProfile?: {
    studentCode: string;
    batch: string;
    department: string | null;
    gpa: number;
    credits: number;
    totalCredits: number;
    advisor: string | null;
  } | null;
  parentProfile?: {
    childStudentCode: string;
    relation: string | null;
  } | null;
  lecturerProfile?: {
    employeeCode: string;
    department: string;
    position: string;
    qualification: string;
    specialization: string;
    office: string | null;
    officeHours: string | null;
  } | null;
  adminProfile?: {
    employeeCode: string;
    department: string;
    position: string;
  } | null;
}) {
  const base = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || undefined,
    address: user.address || undefined,
    bio: user.bio || undefined,
    avatar: user.avatar || undefined,
    joinDate: user.joinDate.toISOString().split("T")[0],
  };

  if (user.role === "student" && user.studentProfile) {
    return {
      ...base,
      role: "student" as const,
      studentId: user.studentProfile.studentCode,
      batch: user.studentProfile.batch,
      department: user.studentProfile.department || undefined,
      gpa: user.studentProfile.gpa,
      credits: user.studentProfile.credits,
      totalCredits: user.studentProfile.totalCredits,
      advisor: user.studentProfile.advisor || undefined,
    };
  }

  if (user.role === "parent" && user.parentProfile) {
    return {
      ...base,
      role: "parent" as const,
      childStudentId: user.parentProfile.childStudentCode,
      relation: user.parentProfile.relation || undefined,
    };
  }

  if (user.role === "lecturer" && user.lecturerProfile) {
    return {
      ...base,
      role: "lecturer" as const,
      employeeId: user.lecturerProfile.employeeCode,
      department: user.lecturerProfile.department,
      position: user.lecturerProfile.position,
      qualification: user.lecturerProfile.qualification,
      expertise: user.lecturerProfile.specialization.split(",").map((item) => item.trim()),
      courses: [],
      office: user.lecturerProfile.office || "",
      officeHours: user.lecturerProfile.officeHours || "",
    };
  }

  if (user.role === "admin" && user.adminProfile) {
    return {
      ...base,
      role: "admin" as const,
      employeeId: user.adminProfile.employeeCode,
      position: user.adminProfile.position,
      department: user.adminProfile.department,
      permissions: ["User Management", "Leave Approvals", "Reports"],
      managedModules: ["Users", "Leave", "Attendance", "Marks"],
    };
  }

  return base;
}
