"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { adminSidebarItems } from "@/components/sidebar/adminSidebarItems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Send, Trash2, Loader2, Video, Mic } from "lucide-react";
import { format } from "date-fns";
import { formatNoticeAudienceLabel } from "@/lib/notice-utils";

type Notice = {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  targetAudience: string[];
  videoUrl: string | null;
  voiceUrl: string | null;
  status: string;
  publishedDate: string | null;
  expiresAt: string | null;
};

const categoryOptions = ["exam", "event", "general", "deadline"];
const priorityOptions = ["high", "medium", "low"];
const audienceOptions = ["students", "parents", "lecturers", "all"];

export default function AdminNoticesPage() {
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const voiceInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
    priority: "medium",
    targetAudience: ["students"] as string[],
    videoUrl: "",
    voiceUrl: "",
    expiresAt: "",
  });

  const loadNotices = async () => {
    setLoading(true);
    const response = await fetch("/api/notices", { credentials: "include" });
    if (response.ok) {
      const data = (await response.json()) as { notices?: Notice[] };
      setNotices(data.notices ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadNotices();
  }, []);

  const createNotice = async () => {
    setSaving(true);

    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("content", formData.content);
      payload.append("category", formData.category);
      payload.append("priority", formData.priority);
      payload.append("status", "draft");
      payload.append("expiresAt", formData.expiresAt);

      for (const audience of formData.targetAudience) {
        payload.append("targetAudience", audience);
      }


      if (videoFile) {
        payload.append("videoFile", videoFile);
      } else if (formData.videoUrl.trim() !== "") {
        payload.append("videoUrl", formData.videoUrl.trim());
      }

      if (voiceFile) {
        payload.append("voiceFile", voiceFile);
      } else if (formData.voiceUrl.trim() !== "") {
        payload.append("voiceUrl", formData.voiceUrl.trim());
      }

      const response = await fetch("/api/notices", {
        method: "POST",
        credentials: "include",
        body: payload,
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({
          title: "",
          content: "",
          category: "general",
          priority: "medium",
          targetAudience: ["students"],
          videoUrl: "",
          voiceUrl: "",
          expiresAt: "",
        });
        setVideoFile(null);
        setVoiceFile(null);
        if (videoInputRef.current) {
          videoInputRef.current.value = "";
        }
        if (voiceInputRef.current) {
          voiceInputRef.current.value = "";
        }
        await loadNotices();
      }
    } finally {
      setSaving(false);
    }
  };

  const publishNotice = async (id: string) => {
    // Find the notice to publish
    const notice = notices.find((n) => n.id === id);
    if (!notice) return;

    await fetch(`/api/notices/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: notice.title,
        content: notice.content,
        category: notice.category,
        priority: notice.priority,
        targetAudience: notice.targetAudience,
        videoUrl: notice.videoUrl,
        voiceUrl: notice.voiceUrl,
        expiresAt: notice.expiresAt,
        status: "published",
      }),
    });
    await loadNotices();
  };

  const deleteNotice = async (id: string) => {
    await fetch(`/api/notices/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    await loadNotices();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={adminSidebarItems} activeItem="notices" />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Notice Management" />

          <main className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Notice Board
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Create and manage announcements
                  </p>
                </div>
                <Button
                  onClick={() => setShowForm((value) => !value)}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" /> New Notice
                </Button>
              </div>

              {showForm && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">
                      Create Notice
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Title
                      </Label>
                      <Input
                        value={formData.title}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            title: event.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Content
                      </Label>
                      <Textarea
                        value={formData.content}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            content: event.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Category
                        </Label>
                        <select
                          value={formData.category}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              category: event.target.value,
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        >
                          {categoryOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Priority
                        </Label>
                        <select
                          value={formData.priority}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              priority: event.target.value,
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        >
                          {priorityOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Expires At
                        </Label>
                        <Input
                          type="date"
                          value={formData.expiresAt}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              expiresAt: event.target.value,
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Video className="h-4 w-4" /> Video File
                        </Label>
                        <Input
                          ref={videoInputRef}
                          type="file"
                          accept="video/*"
                          onChange={(event) =>
                            setVideoFile(event.target.files?.[0] ?? null)
                          }
                          className="mt-1"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          {videoFile
                            ? `Selected: ${videoFile.name}`
                            : "Upload an MP4, WebM, or MOV file."}
                        </p>
                        <Label className="mt-3 block text-xs font-medium text-gray-500">
                          Optional video link fallback
                        </Label>
                        <Input
                          value={formData.videoUrl}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              videoUrl: event.target.value,
                            })
                          }
                          placeholder="https://...mp4 or YouTube link"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Mic className="h-4 w-4" /> Voice Clip File
                        </Label>
                        <Input
                          ref={voiceInputRef}
                          type="file"
                          accept="audio/*"
                          onChange={(event) =>
                            setVoiceFile(event.target.files?.[0] ?? null)
                          }
                          className="mt-1"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          {voiceFile
                            ? `Selected: ${voiceFile.name}`
                            : "Upload an MP3, M4A, WAV, WebM, or OGG file."}
                        </p>
                        <Label className="mt-3 block text-xs font-medium text-gray-500">
                          Optional audio link fallback
                        </Label>
                        <Input
                          value={formData.voiceUrl}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              voiceUrl: event.target.value,
                            })
                          }
                          placeholder="https://...mp3 or audio link"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {audienceOptions.map((option) => (
                        <Button
                          key={option}
                          type="button"
                          variant={
                            formData.targetAudience.includes(option)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            setFormData((current) => ({
                              ...current,
                              targetAudience: current.targetAudience.includes(
                                option,
                              )
                                ? current.targetAudience.filter(
                                    (entry) => entry !== option,
                                  )
                                : [...current.targetAudience, option],
                            }))
                          }
                        >
                          {formatNoticeAudienceLabel(option)}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={createNotice}
                        disabled={saving}
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4" />{" "}
                        {saving ? "Saving" : "Save"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  {loading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading
                      notices
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notices.map((notice) => (
                        <div
                          key={notice.id}
                          className="rounded-xl border border-gray-100 p-4 flex items-start justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-gray-900">
                                {notice.title}
                              </p>
                              <Badge className="bg-blue-100 text-blue-700">
                                {notice.category}
                              </Badge>
                              <Badge
                                className={
                                  notice.status === "published"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }
                              >
                                {notice.status}
                              </Badge>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">
                              {notice.content}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                              <span className="rounded-full bg-gray-100 px-2 py-1">
                                Audience:{" "}
                                {notice.targetAudience
                                  .map(formatNoticeAudienceLabel)
                                  .join(", ") || "None"}
                              </span>
                              {notice.videoUrl && (
                                <a
                                  href={notice.videoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-blue-700"
                                >
                                  <Video className="h-3 w-3" /> Video
                                </a>
                              )}
                              {notice.voiceUrl && (
                                <a
                                  href={notice.voiceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700"
                                >
                                  <Mic className="h-3 w-3" /> Voice
                                </a>
                              )}
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                              {notice.expiresAt
                                ? `Expires ${notice.expiresAt}`
                                : "No expiry"}{" "}
                              {notice.publishedDate
                                ? ` | Published ${format(new Date(notice.publishedDate), "yyyy-MM-dd")}`
                                : ""}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {notice.status !== "published" && (
                              <Button
                                size="sm"
                                onClick={() => publishNotice(notice.id)}
                                className="gap-1 bg-green-600 hover:bg-green-700"
                              >
                                <Send className="h-3 w-3" /> Publish
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteNotice(notice.id)}
                              className="gap-1 text-red-600"
                            >
                              <Trash2 className="h-3 w-3" /> Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                      {notices.length === 0 && (
                        <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                          No notices found.
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
