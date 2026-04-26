"use client";

import { useEffect, useMemo, useState } from "react";
import { format, isWithinInterval } from "date-fns";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { parentSidebarItems } from "@/components/sidebar/parentSidebarItems";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { AlertCircle, Check, CheckCircle, Clock, X } from "lucide-react";
import { ChatAssistantV2 } from "@/components/ChatAssistantV2";
import { useAuth } from "@/contexts/AuthContext";
 
type LeaveItem = {
  id: string;
  studentName: string;
  studentCode: string;
  type: string;
  leaveType: string;
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

export default function ParentLeavePage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [approvalDocs, setApprovalDocs] = useState<Record<string, File[]>>({});

  function formatDocumentName(files: File[]) {
    const names = files.map((file) => file.name).filter(Boolean);
    if (names.length === 0) return "";
    const joined = names.join(", ");
    return joined.length > 200 ? `${joined.slice(0, 197)}...` : joined;
  }

  async function loadLeaves() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/leaves", { credentials: "include" });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || "Failed to load leave requests");
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
    const scopedLeaves = user?.role === "parent"
      ? leaves.filter((leave) => leave.studentCode === user.childStudentId)
      : [];
    const total = scopedLeaves.length;
    const pending = scopedLeaves.filter((leave) => leave.status === "pending").length;
    const approved = scopedLeaves.filter((leave) => leave.status === "approved").length;
    const rejected = scopedLeaves.filter((leave) => leave.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [leaves, user]);

  const visibleLeaves = useMemo(() => {
    if (user?.role !== "parent") {
      return [] as LeaveItem[];
    }
    return leaves.filter((leave) => leave.studentCode === user.childStudentId);
  }, [leaves, user]);

  const selectedDateLeaves = useMemo(() => {
    if (!selectedDate) {
      return [] as LeaveItem[];
    }

    return visibleLeaves.filter((leave) =>
      isWithinInterval(selectedDate, {
        start: parseDateOnlyLocal(leave.startDate),
        end: parseDateOnlyLocal(leave.endDate),
      }),
    );
  }, [selectedDate, visibleLeaves]);

  async function reviewLeave(id: string, status: "approved" | "rejected") {
    const files = approvalDocs[id] || [];
    if (status === "approved" && files.length === 0) {
      setError("Please upload at least one PDF/image document before approving.");
      return;
    }

    setProcessingId(id);
    setError(null);
    try {
      const response = await fetch(`/api/leaves/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          documentName: status === "approved" ? formatDocumentName(files) : undefined,
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || "Failed to update leave status");
      }
      await loadLeaves();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update leave");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={parentSidebarItems} activeItem="leave" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Leave Approvals" />

          <main className="flex-1 overflow-auto p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Leave Requests</h2>
              <p className="text-sm text-gray-600 mt-1">Review and manage your child's leave requests</p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Total</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
              <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Pending</p><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p></CardContent></Card>
              <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Approved</p><p className="text-2xl font-bold text-green-600">{stats.approved}</p></CardContent></Card>
              <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Rejected</p><p className="text-2xl font-bold text-red-600">{stats.rejected}</p></CardContent></Card>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <Card className="col-span-1 border-0 shadow-sm h-fit">
                <CardHeader>
                  <CardTitle className="text-base">Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    modifiers={{
                      pending: (date) =>
                        leaves.some(
                          (leave) =>
                            leave.status === "pending" &&
                            isWithinInterval(date, {
                              start: parseDateOnlyLocal(leave.startDate),
                              end: parseDateOnlyLocal(leave.endDate),
                            }),
                        ),
                    }}
                    modifiersClassNames={{
                      pending: "bg-yellow-100 text-yellow-800",
                    }}
                  />

                  <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-700">
                      {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "No date selected"}
                    </p>
                    {selectedDateLeaves.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {selectedDateLeaves.map((leave) => (
                          <p key={leave.id} className="text-xs text-gray-700">
                            {leave.type} ({leave.status})
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 mt-2">No leave requests on this day</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-2 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Leave Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-sm text-gray-500">Loading requests...</p>
                  ) : visibleLeaves.length === 0 ? (
                    <p className="text-sm text-gray-500">No leave requests found.</p>
                  ) : (
                    <div className="space-y-3">
                      {visibleLeaves.map((leave) => (
                        <div key={leave.id} className="rounded-lg border border-gray-100 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-gray-900">{leave.type}</p>
                              <p className="text-xs text-gray-500">{leave.studentName} ({leave.studentCode})</p>
                              <p className="text-xs text-gray-500">{leave.startDate} to {leave.endDate}</p>
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
                          <p className="text-xs text-gray-500 mt-1">Applied on {leave.appliedDate}</p>

                          {leave.status === "pending" && (
                            <div className="mt-3">
                              <label className="text-xs font-medium text-gray-600">Approval Documents (PDF/Image)</label>
                              <input
                                type="file"
                                accept="application/pdf,image/*"
                                multiple
                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                                onChange={(event) => {
                                  const files = Array.from(event.target.files ?? []);
                                  setApprovalDocs((prev) => ({ ...prev, [leave.id]: files }));
                                }}
                              />
                            </div>
                          )}

                          {leave.status === "pending" && (
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 gap-1"
                                disabled={processingId === leave.id}
                                onClick={() => reviewLeave(leave.id, "approved")}
                              >
                                <Check className="h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50 gap-1"
                                disabled={processingId === leave.id}
                                onClick={() => reviewLeave(leave.id, "rejected")}
                              >
                                <X className="h-3 w-3" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
      <ChatAssistantV2 />
    </div>
  );
}
