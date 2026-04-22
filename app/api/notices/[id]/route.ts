import { requireAuth } from "@/lib/server/auth";
import { apiError, apiOk } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { normalizeNoticeAudience } from "@/lib/notice-utils";
import { deleteNoticeMediaFile, parseNoticeInput } from "@/lib/server/notice-media";

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
    publishedDate: notice.publishedAt ? notice.publishedAt.toISOString().split("T")[0] : null,
    expiresAt: notice.expiresAt,
    createdById: notice.createdById,
    createdAt: notice.createdAt.toISOString(),
    updatedAt: notice.updatedAt.toISOString(),
  };
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    if (currentUser.role !== "admin") {
      return apiError(403, "Only admins can update notices");
    }

    const { id } = await params;
    const existingNotice = await prisma.notice.findUnique({
      where: { id },
      select: {
        videoUrl: true,
        voiceUrl: true,
      },
    });

    if (!existingNotice) {
      return apiError(404, "Notice not found");
    }

    const body = await parseNoticeInput(request);

    const updated = await prisma.notice.update({
      where: { id },
      data: {
        title: body.title || undefined,
        content: body.content || undefined,
        category: body.category ? (body.category as never) : undefined,
        priority: body.priority ? (body.priority as never) : undefined,
        targetAudience: body.targetAudience.length > 0 ? normalizeNoticeAudience(body.targetAudience) : undefined,
        videoUrl: body.videoUrl,
        voiceUrl: body.voiceUrl,
        status: body.status ? (body.status as never) : undefined,
        publishedAt: body.status === "published" ? new Date() : undefined,
        expiresAt: body.expiresAt,
      },
    });

    if (body.videoProvided && existingNotice.videoUrl && existingNotice.videoUrl !== updated.videoUrl) {
      await deleteNoticeMediaFile(existingNotice.videoUrl);
    }

    if (body.voiceProvided && existingNotice.voiceUrl && existingNotice.voiceUrl !== updated.voiceUrl) {
      await deleteNoticeMediaFile(existingNotice.voiceUrl);
    }

    return apiOk({ notice: mapNotice(updated) });
  } catch (error) {
    console.error("Update notice error", error);
    return apiError(500, "Failed to update notice");
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    if (currentUser.role !== "admin") {
      return apiError(403, "Only admins can delete notices");
    }

    const { id } = await params;
    const existingNotice = await prisma.notice.findUnique({
      where: { id },
      select: { videoUrl: true, voiceUrl: true },
    });

    await prisma.notice.delete({ where: { id } });

    await deleteNoticeMediaFile(existingNotice?.videoUrl);
    await deleteNoticeMediaFile(existingNotice?.voiceUrl);

    return apiOk({ deleted: true });
  } catch (error) {
    console.error("Delete notice error", error);
    return apiError(500, "Failed to delete notice");
  }
}
