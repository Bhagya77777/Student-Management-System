import { requireAuth } from "@/lib/server/auth";
import { apiError, apiOk } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma"; 

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const optionId = String(body.optionId || "");

    if (!optionId) {
      return apiError(400, "Option is required");
    }

    const poll = await prisma.poll.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        startDate: true,
        endDate: true,
        targetAudience: true,
        options: { select: { id: true } },
      },
    });

    if (!poll) {
      return apiError(404, "Poll not found");
    }

    const hasOption = poll.options.some((option) => option.id === optionId);
    if (!hasOption) {
      return apiError(400, "Option does not belong to the poll");
    }

    if (currentUser.role !== "admin") {
      const isAudienceMatch =
        poll.targetAudience.includes(currentUser.role) || poll.targetAudience.includes("all");
      const today = new Date().toISOString().split("T")[0];
      const isWithinDateWindow = poll.startDate <= today && poll.endDate >= today;

      if (poll.status !== "active" || !isAudienceMatch || !isWithinDateWindow) {
        return apiError(403, "You are not allowed to vote on this poll");
      }
    }

    const option = await prisma.$transaction(async (tx) => {
      const updatedOption = await tx.pollOption.update({
        where: { id: optionId },
        data: { votes: { increment: 1 } },
      });

      await tx.poll.update({
        where: { id },
        data: { totalVotes: { increment: 1 } },
      });

      return updatedOption;
    });

    return apiOk({ option });
  } catch (error) {
    console.error("Vote poll error", error);
    return apiError(500, "Failed to vote on poll");
  }
}
