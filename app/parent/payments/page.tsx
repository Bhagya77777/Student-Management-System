"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { parentSidebarItems } from "@/components/sidebar/parentSidebarItems";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Download, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Payment = {
  id: string;
  category: string;
  name: string;
  description: string | null;
  amount: number;
  dueDate: string | null;
  paidDate: string | null;
  status: string;
  method: string | null;
  receipt: string | null;
  studentName: string;
  studentCode: string;
};

export default function ParentPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true);
      const response = await fetch("/api/payments", { credentials: "include" });
      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = (await response.json()) as { payments?: Payment[] };
      setPayments(data.payments ?? []);
      setLoading(false);
    };

    void loadPayments();
  }, []);

  const due = payments.filter((payment) => payment.status === "pending");
  const paid = payments.filter((payment) => payment.status === "completed");

  const chartData = useMemo(
    () =>
      payments.map((payment) => ({
        name: payment.name,
        amount: payment.amount,
      })),
    [payments]
  );

  const totalDue = due.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPaid = paid.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={parentSidebarItems} activeItem="payments" />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Payments" />

          <main className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Payment Center</h2>
                <p className="text-gray-500 text-sm mt-1">Payments are loaded from the database for the linked child account.</p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Total Due</p><p className="text-2xl font-bold text-red-600">LKR {totalDue.toLocaleString()}</p></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Total Paid</p><p className="text-2xl font-bold text-green-600">LKR {totalPaid.toLocaleString()}</p></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Pending</p><p className="text-2xl font-bold text-orange-600">{due.length}</p></CardContent></Card>
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Completed</p><p className="text-2xl font-bold text-gray-900">{paid.length}</p></CardContent></Card>
              </div>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Payment Overview</CardTitle>
                    <Button variant="outline" size="sm" className="gap-1"><Download className="h-3 w-3" /> Export</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    {loading ? (
                      <div className="flex h-full items-center justify-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading payments</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip formatter={(value) => `LKR ${(value as number).toLocaleString()}`} />
                          <Bar dataKey="amount" fill="#059669" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Transactions</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div key={payment.id} className="rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900">{payment.name}</p>
                            <Badge className="bg-blue-100 text-blue-700">{payment.category}</Badge>
                            <Badge className={payment.status === "completed" ? "bg-green-100 text-green-700" : payment.status === "pending" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}>{payment.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-500">{payment.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">LKR {payment.amount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{payment.method ?? "-"}</p>
                        </div>
                      </div>
                    ))}
                    {payments.length === 0 && <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">No payment records found.</div>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
