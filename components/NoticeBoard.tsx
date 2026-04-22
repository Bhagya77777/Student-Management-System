'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Check, X } from 'lucide-react';
import { Video, Mic } from 'lucide-react';
import { normalizeNoticeAudience, formatNoticeAudienceLabel, noticeTargetsRole } from '@/lib/notice-utils';

interface Notice {
  id: string;
  title: string;
  content: string;
  author: string;
  date: Date;
  isRead: boolean;
  isAcknowledged?: boolean;
  targetAudience: string[];
  videoUrl?: string | null;
  voiceUrl?: string | null;
  status: string;
  expiresAt?: string | null;
}

interface NoticeBoardProps {
  targetAudience?: string;
  maxNotices?: number;
  isAdmin?: boolean;
}

function toDateOnly(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const direct = value.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(direct)) {
    return direct;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function NoticeBoard({ targetAudience, maxNotices = 5, isAdmin = false }: NoticeBoardProps) {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const response = await fetch('/api/notices', { credentials: 'include' });
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setNotices((data.notices || []).map((notice: any) => ({
          id: notice.id,
          title: notice.title,
          content: notice.content,
          author: notice.category,
          date: notice.publishedDate ? new Date(notice.publishedDate) : new Date(notice.createdAt),
          isRead: false,
          isAcknowledged: false,
          targetAudience: Array.isArray(notice.targetAudience) ? normalizeNoticeAudience(notice.targetAudience.map(String)) : [],
          videoUrl: typeof notice.videoUrl === 'string' ? notice.videoUrl : null,
          voiceUrl: typeof notice.voiceUrl === 'string' ? notice.voiceUrl : null,
          status: String(notice.status || ''),
          expiresAt: typeof notice.expiresAt === 'string' ? notice.expiresAt : null,
        })));
      } catch {
        setNotices([]);
      }
    };

    void loadNotices();
  }, []);

  const filteredNotices = notices
    .filter((notice) => {
      if (isAdmin) {
        return true;
      }

      const role = user?.role;
      if (!role || notice.status !== 'published') {
        return false;
      }

      const audienceMatch = noticeTargetsRole(notice.targetAudience, role);
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const expiry = toDateOnly(notice.expiresAt);
      const notExpired = !expiry || expiry >= today;
      const propAudienceMatch = !targetAudience || noticeTargetsRole(notice.targetAudience, targetAudience);

      return audienceMatch && notExpired && propAudienceMatch;
    })
    .slice(0, maxNotices);

  const handleMarkAsRead = (id: string) => {
    setNotices((prev) =>
      prev.map((notice) =>
        notice.id === id ? { ...notice, isRead: true } : notice
      )
    );
  };

  const handleAcknowledge = (id: string) => {
    setNotices((prev) =>
      prev.map((notice) =>
        notice.id === id
          ? { ...notice, isRead: true, isAcknowledged: true }
          : notice
      )
    );
  };

  const unreadCount = filteredNotices.filter((n) => !n.isRead).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <CardTitle>Notice Board</CardTitle>
            {unreadCount > 0 && (
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          {isAdmin && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              New Notice
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {filteredNotices.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No notices available</p>
        ) : (
          <div className="space-y-3">
            {filteredNotices.map((notice) => (
              <div
                key={notice.id}
                className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                  notice.isRead
                    ? 'border-slate-200 bg-slate-50'
                    : 'border-blue-200 bg-blue-50'
                }`}
                onClick={() => {
                  setSelectedNotice(notice);
                  handleMarkAsRead(notice.id);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{notice.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                      {notice.content}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>{notice.author}</span>
                      <span>
                        {notice.date.toLocaleDateString()}
                      </span>
                    </div>
                    {(notice.videoUrl || notice.voiceUrl) && (
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {notice.videoUrl && <a href={notice.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-blue-700"><Video className="h-3 w-3" /> Video</a>}
                        {notice.voiceUrl && <a href={notice.voiceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700"><Mic className="h-3 w-3" /> Voice</a>}
                      </div>
                    )}
                  </div>
                  {!notice.isRead && (
                    <div className="ml-2 h-2 w-2 rounded-full bg-blue-600 shrink-0"></div>
                  )}
                </div>

                {notice.isAcknowledged && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                    <Check className="h-3 w-3" />
                    Acknowledged
                  </div>
                )}

                {selectedNotice?.id === notice.id && !notice.isAcknowledged && (
                  <div className="mt-3 border-t pt-3 text-sm text-slate-700">
                    <p>{notice.content}</p>
                    {(notice.videoUrl || notice.voiceUrl) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {notice.videoUrl && <a href={notice.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700"><Video className="h-3 w-3" /> Open video</a>}
                        {notice.voiceUrl && <a href={notice.voiceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700"><Mic className="h-3 w-3" /> Open voice clip</a>}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-slate-500">Audience: {notice.targetAudience.map(formatNoticeAudienceLabel).join(', ') || 'None'}</p>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcknowledge(notice.id);
                      }}
                      size="sm"
                      className="mt-3 bg-green-600 hover:bg-green-700"
                    >
                      Acknowledge
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
