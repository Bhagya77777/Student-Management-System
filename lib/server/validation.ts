import { z } from "zod";

const roleSchema = z.enum(["student", "parent", "lecturer", "admin"]);
const statusSchema = z.enum(["active", "inactive"]);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: roleSchema.optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8),
  role: roleSchema,
  phone: z.string().min(7).max(20).optional(),
  studentId: z.string().min(4).max(30).optional(),
  batch: z.string().min(4).max(20).optional(),
  department: z.string().min(2).max(100).optional(),
  childStudentId: z.string().min(4).max(30).optional(),
  relation: z.string().min(2).max(40).optional(),
  employeeId: z.string().min(4).max(30).optional(),
  position: z.string().min(2).max(100).optional(),
  qualification: z.string().min(2).max(160).optional(),
  specialization: z.string().min(2).max(200).optional(),
  lecturerCode: z.string().optional(),
  adminCode: z.string().optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().min(7).max(20).nullable().optional(),
  address: z.string().max(255).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  status: statusSchema.optional(),
});

export const leaveCreateSchema = z.object({
  leaveType: z.enum(["medical", "personal", "academic", "emergency"]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().min(8).max(1000),
});

export const leaveDecisionSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  decisionNote: z.string().max(300).optional(),
  documentName: z.string().max(200).optional(),
});
