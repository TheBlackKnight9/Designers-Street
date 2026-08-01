"use client";

import { useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import {
  useAppointments,
  useBespokeRequests,
  useMeasurementProfiles,
} from "@/hooks/useAtelier";
import { AtelierStatusBadge } from "@/components/atelier/AtelierStatusBadge";
import { MeasurementProfileCard } from "@/components/atelier/MeasurementProfileCard";
import { BespokeConversationThread } from "@/components/atelier/BespokeConversationThread";

export default function CustomerAtelierDashboard() {
  const { appointments, loading: loadingApps, setStatus: setAppStatus } = useAppointments();
  const { requests, loading: loadingBespoke, setStatus: setBespokeStatus, postMessage } = useBespokeRequests();
  const { profiles, loading: loadingProfiles, addProfile } = useMeasurementProfiles();

  const [activeTab, setActiveTab] = useState<"bespoke" | "appointments" | "measurements">("bespoke");
  const [selectedBespokeId, setSelectedBespokeId] = useState<string | null>(null);

  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "Wedding Couture Fit",
    unit: "inches" as "inches" | "cm",
    height: 67,
    chest: 36,
    waist: 28,
    hip: 39,
    shoulder: 15.5,
    sleeve: 23,
    inseam: 31,
    neck: 13.5,
    notes: "Fitted waist preference.",
    isDefault: true,
  });

  const selectedBespoke = requests.find((r) => r.id === selectedBespokeId) || requests[0];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await addProfile(profileForm);
    setShowAddProfileModal(false);
  };

  return (
    <>
      <TopBar />

      <main className="min-h-screen bg-[#FDFCF8] pb-20">
        {/* Header Hero */}
        <section className="bg-[#101010] text-[#F3F0E9] p-6 sm:p-8">
          <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059] block mb-1">
            Personal Atelier Portal
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight mb-2">
            My Bespoke & Consultations
          </h1>
          <p className="font-sans text-xs text-[#A0A0A0] max-w-xl">
            Track couture garment production progress, manage consultation schedules, and store your bespoke measurement profiles.
          </p>

          <div className="flex gap-3 mt-4">
            <Link
              href="/bespoke/request"
              className="px-4 py-2 bg-[#C5A059] text-black font-sans text-xs font-extrabold uppercase tracking-wider rounded-full"
            >
              + New Bespoke Request
            </Link>
            <Link
              href="/appointments/book"
              className="px-4 py-2 bg-white/10 text-white border border-white/20 font-sans text-xs font-bold uppercase tracking-wider rounded-full hover:bg-white/20"
            >
              📅 Book Consultation
            </Link>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="px-4 py-3 bg-[#FDFCF8] border-b border-[#E8E4DC] flex items-center gap-2 overflow-x-auto">
          {[
            { id: "bespoke", label: `Bespoke Orders (${requests.length})` },
            { id: "appointments", label: `Appointments (${appointments.length})` },
            { id: "measurements", label: `Fit Profiles (${profiles.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-full font-sans text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#101010] text-white shadow-xs"
                  : "bg-[#F3F0E9] text-[#5C5346] hover:bg-[#E3DBCC]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: BESPOKE REQUESTS */}
        {activeTab === "bespoke" && (
          <section className="p-4 sm:p-6 max-w-5xl mx-auto">
            {loadingBespoke ? (
              <p className="text-center font-sans text-xs text-[#7A7A7A] py-8">Loading bespoke requests…</p>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-[#E8E4DC]">
                <h3 className="font-display text-base font-bold uppercase text-[#2B2B2B] mb-1">
                  No Bespoke Requests
                </h3>
                <p className="font-sans text-xs text-[#7A7A7A] mb-4">
                  Request custom embroidery, exact fits, or one-of-a-kind couture garments directly from ateliers.
                </p>
                <Link
                  href="/bespoke/request"
                  className="px-5 py-2.5 bg-[#101010] text-white font-sans text-xs font-extrabold uppercase rounded-full"
                >
                  Create Bespoke Request
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* List Column */}
                <div className="lg:col-span-5 space-y-3">
                  {requests.map((r) => {
                    const isSelected = selectedBespoke?.id === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedBespokeId(r.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white border-[#101010] shadow-md ring-1 ring-[#101010]"
                            : "bg-[#FDFCF8] border-[#E8E4DC] hover:border-[#2B2B2B]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059]">
                            {r.designerName || "Maison Atelier"}
                          </span>
                          <AtelierStatusBadge status={r.status} />
                        </div>

                        <h3 className="font-display text-base font-bold uppercase text-[#2B2B2B] leading-tight">
                          {r.category || r.productName || "Custom Garment"}
                        </h3>
                        {r.occasion && (
                          <p className="font-sans text-xs text-[#7A7A7A] mt-0.5">
                            Occasion: {r.occasion}
                          </p>
                        )}

                        {r.status === "submitted" || r.status === "draft" ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Cancel this bespoke request?")) {
                                setBespokeStatus(r.id, "cancelled", "Cancelled by client.");
                              }
                            }}
                            className="mt-3 text-[10px] font-sans font-bold uppercase tracking-wider text-red-600 underline"
                          >
                            Cancel Request
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {/* Detail & Thread Column */}
                <div className="lg:col-span-7 space-y-4">
                  {selectedBespoke && (
                    <>
                      <div className="p-5 rounded-xl bg-white border border-[#E8E4DC] shadow-2xs space-y-3">
                        <div className="flex items-center justify-between gap-2 border-b border-[#F0ECE4] pb-3">
                          <div>
                            <span className="font-sans text-[10px] font-bold text-[#C5A059] uppercase">
                              Request #{selectedBespoke.id.slice(-6)}
                            </span>
                            <h2 className="font-display text-lg font-bold uppercase text-[#2B2B2B]">
                              {selectedBespoke.category || "Custom Garment"}
                            </h2>
                          </div>
                          <AtelierStatusBadge status={selectedBespoke.status} />
                        </div>

                        {selectedBespoke.notes && (
                          <div>
                            <span className="font-sans text-[9px] font-bold text-[#A0A0A0] uppercase block">
                              Client Instructions
                            </span>
                            <p className="font-sans text-xs text-[#4A4A4A]">
                              {selectedBespoke.notes}
                            </p>
                          </div>
                        )}

                        {selectedBespoke.statusNotes && (
                          <div className="p-3 rounded-lg bg-[#F9F7F2] border border-[#E8E4DC]">
                            <span className="font-sans text-[9px] font-bold text-[#C5A059] uppercase block">
                              💡 Master Weaver Update
                            </span>
                            <p className="font-sans text-xs text-[#2B2B2B] italic">
                              &ldquo;{selectedBespoke.statusNotes}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Conversation Thread */}
                      <BespokeConversationThread
                        messages={selectedBespoke.messages || []}
                        onSendMessage={(msg) => postMessage(selectedBespoke.id, msg, "buyer")}
                        role="buyer"
                      />
                    </>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 2: APPOINTMENTS */}
        {activeTab === "appointments" && (
          <section className="p-4 sm:p-6 max-w-4xl mx-auto">
            {loadingApps ? (
              <p className="text-center font-sans text-xs text-[#7A7A7A] py-8">Loading appointments…</p>
            ) : appointments.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-[#E8E4DC]">
                <h3 className="font-display text-base font-bold uppercase text-[#2B2B2B] mb-1">
                  No Scheduled Consultations
                </h3>
                <p className="font-sans text-xs text-[#7A7A7A] mb-4">
                  Book virtual or studio appointments with India&apos;s leading couture houses.
                </p>
                <Link
                  href="/appointments/book"
                  className="px-5 py-2.5 bg-[#101010] text-white font-sans text-xs font-extrabold uppercase rounded-full"
                >
                  Book Consultation Slot
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl bg-white border border-[#E8E4DC] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059]">
                          {app.designerName || "Maison Residency"}
                        </span>
                        <AtelierStatusBadge status={app.status} />
                      </div>
                      <h3 className="font-display text-base font-bold uppercase text-[#2B2B2B]">
                        {app.purpose}
                      </h3>
                      <p className="font-sans text-xs text-[#7A7A7A]">
                        📅 {app.preferredDate} at {app.preferredTime} · {app.appointmentType.replace("_", " ").toUpperCase()}
                      </p>
                      {app.message && (
                        <p className="font-sans text-xs text-[#4A4A4A] italic mt-1">
                          &ldquo;{app.message}&rdquo;
                        </p>
                      )}
                    </div>

                    {app.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Cancel this appointment?")) {
                            setAppStatus(app.id, "cancelled", "Cancelled by client.");
                          }
                        }}
                        className="px-3 py-1.5 border border-red-300 text-red-700 font-sans text-xs font-bold uppercase rounded-lg hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: MEASUREMENT PROFILES */}
        {activeTab === "measurements" && (
          <section className="p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="font-display text-xl font-bold uppercase text-[#2B2B2B]">
                  Measurement Profiles ({profiles.length})
                </h2>
                <p className="font-sans text-xs text-[#7A7A7A]">
                  Store multiple fit versions for wedding trousseaus, gala wear, and everyday tailoring.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProfileModal(true)}
                className="px-4 py-2 bg-[#101010] text-white font-sans text-xs font-extrabold uppercase tracking-wider rounded-full shadow-xs"
              >
                + New Fit Profile
              </button>
            </div>

            {loadingProfiles ? (
              <p className="text-center font-sans text-xs text-[#7A7A7A] py-8">Loading measurement profiles…</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profiles.map((prof) => (
                  <MeasurementProfileCard key={prof.id} profile={prof} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* MODAL: ADD MEASUREMENT PROFILE */}
        {showAddProfileModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#E8E4DC] shadow-2xl">
              <div className="flex items-center justify-between mb-4 border-b border-[#F0ECE4] pb-3">
                <h3 className="font-display text-base font-bold uppercase text-[#2B2B2B]">
                  Add Measurement Profile
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddProfileModal(false)}
                  className="text-gray-400 hover:text-black font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-[#2B2B2B] block mb-1">Profile Name (e.g. Wedding Couture)</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full p-2 rounded-lg border border-[#E8E4DC] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#2B2B2B] block mb-1">Chest ({profileForm.unit})</label>
                    <input
                      type="number"
                      value={profileForm.chest}
                      onChange={(e) => setProfileForm({ ...profileForm, chest: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-[#E8E4DC] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#2B2B2B] block mb-1">Waist ({profileForm.unit})</label>
                    <input
                      type="number"
                      value={profileForm.waist}
                      onChange={(e) => setProfileForm({ ...profileForm, waist: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-[#E8E4DC] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#2B2B2B] block mb-1">Hip ({profileForm.unit})</label>
                    <input
                      type="number"
                      value={profileForm.hip}
                      onChange={(e) => setProfileForm({ ...profileForm, hip: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-[#E8E4DC] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#2B2B2B] block mb-1">Shoulder ({profileForm.unit})</label>
                    <input
                      type="number"
                      value={profileForm.shoulder}
                      onChange={(e) => setProfileForm({ ...profileForm, shoulder: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-[#E8E4DC] outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={profileForm.isDefault}
                    onChange={(e) => setProfileForm({ ...profileForm, isDefault: e.target.checked })}
                  />
                  <label htmlFor="isDefault" className="font-bold text-[#2B2B2B]">
                    Set as default fit profile
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddProfileModal(false)}
                    className="flex-1 py-2 border border-[#E8E4DC] text-[#2B2B2B] rounded-lg font-bold uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#101010] text-white rounded-lg font-bold uppercase"
                  >
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </>
  );
}
