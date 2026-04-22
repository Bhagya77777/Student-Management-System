import { requireAuth } from "@/lib/server/auth";
import { apiError, apiOk } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { normalizeNoticeAudience } from "@/lib/notice-utils";
import { parseNoticeInput } from "@/lib/server/notice-media";

export const runtime = "nodejs";

function mapNotice(notice: {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  targetAudience: string[];
  videoUrl: string | null;
  voiceUrl: string | null;
  status: string;
  publishedAt: Date | null;
  expiresAt: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: notice.id,
    title: notice.title,
    content: notice.content,
    category: notice.category,
    priority: notice.priority,
    targetAudience: notice.targetAudience,
    videoUrl: notice.videoUrl,
    voiceUrl: notice.voiceUrl,
    status: notice.status,
    publishedDate: notice.publishedAt
      ? notice.publishedAt.toISOString().split("T")[0]
      : null,
    expiresAt: notice.expiresAt,
    createdById: notice.createdById,
    createdAt: notice.createdAt.toISOString(),
    updatedAt: notice.updatedAt.toISOString(),
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
            status: "published" as const,
            AND: [
              {
                OR: [
                  { targetAudience: { has: currentUser.role } },
                  { targetAudience: { has: `${currentUser.role}s` } },
                  { targetAudience: { has: "all" } },
                ],
              },
              {
                OR: [{ expiresAt: null }, { expiresAt: { gte: today } }],
              },
            ],
          };

    const notices = await prisma.notice.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return apiOk({ notices: notices.map(mapNotice) });
  } catch {
    return apiError(401, "Unauthorized");
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();

    if (currentUser.role !== "admin") {
      return apiError(403, "Only admins can create notices");
    }

    const body = await parseNoticeInput(request);
    const title = body.title;
    const content = body.content;
    const category = body.category;
    const priority = body.priority;
    const targetAudience = body.targetAudience;
    const videoUrl = body.videoUrl;
    const voiceUrl = body.voiceUrl;
    const expiresAt = body.expiresAt;
    const status = body.status;

    if (!title || !content) {
      return apiError(400, "Title and content are required");
    }


    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        category: category as never,
        priority: priority as never,
        targetAudience: normalizeNoticeAudience(targetAudience),
        videoUrl: videoUrl && videoUrl.trim() !== "" ? videoUrl : null,
        voiceUrl: voiceUrl && voiceUrl.trim() !== "" ? voiceUrl : null,
        status: status as never,
        publishedAt: status === "published" ? new Date() : null,
        expiresAt: expiresAt && String(expiresAt).trim() !== "" ? String(expiresAt) : null,
        createdById: currentUser.id,
      },
    });

    return apiOk({ notice: mapNotice(notice) }, 201);
  } catch (error) {
    console.error("Create notice error", error);
    return apiError(500, "Failed to create notice");
  }
}
