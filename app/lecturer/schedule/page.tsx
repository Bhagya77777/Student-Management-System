"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { lecturerSidebarItems } from "@/components/sidebar/lecturerSidebarItems";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  AlertCircle,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  CalendarClock,
} from "lucide-react";
import {
  format,
  isSameDay,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";

interface Lecture {
  id: string;
  date: string;
  time: string;
  course: string;
  code: string;
  room: string;
  students: number;
  status: "scheduled" | "postponed";
}

type DialogMode = "create" | "edit" | "postpone" | "delete";

type ScheduleForm = {
  date: string;
  time: string;
  course: string;
  code: string;
  room: string;
  students: string;
};

function toDateOnly(value: Date) {
  return format(value, "yyyy-MM-dd");
}

function buildFormFromLecture(lecture: Lecture): ScheduleForm {
  return {
    date: lecture.date,
    time: lecture.time,
    course: lecture.course,
    code: lecture.code,
    room: lecture.room,
    students: String(lecture.students),
  };
}

export default function LecturerSchedulePage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionSaving, setActionSaving] = useState(false);
  const [form, setForm] = useState<ScheduleForm>({
    date: toDateOnly(new Date()),
    time: "09:00 - 11:00",
    course: "",
    code: "",
    room: "",
    students: "30",
  });

  // Fetch lecturer schedule from persistent API.
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const [scheduleResponse, marksResponse] = await Promise.all([
          fetch("/api/schedule", { credentials: "include" }),
          fetch("/api/marks", { credentials: "include" }),
        ]);

        if (scheduleResponse.ok) {
          const data = (await scheduleResponse.json()) as { records?: Lecture[] };
          setLectures(data.records ?? []);
        } else {
          setError("Failed to load schedule");
        }

        if (marksResponse.ok) {
          const marksData = (await marksResponse.json()) as {
            records?: Array<{ subject?: string }>;
          };
          const subjects = Array.from(
            new Set(
              (marksData.records || [])
                .map((record) => record.subject)
                .filter(Boolean),
            ),
          ) as string[];
          setAvailableSubjects(subjects.sort());
        }

        setError(null);
      } catch (err) {
        console.error("Failed to fetch schedule:", err);
        setError("Unable to load schedule. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const getLecturesForDate = (date: Date) => {
    const dayValue = toDateOnly(date);
    return lectures
      .filter((entry) => entry.date === dayValue)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const weekDays = useMemo(
    () =>
      eachDayOfInterval({
        start: currentWeekStart,
        end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
      }),
    [currentWeekStart],
  );

  const selectedLectures = selectedDate ? getLecturesForDate(selectedDate) : [];

  const goToPreviousWeek = () => {
    setCurrentWeekStart(subDays(currentWeekStart, 7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const openCreateDialog = (targetDate?: Date) => {
    const date = targetDate ?? selectedDate ?? new Date();
    setDialogMode("create");
    setActiveLecture(null);
    setForm({
      date: toDateOnly(date),
      time: "09:00 - 11:00",
      course: "",
      code: "",
      room: "",
      students: "30",
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (lecture: Lecture) => {
    setDialogMode("edit");
    setActiveLecture(lecture);
    setForm(buildFormFromLecture(lecture));
    setFormError(null);
    setDialogOpen(true);
  };

  const openPostponeDialog = (lecture: Lecture) => {
    setDialogMode("postpone");
    setActiveLecture(lecture);
    setForm({
      ...buildFormFromLecture(lecture),
      date: toDateOnly(addDays(new Date(lecture.date), 1)),
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const openDeleteDialog = (lecture: Lecture) => {
    setDialogMode("delete");
    setActiveLecture(lecture);
    setForm(buildFormFromLecture(lecture));
    setFormError(null);
    setDialogOpen(true);
  };

  const handleDialogSubmit = async () => {
    if (dialogMode === "delete") {
      if (!activeLecture) {
        return;
      }
      setActionSaving(true);
      const response = await fetch(`/api/schedule/${activeLecture.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setActionSaving(false);

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setFormError(payload?.error || "Failed to delete schedule");
        return;
      }

      setLectures((current) =>
        current.filter((lecture) => lecture.id !== activeLecture.id),
      );
      setFormError(null);
      setDialogOpen(false);
      return;
    }

    if (!form.date || !form.time || !form.course || !form.code || !form.room) {
      setFormError("Date, time, course, code and room are required.");
      return;
    }

    const selectedFormDate = new Date(form.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedFormDate < today) {
      setFormError("Cannot schedule classes for past dates.");
      return;
    }

    const students = Number(form.students);
    if (Number.isNaN(students) || students <= 0) {
      setFormError("Students count must be a positive number.");
      return;
    }

    if (dialogMode === "create") {
      setActionSaving(true);
      const response = await fetch("/api/schedule", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          time: form.time,
          course: form.course,
          code: form.code,
          room: form.room,
          students,
          status: "scheduled",
        }),
      });
      setActionSaving(false);

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setFormError(payload?.error || "Failed to create schedule");
        return;
      }

      const payload = (await response.json()) as { record: Lecture };
      setLectures((current) => [...current, payload.record]);
      setFormError(null);
      setDialogOpen(false);
      return;
    }

    if (!activeLecture) {
      return;
    }

    setActionSaving(true);
    const response = await fetch(`/api/schedule/${activeLecture.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: form.date,
        time: form.time,
        course: form.course,
        code: form.code,
        room: form.room,
        students,
        status: dialogMode === "postpone" ? "postponed" : "scheduled",
      }),
    });
    setActionSaving(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setFormError(payload?.error || "Failed to update schedule");
      return;
    }

    const payload = (await response.json()) as { record: Lecture };
    setLectures((current) =>
      current.map((lecture) =>
        lecture.id === activeLecture.id ? payload.record : lecture,
      ),
    );
    setFormError(null);
    setDialogOpen(false);
  };

  const dialogTitle =
    dialogMode === "create"
      ? "Add New Schedule"
      : dialogMode === "edit"
        ? "Update Schedule"
        : dialogMode === "postpone"
          ? "Postpone Schedule"
          : "Delete Schedule";

  const dialogDescription =
    dialogMode === "create"
      ? "Create a new lecture slot for the selected date."
      : dialogMode === "edit"
        ? "Update lecture details and keep the timetable accurate."
        : dialogMode === "postpone"
          ? "Move this lecture to another date or time."
          : "This will permanently remove the selected lecture from your schedule.";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-purple-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={lecturerSidebarItems} activeItem="schedule" />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Weekly Schedule" />

          <main className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Class Schedule</h2>
                  <p className="text-gray-500 text-sm mt-1">View your weekly teaching schedule</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="gap-1 bg-purple-600 hover:bg-purple-700"
                    onClick={() => openCreateDialog()}
                  >
                    <Plus className="h-4 w-4" />
                    Add Schedule
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                </div>
              </div>

              {/* Error State */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">{error}</p>
                    <Button size="sm" variant="outline" className="mt-1" onClick={() => window.location.reload()}>
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
                  <p className="text-gray-600 mt-2">Loading your schedule...</p>
                </div>
              )}

              {/* Week Navigation */}
              {!loading && !error && (
                <>
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={goToPreviousWeek} className="gap-1">
                      <ChevronLeft className="h-4 w-4" />
                      Previous Week
                    </Button>
                    <span className="text-sm font-medium text-gray-600">
                      {format(currentWeekStart, "MMM d")} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), "MMM d, yyyy")}
                    </span>
                    <Button variant="outline" size="sm" onClick={goToNextWeek} className="gap-1">
                      Next Week
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Weekly Schedule Table */}
                  <Card className="border-0 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 w-32">Time</th>
                            {weekDays.map((day) => (
                              <th
                                key={day.toString()}
                                className={`text-left py-3 px-4 text-xs font-semibold ${selectedDate && isSameDay(day, selectedDate) ? "text-purple-700 bg-purple-50/60" : "text-gray-600"}`}
                              >
                                <div>{format(day, "EEEE")}</div>
                                <div className="text-xs text-gray-400">{format(day, "MMM d")}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {["09:00 - 11:00", "11:00 - 13:00", "14:00 - 16:00"].map((timeSlot) => (
                            <tr key={timeSlot} className="border-b border-gray-100">
                              <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50/50">{timeSlot}</td>
                              {weekDays.map((day) => {
                                const lectures = getLecturesForDate(day);
                                const lecture = lectures.find((item) => item.time === timeSlot);
                                return (
                                  <td key={day.toString()} className="py-3 px-4">
                                    {lecture ? (
                                      <div className="p-2 bg-purple-50 rounded-lg">
                                        <div className="flex items-center justify-between gap-2">
                                          <p className="text-sm font-semibold text-gray-900">{lecture.course}</p>
                                          <Badge
                                            className={
                                              lecture.status === "postponed"
                                                ? "bg-amber-100 text-amber-700"
                                                : "bg-green-100 text-green-700"
                                            }
                                          >
                                            {lecture.status === "postponed" ? "Postponed" : "Scheduled"}
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-gray-500">{lecture.code}</p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                          <MapPin className="h-3 w-3" />
                                          <span>{lecture.room}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                          <Users className="h-3 w-3" />
                                          <span>{lecture.students} students</span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-xs"
                                            onClick={() => openEditDialog(lecture)}
                                          >
                                            <Pencil className="h-3 w-3" />
                                            Edit
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-xs text-amber-700 hover:text-amber-800"
                                            onClick={() => openPostponeDialog(lecture)}
                                          >
                                            <CalendarClock className="h-3 w-3" />
                                            Postpone
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                                            onClick={() => openDeleteDialog(lecture)}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                            Delete
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-gray-400">-</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Calendar View */}
                  <div className="grid grid-cols-3 gap-6">
                    <Card className="col-span-1 border-0 shadow-sm h-fit">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Calendar</CardTitle>
                        <p className="text-xs text-gray-500">Select a date to view schedule</p>
                      </CardHeader>
                      <CardContent>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            if (date) {
                              setCurrentWeekStart(
                                startOfWeek(date, { weekStartsOn: 1 }),
                              );
                            }
                          }}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          className="rounded-lg"
                        />
                        <Button
                          className="mt-3 w-full bg-purple-600 hover:bg-purple-700"
                          onClick={() => openCreateDialog(selectedDate)}
                        >
                          <Plus className="h-4 w-4" /> Add on selected date
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="col-span-2 border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">
                          {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedLectures.length > 0 ? (
                          <div className="space-y-3">
                            {selectedLectures.map((lecture) => (
                              <div key={lecture.id} className="p-4 border border-gray-100 rounded-lg hover:border-purple-200 transition-all">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <BookOpen className="h-5 w-5 text-purple-600" />
                                      <h4 className="font-semibold text-gray-900">{lecture.course}</h4>
                                      <Badge className="bg-purple-100 text-purple-700">{lecture.code}</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span>{lecture.time}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span>{lecture.room}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-gray-400" />
                                        <span>{lecture.students} enrolled students</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <Badge
                                      className={
                                        lecture.status === "postponed"
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-green-100 text-green-700"
                                      }
                                    >
                                      {lecture.status === "postponed" ? "Postponed" : "Scheduled"}
                                    </Badge>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-1"
                                      onClick={() => openEditDialog(lecture)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                      Update
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-1 text-amber-700"
                                      onClick={() => openPostponeDialog(lecture)}
                                    >
                                      <CalendarClock className="h-4 w-4" />
                                      Postpone
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-1 text-red-600"
                                      onClick={() => openDeleteDialog(lecture)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No classes scheduled for this date</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>{dialogTitle}</DialogTitle>
                  <DialogDescription>{dialogDescription}</DialogDescription>
                </DialogHeader>

                {dialogMode === "delete" ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    <p>
                      Remove <strong>{activeLecture?.course}</strong> on{" "}
                      <strong>
                        {activeLecture
                          ? format(new Date(activeLecture.date), "EEEE, MMM d")
                          : "-"}
                      </strong>
                      ? This action cannot be undone.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Date</p>
                      <Input
                        type="date"
                        value={form.date}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            date: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Time Slot</p>
                      <Input
                        value={form.time}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            time: event.target.value,
                          }))
                        }
                        placeholder="e.g. 09:00 - 11:00"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Subject</p>
                      <Select
                        value={form.course}
                        onValueChange={(value) =>
                          setForm((current) => ({
                            ...current,
                            course: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSubjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Course Code</p>
                      <Input
                        value={form.code}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            code: event.target.value,
                          }))
                        }
                        placeholder="e.g. CS301"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Room</p>
                      <Input
                        value={form.room}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            room: event.target.value,
                          }))
                        }
                        placeholder="e.g. Hall A-101"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Students</p>
                      <Input
                        type="number"
                        min="1"
                        value={form.students}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            students: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                {formError && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {formError}
                  </div>
                )}

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={actionSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={dialogMode === "delete" ? "destructive" : "default"}
                    className={dialogMode === "delete" ? "" : "bg-purple-600 hover:bg-purple-700"}
                    onClick={handleDialogSubmit}
                    disabled={actionSaving}
                  >
                    {actionSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : dialogMode === "create" ? (
                      "Create Schedule"
                    ) : dialogMode === "edit" ? (
                      "Save Changes"
                    ) : dialogMode === "postpone" ? (
                      "Postpone"
                    ) : (
                      "Delete Schedule"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </div>
  );
}