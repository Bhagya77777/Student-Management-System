"use client";
 
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { adminSidebarItems } from "@/components/sidebar/adminSidebarItems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Globe,
  Bell,
  Shield,
  Mail,
  Database,
  Users,
  Calendar,
  Clock,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

const SETTINGS_STORAGE_KEY = "admin_settings_v1";

export default function AdminSettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "UniBridge",
    siteEmail: "admin@unibridge.com",
    timezone: "Asia/Colombo",
    dateFormat: "YYYY-MM-DD",
    language: "en",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    criticalAlerts: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordExpiry: "90",
    loginAttempts: "5",
  });

  const [academicSettings, setAcademicSettings] = useState({
    currentSemester: "Spring 2024",
    academicYear: "2023-2024",
    attendanceThreshold: "75",
    gpaThreshold: "2.0",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load settings from local storage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw) as {
            general?: typeof generalSettings;
            notifications?: typeof notificationSettings;
            security?: typeof securitySettings;
            academic?: typeof academicSettings;
          };
          if (data.general) {
            setGeneralSettings(data.general);
          }
          if (data.notifications) {
            setNotificationSettings(data.notifications);
          }
          if (data.security) {
            setSecuritySettings(data.security);
          }
          if (data.academic) {
            setAcademicSettings(data.academic);
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
          general: generalSettings,
          notifications: notificationSettings,
          security: securitySettings,
          academic: academicSettings,
      };

      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(payload));
      setSuccess(true);
      toast.success("Settings saved successfully!");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={adminSidebarItems} activeItem="settings" />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="System Settings" />
          
          <main className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
                <p className="text-gray-500 text-sm mt-1">Manage platform settings and preferences</p>
              </div>

              {/* Settings Tabs */}
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full max-w-2xl grid-cols-5">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="academic">Academic</TabsTrigger>
                  <TabsTrigger value="system">System</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="mt-6">
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-base font-semibold">General Settings</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Site Name</Label>
                          <Input
                            value={generalSettings.siteName}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Site Email</Label>
                          <Input
                            value={generalSettings.siteEmail}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, siteEmail: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Timezone</Label>
                          <select
                            value={generalSettings.timezone}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                            className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                          >
                            <option value="Asia/Colombo">Asia/Colombo (Sri Lanka)</option>
                            <option value="Asia/Kolkata">Asia/Kolkata (India)</option>
                            <option value="America/New_York">America/New_York (EST)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Date Format</Label>
                          <select
                            value={generalSettings.dateFormat}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                            className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                          >
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                            <option value="MM-DD-YYYY">MM-DD-YYYY</option>
                          </select>
                        </div>
                      </div>
                      <div className="pt-4 flex gap-2">
                        <Button 
                          onClick={handleSave} 
                          disabled={saving}
                          className="gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                          {saving ? (<Loader2 className="h-4 w-4 animate-spin" />) : (<Save className="h-4 w-4" />)}
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Error Alert */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 mt-6">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900">{error}</p>
                    </div>
                  </div>
                )}

                {/* Success Alert */}
                {success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 mt-6">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Settings saved successfully!</p>
                    </div>
                  </div>
                )}

                {/* Notification Settings */}
                <TabsContent value="notifications" className="mt-6">
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-base font-semibold">Notification Settings</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                            <p className="text-xs text-gray-500">Receive important updates via email</p>
                          </div>
                          <Switch
                            checked={notificationSettings.emailNotifications}
                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                            <p className="text-xs text-gray-500">Receive real-time notifications in browser</p>
                          </div>
                          <Switch
                            checked={notificationSettings.pushNotifications}
                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, pushNotifications: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Weekly Digest</p>
                            <p className="text-xs text-gray-500">Receive weekly summary of activities</p>
                          </div>
                          <Switch
                            checked={notificationSettings.weeklyDigest}
                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, weeklyDigest: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Critical Alerts</p>
                            <p className="text-xs text-gray-500">Receive alerts for system issues</p>
                          </div>
                          <Switch
                            checked={notificationSettings.criticalAlerts}
                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, criticalAlerts: checked })}
                          />
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button 
                          onClick={handleSave} 
                          disabled={saving}
                          className="gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                          {saving ? (<Loader2 className="h-4 w-4 animate-spin" />) : (<Save className="h-4 w-4" />)}
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="mt-6">
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-base font-semibold">Security Settings</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                            <p className="text-xs text-gray-500">Require 2FA for admin accounts</p>
                          </div>
                          <Switch
                            checked={securitySettings.twoFactorAuth}
                            onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Session Timeout (minutes)</Label>
                          <Input
                            type="number"
                            value={securitySettings.sessionTimeout}
                            onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Password Expiry (days)</Label>
                          <Input
                            type="number"
                            value={securitySettings.passwordExpiry}
                            onChange={(e) => setSecuritySettings({ ...securitySettings, passwordExpiry: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Max Login Attempts</Label>
                          <Input
                            type="number"
                            value={securitySettings.loginAttempts}
                            onChange={(e) => setSecuritySettings({ ...securitySettings, loginAttempts: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button 
                          onClick={handleSave} 
                          disabled={saving}
                          className="gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                          {saving ? (<Loader2 className="h-4 w-4 animate-spin" />) : (<Save className="h-4 w-4" />)}
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Academic Settings */}
                <TabsContent value="academic" className="mt-6">
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-base font-semibold">Academic Settings</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Current Semester</Label>
                          <Input
                            value={academicSettings.currentSemester}
                            onChange={(e) => setAcademicSettings({ ...academicSettings, currentSemester: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Academic Year</Label>
                          <Input
                            value={academicSettings.academicYear}
                            onChange={(e) => setAcademicSettings({ ...academicSettings, academicYear: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Minimum Attendance (%)</Label>
                          <Input
                            type="number"
                            value={academicSettings.attendanceThreshold}
                            onChange={(e) => setAcademicSettings({ ...academicSettings, attendanceThreshold: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Minimum GPA</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={academicSettings.gpaThreshold}
                            onChange={(e) => setAcademicSettings({ ...academicSettings, gpaThreshold: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button 
                          onClick={handleSave} 
                          disabled={saving}
                          className="gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                          {saving ? (<Loader2 className="h-4 w-4 animate-spin" />) : (<Save className="h-4 w-4" />)}
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* System Settings */}
                <TabsContent value="system" className="mt-6">
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-base font-semibold">System Maintenance</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Backup Database</p>
                            <p className="text-xs text-yellow-700 mt-1">Last backup: March 20, 2024</p>
                            <Button variant="outline" size="sm" className="mt-2 gap-1 border-yellow-300 text-yellow-700">
                              <RefreshCw className="h-3 w-3" />
                              Run Backup
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-green-800">System Status</p>
                            <p className="text-xs text-green-700 mt-1">All systems operational</p>
                            <p className="text-xs text-green-600 mt-1">Uptime: 99.98% over last 30 days</p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button variant="outline" className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
                          <AlertTriangle className="h-4 w-4" />
                          Clear System Cache
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}