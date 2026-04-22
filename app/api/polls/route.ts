import { requireAuth } from "@/lib/server/auth";
import { apiError, apiOk } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
 
function mapPoll(poll: {
  id: string;
  title: string;
  description: string | null;
  totalVotes: number;
  status: string;
  startDate: string;
  endDate: string;
  targetAudience: string[];
  createdAt: Date;
  updatedAt: Date;
  options: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
}) {
  return {
    id: poll.id,
    title: poll.title,
    description: poll.description,
    totalVotes: poll.totalVotes,
    status: poll.status,
    startDate: poll.startDate,
    endDate: poll.endDate,
    targetAudience: poll.targetAudience,
    options: poll.options,
    createdAt: poll.createdAt.toISOString(),
    updatedAt: poll.updatedAt.toISOString(),
  };
}

export async function GET() {
  try {
    const currentUser = await requireAuth();
    const today = new Date().toISOString().split("T")[0];

    const where =
      currentUser.role === "admin"
        ? undefined
        : {
            status: "active" as const,
            AND: [
              {
                OR: [
                  { targetAudience: { has: currentUser.role } },
                  { targetAudience: { has: "all" } },
                ],
              },
              { startDate: { lte: today } },
              { endDate: { gte: today } },
            ],
          };

    const polls = await prisma.poll.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { options: true },
    });
    return apiOk({ polls: polls.map((poll) => mapPoll(poll)) });
  } catch {
    return apiError(401, "Unauthorized");
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();
    if (currentUser.role !== "admin") {
      return apiError(403, "Only admins can create polls");
    }

    const body = (await request.json()) as {
      title?: unknown;
      description?: unknown;
      endDate?: unknown;
      options?: unknown;
      targetAudience?: unknown;
    };
    const title = String(body.title || "").trim();
    const description = typeof body.description === "string" ? body.description.trim() : null;
    const endDate = String(body.endDate || "").trim();
    const rawOptions = Array.isArray(body.options) ? body.options : [];
    const options = rawOptions
      .map((option: unknown) => String(option).trim())
      .filter((option): option is string => option.length > 0);
    const rawTargetAudience = Array.isArray(body.targetAudience) ? body.targetAudience : [];
    const targetAudience = rawTargetAudience.map((audience: unknown) => String(audience));

    if (!title || options.length < 2 || !endDate) {
      return apiError(400, "Title, at least two options, and an end date are required");
    }

    const poll = await prisma.poll.create({
      data: {
        title,
        description,
        endDate,
        startDate: new Date().toISOString().split("T")[0],
        targetAudience,
        createdById: currentUser.id,
        options: {
          create: options.map((optionText) => ({ text: optionText })),
        },
      },
      include: { options: true },
    });

    return apiOk({ poll: mapPoll(poll) }, 201);
  } catch (error) {
    console.error("Create poll error", error);
    return apiError(500, "Failed to create poll");
  }
}
