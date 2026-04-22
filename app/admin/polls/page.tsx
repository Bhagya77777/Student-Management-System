"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { adminSidebarItems } from "@/components/sidebar/adminSidebarItems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PieChart, Plus, Trash2, CheckCircle, Clock, X, PlusCircle, MinusCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type PollOption = { id: string; text: string; votes: number }; 
type Poll = {
  id: string;
  title: string;
  description: string | null;
  options: PollOption[];
  totalVotes: number;
  status: "active" | "completed";
  startDate: string;
  endDate: string;
  targetAudience: string[];
};

export default function AdminPollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    options: ["", ""],
    endDate: "",
    targetAudience: ["students"] as string[],
  });

  const loadPolls = async () => {
    setLoading(true);
    const response = await fetch("/api/polls", { credentials: "include" });
    if (response.ok) {
      const data = (await response.json()) as { polls?: Poll[] };
      setPolls(data.polls ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadPolls();
  }, []);

  const createPoll = async () => {
    const response = await fetch("/api/polls", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      setShowForm(false);
      setFormData({ title: "", description: "", options: ["", ""], endDate: "", targetAudience: ["students"] });
      await loadPolls();
    }
  };

  const endPoll = async (id: string) => {
    await fetch(`/api/polls/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    await loadPolls();
  };

  const deletePoll = async (id: string) => {
    await fetch(`/api/polls/${id}`, { method: "DELETE", credentials: "include" });
    await loadPolls();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={adminSidebarItems} activeItem="polls" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Poll Management" />
          <main className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Poll Management</h2>
                  <p className="text-gray-500 text-sm mt-1">Create and manage polls for the community</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="gap-2 bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4" /> Create Poll</Button>
              </div>

              <AnimatePresence>
                {showForm && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white" onClick={(event) => event.stopPropagation()}>
                      <div className="border-b border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-gray-900">Create New Poll</h3>
                          <button onClick={() => setShowForm(false)} className="rounded-lg p-1 hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
                        </div>
                      </div>
                      <div className="space-y-4 p-6">
                        <div>
                          <Label>Question</Label>
                          <Input value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} className="mt-1" />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} className="mt-1" />
                        </div>
                        <div>
                          <Label>Options</Label>
                          <div className="mt-2 space-y-2">
                            {formData.options.map((option, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Input value={option} onChange={(event) => setFormData({ ...formData, options: formData.options.map((entry, optionIndex) => (optionIndex === index ? event.target.value : entry)) })} />
                                {formData.options.length > 2 && <Button type="button" variant="ghost" size="sm" onClick={() => setFormData({ ...formData, options: formData.options.filter((_, optionIndex) => optionIndex !== index) })}><MinusCircle className="h-4 w-4 text-red-500" /></Button>}
                              </div>
                            ))}
                          </div>
                          <Button type="button" variant="outline" size="sm" className="mt-2 gap-1" onClick={() => setFormData({ ...formData, options: [...formData.options, ""] })}><PlusCircle className="h-4 w-4" /> Add Option</Button>
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={formData.endDate}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(event) => setFormData({ ...formData, endDate: event.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Target Audience</Label>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(["students", "parents", "lecturers", "all"] as const).map((audience) => (
                              <Button key={audience} type="button" size="sm" variant={formData.targetAudience.includes(audience) ? "default" : "outline"} onClick={() => setFormData({ ...formData, targetAudience: formData.targetAudience.includes(audience) ? formData.targetAudience.filter((entry) => entry !== audience) : [...formData.targetAudience, audience] })}>
                                {audience}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <Button onClick={createPoll} className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"><Plus className="h-4 w-4" /> Create Poll</Button>
                          <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-6">
                {loading ? (
                  <Card className="col-span-2 border-0 shadow-sm"><CardContent className="flex items-center gap-2 p-6 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading polls</CardContent></Card>
                ) : (
                  polls.map((poll) => {
                    const chartData = poll.options.map((option) => ({ name: option.text, value: option.votes }));
                    return (
                      <Card key={poll.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <CardTitle className="text-base font-semibold">{poll.title}</CardTitle>
                              <p className="text-xs text-gray-500 mt-1">{poll.description}</p>
                            </div>
                            <Badge className={poll.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>{poll.status === "active" ? <Clock className="mr-1 h-3 w-3" /> : <CheckCircle className="mr-1 h-3 w-3" />}{poll.status}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis type="number" stroke="#6b7280" />
                                <YAxis type="category" dataKey="name" width={120} stroke="#6b7280" tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Total Votes: {poll.totalVotes}</span>
                            <span>Ends: {poll.endDate}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-500">Target: {poll.targetAudience.join(", ")}</span>
                            <div className="flex gap-2">
                              {poll.status === "active" && <Button size="sm" variant="outline" onClick={() => endPoll(poll.id)} className="gap-1"><CheckCircle className="h-3 w-3" /> End</Button>}
                              <Button variant="ghost" size="sm" onClick={() => deletePoll(poll.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
