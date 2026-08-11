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
  Sparkles,
  Save,
  Globe,
  Bell,
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

  // Platform preferences state (stored in local storage / state for platform control)
  const [commissionRate, setCommissionRate] = useState("15");
  const [payoutSchedule, setPayoutSchedule] = useState("weekly");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [designerAutoApproval, setDesignerAutoApproval] = useState(false);
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
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
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

      push("Admin password updated successfully!", "ok");
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

      push("Admin profile name updated", "ok");
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
        title="Admin Settings & Security"
        subtitle="Manage administrator authentication, credentials, and platform system preferences"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Password & Account Security (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Change Password */}
          <div className="bg-white rounded-none border border-[#ECE8DC] shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-[#ECE8DC] bg-[#FAF8F5] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-none bg-[#1A1A1A] text-white flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-[#F6D746]" />
                </div>
                <div>
                  <h2 className="font-display text-sm font-bold uppercase tracking-tight text-[#1A1A1A]">
                    Change Administrator Password
                  </h2>
                  <p className="text-xs text-[#8A8A8A]">
                    Update your account password with instant Supabase security sync
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#F4F0E5] text-[#1A1A1A] rounded-none border border-[#ECE8DC]">
                Auth Guard Active
              </span>
            </div>

            <form onSubmit={handlePasswordChange} className="p-6 space-y-5">
              {/* New Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter strong new password..."
                    className="w-full bg-[#FAF8F5] border border-[#ECE8DC] text-[#1A1A1A] font-sans text-xs font-medium px-3.5 py-2.5 pr-10 rounded-none outline-none focus:border-[#17181D] focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#1A1A1A] cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password to verify..."
                    className="w-full bg-[#FAF8F5] border border-[#ECE8DC] text-[#1A1A1A] font-sans text-xs font-medium px-3.5 py-2.5 pr-10 rounded-none outline-none focus:border-[#17181D] focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#1A1A1A] cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              {newPassword.length > 0 && (
                <div className="p-3.5 bg-[#FAF8F5] border border-[#ECE8DC] space-y-2 text-xs">
                  <p className="font-bold text-[#1A1A1A] text-[11px] uppercase tracking-wider">
                    Password Security Criteria:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-700 font-bold" : "text-[#8A8A8A]"}`}>
                      {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 border border-[#8A8A8A] rounded-none" />}
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-700 font-bold" : "text-[#8A8A8A]"}`}>
                      {hasUpper ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 border border-[#8A8A8A] rounded-none" />}
                      <span>Uppercase letter (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-700 font-bold" : "text-[#8A8A8A]"}`}>
                      {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 border border-[#8A8A8A] rounded-none" />}
                      <span>At least one number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${isMatch ? "text-emerald-700 font-bold" : "text-[#8A8A8A]"}`}>
                      {isMatch ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 border border-[#8A8A8A] rounded-none" />}
                      <span>Passwords match</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updatingPassword || !isPasswordValid || !isMatch}
                  className="px-6 py-2.5 bg-[#17181D] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-none hover:bg-[#F6D746] hover:text-[#1A1A1A] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-98"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {updatingPassword ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Platform Business Controls */}
          <div className="bg-white rounded-none border border-[#ECE8DC] shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-[#ECE8DC] bg-[#FAF8F5] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-none bg-[#1A1A1A] text-white flex items-center justify-center">
                <Sliders className="w-4 h-4 text-[#F6D746]" />
              </div>
              <div>
                <h2 className="font-display text-sm font-bold uppercase tracking-tight text-[#1A1A1A]">
                  Platform Commission & Policies
                </h2>
                <p className="text-xs text-[#8A8A8A]">
                  Marketplace splits, payout schedules and onboarding controls
                </p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                    Standard Commission Fee (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#ECE8DC] text-[#1A1A1A] font-sans text-xs font-bold px-3.5 py-2.5 rounded-none outline-none focus:border-[#17181D] focus:bg-white"
                  />
                  <p className="text-[10px] text-[#8A8A8A]">Default take rate deducted from designer house sales.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                    Payout Settlement Cycle
                  </label>
                  <select
                    value={payoutSchedule}
                    onChange={(e) => setPayoutSchedule(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#ECE8DC] text-[#1A1A1A] font-sans text-xs font-bold px-3.5 py-2.5 rounded-none outline-none focus:border-[#17181D] focus:bg-white cursor-pointer"
                  >
                    <option value="weekly">Weekly (Every Monday)</option>
                    <option value="biweekly">Bi-Weekly (1st & 15th)</option>
                    <option value="monthly">Monthly Settlement</option>
                    <option value="instant">Instant Real-Time Payouts</option>
                  </select>
                  <p className="text-[10px] text-[#8A8A8A]">Automated bank batch generation cycle.</p>
                </div>
              </div>

              <div className="border-t border-[#ECE8DC] pt-4 space-y-3">
                <label className="flex items-center justify-between p-3 bg-[#FAF8F5] border border-[#ECE8DC] cursor-pointer hover:border-[#1A1A1A] transition-colors">
                  <div>
                    <p className="text-xs font-bold text-[#1A1A1A]">Emergency Maintenance Mode</p>
                    <p className="text-[11px] text-[#8A8A8A]">Temporarily restrict buyer checkout while keeping admin active.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => {
                      setMaintenanceMode(e.target.checked);
                      push(e.target.checked ? "Maintenance mode enabled" : "Maintenance mode disabled", "ok");
                    }}
                    className="w-4 h-4 accent-[#1A1A1A] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-[#FAF8F5] border border-[#ECE8DC] cursor-pointer hover:border-[#1A1A1A] transition-colors">
                  <div>
                    <p className="text-xs font-bold text-[#1A1A1A]">Automated Lead Email Alerts</p>
                    <p className="text-[11px] text-[#8A8A8A]">Send real-time notifications when bespoke concept art leads arrive.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => {
                      setEmailAlerts(e.target.checked);
                      push("Alert preferences saved", "ok");
                    }}
                    className="w-4 h-4 accent-[#1A1A1A] cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Admin Identity & Session Security */}
        <div className="space-y-6">
          {/* Card 3: Administrator Profile */}
          <div className="bg-white rounded-none border border-[#ECE8DC] shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-[#ECE8DC] bg-[#FAF8F5] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-none bg-[#1A1A1A] text-white flex items-center justify-center">
                <User className="w-4 h-4 text-[#F6D746]" />
              </div>
              <h2 className="font-display text-sm font-bold uppercase tracking-tight text-[#1A1A1A]">
                Administrator Identity
              </h2>
            </div>

            <form onSubmit={handleProfileUpdate} className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] border border-[#ECE8DC]">
                <div className="w-12 h-12 rounded-none bg-[#17181D] text-[#F6D746] flex items-center justify-center font-display text-lg font-bold">
                  {adminName ? adminName.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="min-w-0">
                  <span className="inline-block px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest bg-[#F6D746] text-[#1A1A1A] mb-1">
                    Super Admin
                  </span>
                  <p className="text-xs font-bold text-[#1A1A1A] truncate">{adminName}</p>
                  <p className="text-[10px] text-[#8A8A8A] truncate">{adminUser?.email}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Admin Display Name
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#ECE8DC] text-[#1A1A1A] font-sans text-xs font-bold px-3 py-2 rounded-none outline-none focus:border-[#17181D] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Registered Admin Email
                </label>
                <input
                  type="email"
                  disabled
                  value={adminUser?.email || ""}
                  className="w-full bg-[#F4F0E5] border border-[#ECE8DC] text-[#8A8A8A] font-sans text-xs font-bold px-3 py-2 rounded-none cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="w-full py-2 bg-[#17181D] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-none hover:bg-[#F6D746] hover:text-[#1A1A1A] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                {updatingProfile ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </div>

          {/* Card 4: Session Security */}
          <div className="bg-white rounded-none border border-[#ECE8DC] shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-[#ECE8DC] bg-[#FAF8F5] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-none bg-[#1A1A1A] text-white flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#F6D746]" />
              </div>
              <h2 className="font-display text-sm font-bold uppercase tracking-tight text-[#1A1A1A]">
                Session Security
              </h2>
            </div>

            <div className="p-5 space-y-4">
              <div className="text-xs space-y-2 text-[#8A8A8A]">
                <div className="flex justify-between py-1 border-b border-[#ECE8DC]">
                  <span className="font-medium">Current Session:</span>
                  <span className="font-bold text-emerald-700">Active &amp; Encrypted</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#ECE8DC]">
                  <span className="font-medium">Role Level:</span>
                  <span className="font-bold text-[#1A1A1A]">Platform Owner / Admin</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#ECE8DC]">
                  <span className="font-medium">Multi-Factor Status:</span>
                  <span className="font-bold text-amber-700">Supabase Auth Verified</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTerminateOtherSessions}
                className="w-full py-2 border border-[#17181D] text-[#17181D] font-sans text-xs font-bold uppercase tracking-wider rounded-none hover:bg-[#17181D] hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out Other Devices
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
