"use client";
 
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { parentSidebarItems } from "@/components/sidebar/parentSidebarItems";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay, parseISO } from "date-fns";
import { Bell, CalendarDays, CheckCircle2, Clock, Loader2 } from "lucide-react";

type Notice = {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  targetAudience: string[];
  status: string;
  publishedDate: string | null;
  expiresAt: string | null;
};

export default function ParentNoticesPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [readNotices, setReadNotices] = useState<string[]>([]);

  useEffect(() => {
    const loadNotices = async () => {
      setLoading(true);
      const response = await fetch("/api/notices", { credentials: "include" });
      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = (await response.json()) as { notices?: Notice[] };
      setNotices(data.notices ?? []);
      setLoading(false);
    };

    void loadNotices();
  }, []);

  const visibleNotices = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return notices.filter((notice) => {
      if (notice.status !== "published") {
        return false;
      }

      const isAudienceMatch = notice.targetAudience.includes("parent") || notice.targetAudience.includes("all");
      const isNotExpired = !notice.expiresAt || notice.expiresAt >= today;
      return isAudienceMatch && isNotExpired;
    });
  }, [notices]);

  const highlightedDays = useMemo(
    () => visibleNotices.filter((notice) => notice.publishedDate).map((notice) => ({ date: parseISO(notice.publishedDate as string), title: notice.title })),
    [visibleNotices]
  );

  const filteredNotices = useMemo(
    () => visibleNotices.filter((notice) => (selectedDate && notice.publishedDate ? isSameDay(parseISO(notice.publishedDate), selectedDate) : true)),
    [visibleNotices, selectedDate]
  );

  const stats = {
    total: visibleNotices.length,
    unread: visibleNotices.filter((notice) => !readNotices.includes(notice.id)).length,
    events: visibleNotices.filter((notice) => notice.category === "event").length,
    deadlines: visibleNotices.filter((notice) => notice.category === "deadline").length,
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={parentSidebarItems} activeItem="notices" />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Notice Board" />

          <main className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Parent Notices</h2>
                <p className="text-gray-500 text-sm mt-1">Stay updated with important announcements and events</p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Total</p><p className="text-2xl font-bold text-gray-900">{stats.total}</p></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Unread</p><p className="text-2xl font-bold text-orange-600">{stats.unread}</p></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Events</p><p className="text-2xl font-bold text-green-600">{stats.events}</p></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Deadlines</p><p className="text-2xl font-bold text-blue-600">{stats.deadlines}</p></CardContent></Card>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <Card className="col-span-1 border-0 shadow-sm h-fit">
                  <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Calendar</CardTitle></CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-lg"
                      modifiers={{ highlighted: (date) => highlightedDays.some((item) => isSameDay(item.date, date)) }}
                      modifiersClassNames={{ highlighted: "bg-blue-100 hover:bg-blue-200" }}
                    />
                  </CardContent>
                </Card>

                <Card className="col-span-2 border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">Notices</CardTitle>
                      <div className="flex items-center gap-2 text-xs text-gray-500"><CalendarDays className="h-3 w-3" /> {selectedDate ? format(selectedDate, "MMM d") : "All"}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading notices</div>
                    ) : (
                      <div className="space-y-3">
                        {filteredNotices.map((notice) => (
                          <button key={notice.id} onClick={() => setReadNotices((current) => (current.includes(notice.id) ? current : [...current, notice.id]))} className="w-full rounded-xl border border-gray-100 p-4 text-left hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-gray-900">{notice.title}</h3>
                                  <Badge className="bg-blue-100 text-blue-700">{notice.category}</Badge>
                                  <Badge className={notice.priority === "high" ? "bg-red-100 text-red-700" : notice.priority === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}>{notice.priority}</Badge>
                                  {readNotices.includes(notice.id) && <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle2 className="mr-1 h-3 w-3" /> Read</Badge>}
                                </div>
                                <p className="mt-2 text-sm text-gray-600">{notice.content}</p>
                              </div>
                              <Clock className="h-4 w-4 text-gray-400" />
                            </div>
                          </button>
                        ))}
                        {filteredNotices.length === 0 && <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">No notices for the selected date.</div>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
