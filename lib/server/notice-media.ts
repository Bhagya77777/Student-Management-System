import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const NOTICE_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "notices");

const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const AUDIO_MIME_TYPES = new Set(["audio/mpeg", "audio/mp3", "audio/mp4", "audio/aac", "audio/wav", "audio/webm", "audio/ogg"]);

const EXTENSION_BY_MIME: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/mp4": ".m4a",
  "audio/aac": ".aac",
  "audio/wav": ".wav",
  "audio/webm": ".webm",
  "audio/ogg": ".ogg",
};

export type NoticeMediaKind = "video" | "audio";

export type ParsedNoticeInput = {
  title: string;
  content: string;
  category: string;
  priority: string;
  targetAudience: string[];
  status: string;
  expiresAt: string | null;
  videoUrl: string | null;
  voiceUrl: string | null;
  videoProvided: boolean;
  voiceProvided: boolean;
};

function isFormFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && "arrayBuffer" in value;
}

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isAllowedMediaType(kind: NoticeMediaKind, mimeType: string) {
  return kind === "video" ? VIDEO_MIME_TYPES.has(mimeType) : AUDIO_MIME_TYPES.has(mimeType);
}

function getExtensionFromFile(file: File, mimeType: string, kind: NoticeMediaKind) {
  const fromMime = EXTENSION_BY_MIME[mimeType];
  if (fromMime) {
    return fromMime;
  }

  const fromName = path.extname(file.name).toLowerCase();
  if (fromName) {
    return fromName;
  }

  return kind === "video" ? ".mp4" : ".mp3";
}

export async function saveNoticeMediaFile(file: File, kind: NoticeMediaKind) {
  if (!file.size) {
    throw new Error(`The selected ${kind} file is empty.`);
  }

  const mimeType = file.type.toLowerCase();
  if (!isAllowedMediaType(kind, mimeType)) {
    throw new Error(`Unsupported ${kind} format. Please upload a standard media file.`);
  }

  await fs.mkdir(NOTICE_UPLOAD_DIR, { recursive: true });

  const extension = getExtensionFromFile(file, mimeType, kind);
  const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const filePath = path.join(NOTICE_UPLOAD_DIR, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(filePath, buffer);
  return `/uploads/notices/${fileName}`;
}

export async function deleteNoticeMediaFile(mediaUrl?: string | null) {
  if (!mediaUrl || !mediaUrl.startsWith("/uploads/notices/")) {
    return;
  }

  const fileName = path.basename(mediaUrl);
  const filePath = path.join(NOTICE_UPLOAD_DIR, fileName);

  try {
    await fs.unlink(filePath);
  } catch {
    // Ignore missing files so notice deletes stay idempotent.
  }
}

async function resolveMediaValue(value: FormDataEntryValue | null, kind: NoticeMediaKind) {
  if (isFormFile(value)) {
    return saveNoticeMediaFile(value, kind);
  }

  const text = normalizeText(value);
  return text.length > 0 ? text : null;
}

export async function parseNoticeInput(request: Request): Promise<ParsedNoticeInput> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const targetAudience = formData.getAll("targetAudience").map((item) => String(item));
    const videoEntry = formData.get("videoFile");
    const voiceEntry = formData.get("voiceFile");

    return {
      title: normalizeText(formData.get("title")),
      content: normalizeText(formData.get("content")),
      category: normalizeText(formData.get("category")) || "general",
      priority: normalizeText(formData.get("priority")) || "medium",
      targetAudience,
      status: normalizeText(formData.get("status")) || "draft",
      expiresAt: normalizeText(formData.get("expiresAt")) || null,
      videoUrl: await resolveMediaValue(videoEntry, "video"),
      voiceUrl: await resolveMediaValue(voiceEntry, "audio"),
      videoProvided: videoEntry !== null,
      voiceProvided: voiceEntry !== null,
    };
  }

  const body = await request.json();

  return {
    title: String(body.title || "").trim(),
    content: String(body.content || "").trim(),
    category: String(body.category || "general"),
    priority: String(body.priority || "medium"),
    targetAudience: Array.isArray(body.targetAudience) ? body.targetAudience.map(String) : [],
    status: String(body.status || "draft"),
    expiresAt: typeof body.expiresAt === "string" && body.expiresAt ? body.expiresAt : null,
    videoUrl: typeof body.videoUrl === "string" && body.videoUrl.trim() ? body.videoUrl.trim() : null,
    voiceUrl: typeof body.voiceUrl === "string" && body.voiceUrl.trim() ? body.voiceUrl.trim() : null,
    videoProvided: typeof body.videoUrl === "string" || Boolean(body.videoFile),
    voiceProvided: typeof body.voiceUrl === "string" || Boolean(body.voiceFile),
  };
}