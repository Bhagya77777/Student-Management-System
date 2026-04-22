import { requireAuth } from "@/lib/server/auth";
import { apiError, apiOk } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";

function mapPayment(payment: {
  id: string;
  category: string;
  name: string;
  description: string | null;
  amount: number;
  dueDate: string | null;
  paidDate: string | null;
  status: string;
  method: string | null;
  receiptNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
  student: {
    studentCode: string;
    user: { name: string };
  };
}) {
  return {
    id: payment.id,
    category: payment.category,
    name: payment.name,
    description: payment.description,
    amount: payment.amount,
    dueDate: payment.dueDate,
    paidDate: payment.paidDate,
    status: payment.status,
    method: payment.method,
    receipt: payment.receiptNumber,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
    studentName: payment.student.user.name,
    studentCode: payment.student.studentCode,
  };
}

export async function GET() {
  try {
    const currentUser = await requireAuth();

    const studentProfileId =
      currentUser.role === "student"
        ? currentUser.studentProfile?.id
        : currentUser.role === "parent"
          ? await prisma.studentProfile.findUnique({
              where: { studentCode: currentUser.parentProfile?.childStudentCode || "" },
              select: { id: true },
            }).then((student) => student?.id)
          : undefined;

    const payments = await prisma.payment.findMany({
      where: studentProfileId ? { studentProfileId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    const totalDue = payments.filter((payment) => payment.status === "pending").reduce((sum, payment) => sum + payment.amount, 0);
    const totalPaid = payments.filter((payment) => payment.status === "completed").reduce((sum, payment) => sum + payment.amount, 0);

    return apiOk({
      payments: payments.map(mapPayment),
      summary: {
        totalDue,
        totalPaid,
        pendingCount: payments.filter((payment) => payment.status === "pending").length,
        completedCount: payments.filter((payment) => payment.status === "completed").length,
      },
    });
  } catch {
    return apiError(401, "Unauthorized");
  }
}
