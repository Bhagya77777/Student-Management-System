"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { adminSidebarItems } from "@/components/sidebar/adminSidebarItems";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Edit, Plus, Search, Trash2, X, Download, Mail, Phone, Calendar, Shield, GraduationCap, Heart, BookOpen, UserCheck, UserX } from "lucide-react";

type UserRole = "student" | "parent" | "lecturer" | "admin";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  joinDate: string;
  status?: "active" | "inactive";
  studentId?: string;
  batch?: string;
  childStudentId?: string;
  employeeId?: string;
  department?: string;
  position?: string;
};

type CreateForm = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  studentId: string;
  batch: string;
  childStudentId: string;
  relation: string;
  employeeId: string;
  department: string;
  position: string;
  qualification: string;
  specialization: string;
};

const roleIcons: Record<UserRole, typeof GraduationCap> = {
  student: GraduationCap,
  parent: Heart,
  lecturer: BookOpen,
  admin: Shield,
};

const roleColors: Record<UserRole, string> = {
  student: "bg-blue-100 text-blue-700",
  parent: "bg-emerald-100 text-emerald-700",
  lecturer: "bg-purple-100 text-purple-700",
  admin: "bg-red-100 text-red-700",
};

const initialForm: CreateForm = {
  name: "",
  email: "",
  password: "",
  role: "student",
  phone: "",
  studentId: "",
  batch: "",
  childStudentId: "",
  relation: "Parent",
  employeeId: "",
  department: "",
  position: "",
  qualification: "",
  specialization: "",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<"all" | UserRole>("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [createForm, setCreateForm] = useState<CreateForm>(initialForm);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const roleFilter = selectedRole !== "all" ? `?role=${selectedRole}` : "";
      const response = await fetch(`/api/users${roleFilter}`);
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || "Failed to load users");
      }
      setUsers(json.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [selectedRole]);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const q = searchTerm.toLowerCase().trim();
        if (!q) {
          return true;
        }
        return user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
      }),
    [users, searchTerm],
  );

  const visibleUsers = useMemo(
    () => filteredUsers.filter((user) => selectedStatus === "all" || user.status === selectedStatus),
    [filteredUsers, selectedStatus],
  );

  const stats = useMemo(() => {
    return {
      total: users.length,
      students: users.filter((user) => user.role === "student").length,
      parents: users.filter((user) => user.role === "parent").length,
      lecturers: users.filter((user) => user.role === "lecturer").length,
      admins: users.filter((user) => user.role === "admin").length,
      active: users.filter((user) => user.status === "active").length,
      inactive: users.filter((user) => user.status === "inactive").length,
    };
  }, [users]);

  async function createUser(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || "Failed to create user");
      }
      setCreateForm(initialForm);
      setShowCreateForm(false);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(userId: string) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || "Failed to update user");
      }
      setEditingUserId(null);
      setEditName("");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(userId: string) {
    setError(null);
    if (!confirm("Delete this user permanently?")) {
      return;
    }
    try {
      const response = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || "Failed to delete user");
      }
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={adminSidebarItems} activeItem="users" />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="User Management" />

          <main className="flex-1 overflow-auto p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <p className="text-sm text-gray-600 mt-1">Manage students, parents, lecturers and administrators</p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-5 gap-4">
              <Card className="border-0 shadow-sm"><CardContent className="p-3"><p className="text-xs text-gray-500">Total Users</p><p className="text-xl font-bold text-gray-900">{stats.total}</p></CardContent></Card>
              <Card className="border-0 shadow-sm bg-blue-50"><CardContent className="p-3"><p className="text-xs text-gray-500">Students</p><p className="text-xl font-bold text-blue-600">{stats.students}</p></CardContent></Card>
              <Card className="border-0 shadow-sm bg-emerald-50"><CardContent className="p-3"><p className="text-xs text-gray-500">Parents</p><p className="text-xl font-bold text-emerald-600">{stats.parents}</p></CardContent></Card>
              <Card className="border-0 shadow-sm bg-purple-50"><CardContent className="p-3"><p className="text-xs text-gray-500">Lecturers</p><p className="text-xl font-bold text-purple-600">{stats.lecturers}</p></CardContent></Card>
              <Card className="border-0 shadow-sm bg-red-50"><CardContent className="p-3"><p className="text-xs text-gray-500">Admins</p><p className="text-xl font-bold text-red-600">{stats.admins}</p></CardContent></Card>
              <Card className="border-0 shadow-sm"><CardContent className="p-3"><p className="text-xs text-gray-500">Active/Inactive</p><p className="text-xl font-bold text-gray-900">{stats.active}/{stats.inactive}</p></CardContent></Card>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-9"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name or email"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedRole}
                  onChange={(event) => setSelectedRole(event.target.value as "all" | UserRole)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="all">All roles</option>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value as "all" | "active" | "inactive")}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <Button onClick={() => setShowCreateForm((prev) => !prev)} className="bg-blue-600 hover:bg-blue-700 gap-2">
                  {showCreateForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {showCreateForm ? "Close" : "Add User"}
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {showCreateForm && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Create User</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createUser} className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <Input
                        value={createForm.name}
                        onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder="Full name"
                        required
                      />
                      <Input
                        type="email"
                        value={createForm.email}
                        onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
                        placeholder="Email"
                        required
                      />
                      <Input
                        type="password"
                        value={createForm.password}
                        onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
                        placeholder="Password"
                        required
                      />
                      <select
                        value={createForm.role}
                        onChange={(event) => setCreateForm((prev) => ({ ...prev, role: event.target.value as UserRole }))}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      >
                        <option value="student">Student</option>
                        <option value="parent">Parent</option>
                        <option value="lecturer">Lecturer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <Input
                        value={createForm.phone}
                        onChange={(event) => setCreateForm((prev) => ({ ...prev, phone: event.target.value }))}
                        placeholder="Phone"
                      />

                      {(createForm.role === "student" || createForm.role === "parent") && (
                        <Input
                          value={createForm.studentId}
                          onChange={(event) => setCreateForm((prev) => ({ ...prev, studentId: event.target.value }))}
                          placeholder="Student ID"
                          required={createForm.role === "student"}
                        />
                      )}

                      {createForm.role === "student" && (
                        <Input
                          value={createForm.batch}
                          onChange={(event) => setCreateForm((prev) => ({ ...prev, batch: event.target.value }))}
                          placeholder="Batch"
                          required
                        />
                      )}

                      {createForm.role === "parent" && (
                        <>
                          <Input
                            value={createForm.childStudentId}
                            onChange={(event) =>
                              setCreateForm((prev) => ({ ...prev, childStudentId: event.target.value }))
                            }
                            placeholder="Child student ID"
                            required
                          />
                          <Input
                            value={createForm.relation}
                            onChange={(event) => setCreateForm((prev) => ({ ...prev, relation: event.target.value }))}
                            placeholder="Relation"
                          />
                        </>
                      )}

                      {(createForm.role === "lecturer" || createForm.role === "admin") && (
                        <>
                          <Input
                            value={createForm.employeeId}
                            onChange={(event) => setCreateForm((prev) => ({ ...prev, employeeId: event.target.value }))}
                            placeholder="Employee ID"
                            required
                          />
                          <Input
                            value={createForm.department}
                            onChange={(event) => setCreateForm((prev) => ({ ...prev, department: event.target.value }))}
                            placeholder="Department"
                            required
                          />
                          <Input
                            value={createForm.position}
                            onChange={(event) => setCreateForm((prev) => ({ ...prev, position: event.target.value }))}
                            placeholder="Position"
                            required
                          />
                        </>
                      )}
                    </div>

                    {createForm.role === "lecturer" && (
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          value={createForm.qualification}
                          onChange={(event) =>
                            setCreateForm((prev) => ({ ...prev, qualification: event.target.value }))
                          }
                          placeholder="Qualification"
                          required
                        />
                        <Input
                          value={createForm.specialization}
                          onChange={(event) =>
                            setCreateForm((prev) => ({ ...prev, specialization: event.target.value }))
                          }
                          placeholder="Specialization"
                          required
                        />
                      </div>
                    )}

                    <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                      {saving ? "Saving..." : "Create User"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Users</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-gray-500">Loading users...</p>
                ) : visibleUsers.length === 0 ? (
                  <p className="text-sm text-gray-500">No users found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500">
                          <th className="py-3 px-4">User</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Contact</th>
                          <th className="py-3 px-4">Details</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Joined</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleUsers.map((user) => {
                          const RoleIcon = roleIcons[user.role];
                          return (
                            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <RoleIcon className="h-5 w-5 text-gray-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{editingUserId === user.id ? <Input value={editName} onChange={(event) => setEditName(event.target.value)} className="max-w-xs" /> : user.name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${roleColors[user.role]}`}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="space-y-0.5 text-xs text-gray-500">
                                  <div className="flex items-center gap-1"><Mail className="h-3 w-3" />{user.email}</div>
                                  {user.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{user.phone}</div>}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-xs text-gray-500">
                                {user.role === "student" && <div>ID: {user.studentId ?? "-"}<br />Batch: {user.batch ?? "-"}</div>}
                                {user.role === "parent" && <div>Child ID: {user.childStudentId ?? user.studentId ?? "-"}</div>}
                                {user.role === "lecturer" && <div>Dept: {user.department ?? "-"}<br />Pos: {user.position ?? "-"}</div>}
                                {user.role === "admin" && <div>Dept: {user.department ?? "-"}<br />Pos: {user.position ?? "-"}</div>}
                              </td>
                              <td className="py-3 px-4">
                                <Badge className={user.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                                  {user.status === "active" ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
                                  {user.status ?? "active"}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500">{user.joinDate}</td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-2">
                                  {editingUserId === user.id ? (
                                    <Button size="sm" onClick={() => saveEdit(user.id)} disabled={saving}>Save</Button>
                                  ) : (
                                    <Button size="sm" variant="ghost" onClick={() => { setEditingUserId(user.id); setEditName(user.name); }}><Edit className="h-4 w-4" /></Button>
                                  )}
                                  <Button size="sm" variant="ghost" onClick={() => deleteUser(user.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
