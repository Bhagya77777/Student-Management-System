"use client";

import { useEffect, useMemo, useState } from "react";
import { format, isWithinInterval } from "date-fns";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { studentSidebarItems } from "@/components/sidebar/studentSidebarItems";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, CalendarDays, CheckCircle, Clock, Send } from "lucide-react";
 
type Leave = {
  id: string;
  type: string;
  leaveType: "medical" | "personal" | "academic" | "emergency";
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected";
  reason: string;
  appliedDate: string;
  documentName?: string | null;
};

function parseDateOnlyLocal(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getTomorrowDateOnly() {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function StudentLeavePage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [submitting, setSubmitting] = useState(false);
  const tomorrowDate = getTomorrowDateOnly();

  const [form, setForm] = useState({
    leaveType: "medical" as Leave["leaveType"],
    startDate: tomorrowDate,
    endDate: tomorrowDate,
    reason: "",
  });

  async function loadLeaves() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/leaves");
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || "Failed to fetch leave data");
      }
      setLeaves(json.leaves || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leaves");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaves();
  }, []);

  const stats = useMemo(() => {
    const pending = leaves.filter((leave) => leave.status === "pending").length;
    const approved = leaves.filter((leave) => leave.status === "approved").length;
    const rejected = leaves.filter((leave) => leave.status === "rejected").length;
    return { total: leaves.length, pending, approved, rejected };
  }, [leaves]);

  const leaveDateRanges = useMemo(
    () =>
      leaves.map((leave) => ({
        status: leave.status,
        start: parseDateOnlyLocal(leave.startDate),
        end: parseDateOnlyLocal(leave.endDate),
      })),
    [leaves],
  );

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) {
      return [] as Leave[];
    }

    return leaves.filter((leave) =>
      isWithinInterval(selectedDate, {
        start: parseDateOnlyLocal(leave.startDate),
        end: parseDateOnlyLocal(leave.endDate),
      }),
    );
  }, [selectedDate, leaves]);

  async function submitLeave(event: React.FormEvent) {
    event.preventDefault();

    if (form.startDate < tomorrowDate || form.endDate < form.startDate) {
      setError("Leave must start at least tomorrow, and end date cannot be before start date.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveType: form.leaveType,
          startDate: form.startDate,
          endDate: form.endDate,
          reason: form.reason,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || "Failed to submit leave request");
      }

      setForm({
        leaveType: "medical",
        startDate: tomorrowDate,
        endDate: tomorrowDate,
        reason: "",
      });
      await loadLeaves();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit leave");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/40">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={studentSidebarItems} activeItem="leave" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Leave Management" />
          <main className="flex-1 overflow-auto p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Student Leave Requests</h2>
              <p className="text-sm text-gray-600 mt-1">
                Welcome {user?.name || "Student"}. Leave requests must be made at least one day in advance.
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <Card className="col-span-1 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Leave Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    modifiers={{
                      approved: (date) =>
                        leaveDateRanges.some(
                          (range) =>
                            range.status === "approved" &&
                            isWithinInterval(date, { start: range.start, end: range.end }),
                        ),
                      pending: (date) =>
                        leaveDateRanges.some(
                          (range) =>
                            range.status === "pending" &&
                            isWithinInterval(date, { start: range.start, end: range.end }),
                        ),
                    }}
                    modifiersClassNames={{
                      approved: "bg-green-100 text-green-800",
                      pending: "bg-yellow-100 text-yellow-800",
                    }}
                  />

                  <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-700">
                      {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "No date selected"}
                    </p>
                    {selectedDateEvents.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {selectedDateEvents.map((leave) => (
                          <div key={leave.id} className="text-xs text-gray-700">
                            {leave.type} ({leave.status})
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 mt-2">No leave events for this day</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="col-span-2 space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Submit Leave Request</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={submitLeave} className="space-y-4">
                      <div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Leave Type</label>
                          <select
                            value={form.leaveType}
                            onChange={(e) =>
                              setForm((prev) => ({ ...prev, leaveType: e.target.value as Leave["leaveType"] }))
                            }
                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                          >
                            <option value="medical">Medical</option>
                            <option value="personal">Personal</option>
                            <option value="academic">Academic</option>
                            <option value="emergency">Emergency</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Start Date</label>
                          <input
                            type="date"
                            value={form.startDate}
                            min={tomorrowDate}
                            onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">End Date</label>
                          <input
                            type="date"
                            value={form.endDate}
                            min={form.startDate}
                            onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Reason</label>
                        <textarea
                          value={form.reason}
                          onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                          rows={3}
                          required
                        />
                      </div>

                      <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 gap-2">
                        {submitting ? "Submitting..." : "Submit Request"}
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Leave History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <p className="text-sm text-gray-500">Loading leave records...</p>
                    ) : leaves.length === 0 ? (
                      <p className="text-sm text-gray-500">No leave requests yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {leaves.map((leave) => (
                          <div key={leave.id} className="rounded-lg border border-gray-100 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="font-medium text-gray-900">{leave.type}</p>
                                <p className="text-xs text-gray-500">
                                  {leave.startDate} to {leave.endDate}
                                </p>
                              </div>
                              <Badge
                                className={
                                  leave.status === "approved"
                                    ? "bg-green-100 text-green-700"
                                    : leave.status === "pending"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                }
                              >
                                {leave.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                                {leave.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                                {leave.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 mt-2">{leave.reason}</p>
                            {leave.documentName && (
                              <p className="text-xs text-gray-500 mt-1">Document: {leave.documentName}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="border-0 shadow-sm bg-blue-50">
              <CardContent className="p-4 flex items-center gap-3 text-blue-800 text-sm">
                <CalendarDays className="h-5 w-5" />
                Leave request rule: start date must be at least tomorrow. Supporting documents are uploaded at approval time by reviewer.
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
