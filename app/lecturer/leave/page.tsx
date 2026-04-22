"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { lecturerSidebarItems } from "@/components/sidebar/lecturerSidebarItems";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { AlertCircle, CheckCircle, Clock, FileText, Loader2, XCircle, Calendar as CalendarIcon } from "lucide-react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

type LeaveItem = {
  id: string;
  studentName: string;
  studentCode: string;
  studentDepartment?: string | null;
  type: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected";
  reason: string;
  appliedDate: string;
  documentName?: string | null;
};

export default function LecturerLeavePage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("pending");
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
    void loadLeaves();
  }, []);

  const stats = useMemo(() => ({
    total: user?.role === "lecturer" ? leaves.filter((leave) => leave.studentDepartment === user.department).length : 0,
    pending: user?.role === "lecturer" ? leaves.filter((leave) => leave.studentDepartment === user.department && leave.status === "pending").length : 0,
    approved: user?.role === "lecturer" ? leaves.filter((leave) => leave.studentDepartment === user.department && leave.status === "approved").length : 0,
    rejected: user?.role === "lecturer" ? leaves.filter((leave) => leave.studentDepartment === user.department && leave.status === "rejected").length : 0,
  }), [leaves, user]);

  const filteredLeaves = useMemo(() => {
    const scopedLeaves = user?.role === "lecturer"
      ? leaves.filter((leave) => leave.studentDepartment === user.department)
      : [];

    return scopedLeaves.filter((leave) => {
      if (activeTab === "pending") return leave.status === "pending";
      if (activeTab === "approved") return leave.status === "approved";
      if (activeTab === "rejected") return leave.status === "rejected";
      return true;
    });
  }, [activeTab, leaves, user]);

  const visibleLeaves = useMemo(() => {
    if (user?.role !== "lecturer") {
      return [] as LeaveItem[];
    }
    return leaves.filter((leave) => leave.studentDepartment === user.department);
  }, [leaves, user]);

  const selectedDateLeaves = useMemo(() => {
    if (!selectedDate) return [] as LeaveItem[];
    return visibleLeaves.filter((leave) =>
      isWithinInterval(selectedDate, { start: parseISO(leave.startDate), end: parseISO(leave.endDate) }),
    );
  }, [visibleLeaves, selectedDate]);

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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-purple-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={lecturerSidebarItems} activeItem="leave" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Leave Approvals" />
          <main className="flex-1 overflow-auto p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Leave Requests</h2>
              <p className="text-gray-500 text-sm mt-1">Review and approve student leave requests.</p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Total Requests</p><p className="text-2xl font-bold text-gray-900">{stats.total}</p></CardContent></Card>
              <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Pending</p><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p></CardContent></Card>
              <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Approved</p><p className="text-2xl font-bold text-green-600">{stats.approved}</p></CardContent></Card>
              <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Rejected</p><p className="text-2xl font-bold text-red-600">{stats.rejected}</p></CardContent></Card>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <Card className="col-span-1 border-0 shadow-sm h-fit">
                <CardHeader><CardTitle className="text-base">Calendar</CardTitle></CardHeader>
                <CardContent>
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} modifiers={{ pending: (date) => leaves.some((leave) => leave.status === "pending" && isWithinInterval(date, { start: parseISO(leave.startDate), end: parseISO(leave.endDate) })) }} modifiersClassNames={{ pending: "bg-yellow-100 text-yellow-800" }} />
                  <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-700">{selectedDate ? format(selectedDate, "MMMM d, yyyy") : "No date selected"}</p>
                    {selectedDateLeaves.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {selectedDateLeaves.map((leave) => <p key={leave.id} className="text-xs text-gray-700">{leave.studentName} - {leave.type}</p>)}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 mt-2">No leave requests on this day</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="col-span-2 space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full max-w-md grid-cols-3">
                    <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                    <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
                  </TabsList>
                  <TabsContent value={activeTab} className="mt-6">
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-0">
                        {loading ? (
                          <div className="flex items-center gap-2 p-6 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading requests</div>
                        ) : filteredLeaves.length === 0 ? (
                          <div className="p-6 text-sm text-gray-500">No requests found.</div>
                        ) : (
                          <div className="space-y-3 p-4">
                            {filteredLeaves.map((leave) => (
                              <div key={leave.id} className="rounded-lg border border-gray-100 p-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                      <h4 className="font-semibold text-gray-900">{leave.studentName}</h4>
                                      <span className="text-xs text-gray-500">{leave.studentCode}</span>
                                      <Badge className={leave.status === "approved" ? "bg-green-100 text-green-800" : leave.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                                        {leave.status === "approved" ? <CheckCircle className="h-3 w-3 mr-1" /> : leave.status === "pending" ? <Clock className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                                        {leave.status}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">{leave.type}</p>
                                    <p className="text-sm text-gray-600">{leave.startDate} to {leave.endDate}</p>
                                    <p className="text-sm text-gray-600 mt-2">{leave.reason}</p>
                                    <p className="text-xs text-gray-500 mt-1">Applied on {leave.appliedDate}</p>
                                    {leave.documentName && <p className="text-xs text-blue-600 mt-1 flex items-center gap-1"><FileText className="h-3 w-3" /> {leave.documentName}</p>}

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
                                  </div>
                                  {leave.status === "pending" && (
                                    <div className="flex gap-2">
                                      <Button disabled={processingId === leave.id} onClick={() => reviewLeave(leave.id, "approved")} size="sm" className="bg-green-600 hover:bg-green-700 gap-1"><CheckCircle className="h-3 w-3" /> Approve</Button>
                                      <Button disabled={processingId === leave.id} onClick={() => reviewLeave(leave.id, "rejected")} size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 gap-1"><XCircle className="h-3 w-3" /> Reject</Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
