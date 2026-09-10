"use client";

import { useEffect, useState, FormEvent } from "react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { useToast } from "@/components/dashboard/Toast";
import { createClient } from "@/lib/supabase/client";
import {
  KeyRound,
  ShieldCheck,
  User,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Save,
  Bell,
  Layers,
  Check,
} from "lucide-react";

export default function AdminSettingsPage() {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<{ email: string; name: string; id: string } | null>(null);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Profile state
  const [adminName, setAdminName] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Platform preferences state
  const [commissionRate, setCommissionRate] = useState("10");
  const [payoutSchedule, setPayoutSchedule] = useState("biweekly");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const name =
            (user.user_metadata?.full_name as string) ||
            (user.user_metadata?.name as string) ||
            "Master Administrator";
          setAdminUser({
            id: user.id,
            email: user.email || "admin@designersstreet.com",
            name,
          });
          setAdminName(name);
        } else {
          setAdminUser({
            id: "admin-dev",
            email: "admin@designersstreet.com",
            name: "Master Administrator",
          });
          setAdminName("Master Administrator");
        }
      } catch {
        setAdminUser({
          id: "admin-dev",
          email: "admin@designersstreet.com",
          name: "Master Administrator",
        });
        setAdminName("Master Administrator");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Password strength validation checks
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordValid = hasMinLength && hasUpper && hasNumber;

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();

    if (!hasMinLength) {
      push("Password must be at least 8 characters long", "err");
      return;
    }
    if (newPassword !== confirmPassword) {
      push("Passwords do not match", "err");
      return;
    }

    setUpdatingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      push("Administrator password updated successfully!", "ok");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password";
      push(msg, "err");
    } finally {
      setUpdatingPassword(false);
    }
  }

  async function handleProfileUpdate(e: FormEvent) {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { full_name: adminName, name: adminName },
      });

      if (error) throw error;

      push("Administrator profile name updated", "ok");
      if (adminUser) {
        setAdminUser({ ...adminUser, name: adminName });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      push(msg, "err");
    } finally {
      setUpdatingProfile(false);
    }
  }

  async function handleTerminateOtherSessions() {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut({ scope: "others" });
      if (error) throw error;
      push("All other active admin sessions have been terminated", "ok");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to terminate sessions";
      push(msg, "err");
    }
  }

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* Top Bar Header */}
      <AdminTopBar
        title="Platform Settings & Security"
        subtitle="Manage administrator credentials, security policies, commission fees, and settlement settings"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Password & Policies (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Change Password */}
          <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-zinc-950">
                    Change Administrator Password
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Instant synchronization with Supabase identity and authentication guard
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 text-[10px] font-medium bg-zinc-100 text-zinc-800 rounded-md border border-zinc-200">
                Auth Active
              </span>
            </div>

            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              {/* New Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter secure new password..."
                    className="w-full bg-zinc-50/50 border border-zinc-200 text-zinc-900 text-xs font-medium px-3 py-2 pr-10 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password to verify..."
                    className="w-full bg-zinc-50/50 border border-zinc-200 text-zinc-900 text-xs font-medium px-3 py-2 pr-10 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              {newPassword.length > 0 && (
                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/70 space-y-2 text-xs">
                  <p className="font-medium text-zinc-700 text-[11px]">
                    Password Requirements:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-zinc-950 font-medium" : "text-zinc-400"}`}>
                      {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" /> : <div className="w-3.5 h-3.5 border border-zinc-300 rounded-full" />}
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUpper ? "text-zinc-950 font-medium" : "text-zinc-400"}`}>
                      {hasUpper ? <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" /> : <div className="w-3.5 h-3.5 border border-zinc-300 rounded-full" />}
                      <span>Uppercase letter (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasNumber ? "text-zinc-950 font-medium" : "text-zinc-400"}`}>
                      {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" /> : <div className="w-3.5 h-3.5 border border-zinc-300 rounded-full" />}
                      <span>At least one number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${isMatch ? "text-zinc-950 font-medium" : "text-zinc-400"}`}>
                      {isMatch ? <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" /> : <div className="w-3.5 h-3.5 border border-zinc-300 rounded-full" />}
                      <span>Passwords match</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updatingPassword || !isPasswordValid || !isMatch}
                  className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg disabled:opacity-40 transition-colors flex items-center gap-2 shadow-2xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {updatingPassword ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Platform Business Controls */}
          <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-950">
                  Platform Commission & Settlement Policies
                </h2>
                <p className="text-xs text-zinc-500">
                  Marketplace take rate, automated settlement cycles, and platform overrides
                </p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700">
                    Standard Platform Commission (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full bg-zinc-50/50 border border-zinc-200 text-zinc-900 text-xs font-mono font-medium px-3 py-2 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950"
                  />
                  <p className="text-[11px] text-zinc-500">Standard take rate deducted on orders across all houses.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700">
                    Automated Settlement Schedule
                  </label>
                  <select
                    value={payoutSchedule}
                    onChange={(e) => setPayoutSchedule(e.target.value)}
                    className="w-full bg-zinc-50/50 border border-zinc-200 text-zinc-900 text-xs font-medium px-3 py-2 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 cursor-pointer"
                  >
                    <option value="weekly">Weekly (Every Monday)</option>
                    <option value="biweekly">Bi-Weekly (1st & 15th of month)</option>
                    <option value="monthly">Monthly Settlement Cycle</option>
                  </select>
                  <p className="text-[11px] text-zinc-500">Frequency of automated batch ledger computations.</p>
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-4 space-y-3">
                <label className="flex items-center justify-between p-3.5 bg-zinc-50/60 rounded-xl border border-zinc-200/70 cursor-pointer hover:border-zinc-300 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-zinc-900">Emergency Maintenance Mode</p>
                    <p className="text-[11px] text-zinc-500">Temporarily restrict public cart checkout while preserving admin access.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => {
                      setMaintenanceMode(e.target.checked);
                      push(e.target.checked ? "Maintenance mode activated" : "Maintenance mode deactivated", "ok");
                    }}
                    className="w-4 h-4 accent-zinc-950 cursor-pointer rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-zinc-50/60 rounded-xl border border-zinc-200/70 cursor-pointer hover:border-zinc-300 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-zinc-900">Real-Time Lead Notifications</p>
                    <p className="text-[11px] text-zinc-500">Deliver email digests when high-ticket bespoke prototype leads arrive.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => {
                      setEmailAlerts(e.target.checked);
                      push("Notification preferences updated", "ok");
                    }}
                    className="w-4 h-4 accent-zinc-950 cursor-pointer rounded"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Admin Identity & Session Security */}
        <div className="space-y-6">
          {/* Card 3: Administrator Profile */}
          <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-semibold text-zinc-950">
                Administrator Identity
              </h2>
            </div>

            <form onSubmit={handleProfileUpdate} className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200/70">
                <div className="w-11 h-11 rounded-lg bg-zinc-950 text-white flex items-center justify-center text-base font-semibold">
                  {adminName ? adminName.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="min-w-0">
                  <span className="inline-block px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-zinc-950 text-white rounded-md mb-1">
                    Super Admin
                  </span>
                  <p className="text-xs font-semibold text-zinc-950 truncate">{adminName}</p>
                  <p className="text-[11px] text-zinc-500 truncate">{adminUser?.email}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700">
                  Admin Display Name
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full bg-zinc-50/50 border border-zinc-200 text-zinc-900 text-xs font-medium px-3 py-2 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700">
                  Registered Email
                </label>
                <input
                  type="email"
                  disabled
                  value={adminUser?.email || ""}
                  className="w-full bg-zinc-100 border border-zinc-200 text-zinc-500 text-xs font-medium px-3 py-2 rounded-lg cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="w-full py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                {updatingProfile ? "Saving..." : "Save Profile Details"}
              </button>
            </form>
          </div>

          {/* Card 4: Session Security */}
          <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-semibold text-zinc-950">
                Session Security
              </h2>
            </div>

            <div className="p-5 space-y-4">
              <div className="text-xs space-y-2.5 text-zinc-600">
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="font-medium text-zinc-500">Current Session:</span>
                  <span className="font-semibold text-zinc-950 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Active &amp; Encrypted
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="font-medium text-zinc-500">Security Tier:</span>
                  <span className="font-semibold text-zinc-950">Platform Superuser</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="font-medium text-zinc-500">Auth Guard:</span>
                  <span className="font-semibold text-zinc-950">Supabase Session Guard</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTerminateOtherSessions}
                className="w-full py-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-900 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5 text-zinc-500" />
                Terminate Other Device Sessions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
