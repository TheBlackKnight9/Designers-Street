"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useAppointments,
  useBespokeRequests,
} from "@/hooks/useAtelier";
import { AtelierStatusBadge } from "@/components/atelier/AtelierStatusBadge";
import { BespokeConversationThread } from "@/components/atelier/BespokeConversationThread";
import { createAppointmentSlot } from "@/lib/api/atelier";

export default function DesignerAtelierDashboard() {
  const designerId = "dh-1"; // Maison Rivière
  const { appointments, loading: loadingApps, setStatus: setAppStatus } = useAppointments(designerId);
  const { requests, loading: loadingBespoke, setStatus: setBespokeStatus, postMessage } = useBespokeRequests(designerId);

  const [activeTab, setActiveTab] = useState<"bespoke" | "appointments" | "slots">("bespoke");
  const [selectedBespokeId, setSelectedBespokeId] = useState<string | null>(null);

  const [slotForm, setSlotForm] = useState({
    date: "2026-08-10",
    startTime: "11:00",
    endTime: "12:00",
    type: "virtual" as "virtual" | "studio_visit" | "phone",
  });

  const selectedBespoke = requests.find((r) => r.id === selectedBespokeId) || requests[0];

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAppointmentSlot(designerId, slotForm);
    alert("Consultation Slot Published!");
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F5F0] text-[#101010] p-6 sm:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#E3DBCC] pb-4 mb-6">
        <div>
          <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider block">
            House Atelier Management
          </span>
          <h1 className="text-2xl font-extrabold uppercase text-[#11161D]">
            MAISON RIVIÈRE — Atelier Dashboard
          </h1>
        </div>
        <Link
          href="/admin"
          className="px-4 py-2 bg-[#11161D] text-white text-xs font-bold uppercase rounded-lg shadow-sm"
        >
          ← Return to Admin Panel
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#E3DBCC] pb-2">
        {[
          { id: "bespoke", label: `Bespoke Requests (${requests.length})` },
          { id: "appointments", label: `Consultations (${appointments.length})` },
          { id: "slots", label: "Publish Available Slots" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#11161D] text-white shadow-sm"
                : "bg-white text-[#5C5346] border border-[#E3DBCC] hover:bg-[#F0ECE4]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: BESPOKE ORDERS */}
      {activeTab === "bespoke" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            {loadingBespoke ? (
              <p className="text-xs text-gray-500 py-4">Loading atelier requests…</p>
            ) : requests.length === 0 ? (
              <p className="text-xs text-gray-500 py-4">No bespoke requests received yet.</p>
            ) : (
              requests.map((r) => {
                const isSelected = selectedBespoke?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedBespokeId(r.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white border-[#11161D] shadow-md ring-1 ring-[#11161D]"
                        : "bg-white/60 border-[#E3DBCC] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[9px] font-bold text-[#C5A059] uppercase">
                        Client: {r.userName || "Aria Dev"}
                      </span>
                      <AtelierStatusBadge status={r.status} />
                    </div>

                    <h3 className="font-extrabold text-sm uppercase text-[#11161D]">
                      {r.category || r.productName || "Custom Garment"}
                    </h3>
                    <p className="text-[10px] text-gray-600 mt-1">
                      Budget: ₹{(r.budget || 250000).toLocaleString("en-IN")} · Deadline: {r.deadline || "ASAP"}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Status Update & Message Thread */}
          <div className="lg:col-span-7 space-y-4">
            {selectedBespoke && (
              <>
                <div className="p-5 rounded-xl bg-white border border-[#E3DBCC] shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E3DBCC] pb-3">
                    <div>
                      <span className="text-[9px] font-bold text-[#C5A059] uppercase">
                        Client: {selectedBespoke.userName || "Aria Dev"}
                      </span>
                      <h2 className="font-extrabold text-lg uppercase text-[#11161D]">
                        {selectedBespoke.category || "Custom Garment"}
                      </h2>
                    </div>
                    <AtelierStatusBadge status={selectedBespoke.status} />
                  </div>

                  {/* Actions */}
                  <div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase block mb-2">
                      Update Production Status
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(["accepted", "in_production", "ready", "delivered", "cancelled"] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setBespokeStatus(selectedBespoke.id, st, `Status updated to ${st}`)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${
                            selectedBespoke.status === st
                              ? "bg-[#11161D] text-white"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          Mark {st.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Conversation Thread */}
                <BespokeConversationThread
                  messages={selectedBespoke.messages || []}
                  onSendMessage={(msg) => postMessage(selectedBespoke.id, msg, "designer")}
                  role="designer"
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: APPOINTMENTS */}
      {activeTab === "appointments" && (
        <div className="max-w-4xl space-y-3">
          {loadingApps ? (
            <p className="text-xs text-gray-500 py-4">Loading consultations…</p>
          ) : appointments.length === 0 ? (
            <p className="text-xs text-gray-500 py-4">No appointment requests received yet.</p>
          ) : (
            appointments.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-xl bg-white border border-[#E3DBCC] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#C5A059] uppercase">
                      Client: {app.userName || "Aria Dev"}
                    </span>
                    <AtelierStatusBadge status={app.status} />
                  </div>
                  <h3 className="font-extrabold text-sm uppercase text-[#11161D]">
                    {app.purpose}
                  </h3>
                  <p className="text-xs text-gray-600">
                    📅 {app.preferredDate} at {app.preferredTime} · {app.appointmentType.toUpperCase()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAppStatus(app.id, "confirmed", "Confirmed by Atelier Master.")}
                    className="px-3 py-1.5 bg-emerald-800 text-white font-bold text-[9px] uppercase rounded-lg"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppStatus(app.id, "cancelled", "Declined by Atelier.")}
                    className="px-3 py-1.5 bg-red-700 text-white font-bold text-[9px] uppercase rounded-lg"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: PUBLISH SLOTS */}
      {activeTab === "slots" && (
        <div className="max-w-md bg-white rounded-xl p-6 border border-[#E3DBCC] shadow-2xs">
          <h2 className="text-base font-extrabold uppercase text-[#11161D] mb-4">
            Publish Consultation Time Slot
          </h2>

          <form onSubmit={handleCreateSlot} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-[#11161D] block mb-1">Slot Date</label>
              <input
                type="date"
                required
                value={slotForm.date}
                onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-[#E3DBCC] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#11161D] block mb-1">Start Time</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 11:00"
                  value={slotForm.startTime}
                  onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-[#E3DBCC] outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-[#11161D] block mb-1">End Time</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12:00"
                  value={slotForm.endTime}
                  onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-[#E3DBCC] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#11161D] block mb-1">Consultation Type</label>
              <select
                value={slotForm.type}
                onChange={(e) => setSlotForm({ ...slotForm, type: e.target.value as any })}
                className="w-full p-2.5 rounded-lg border border-[#E3DBCC] outline-none"
              >
                <option value="virtual">Virtual Consultation</option>
                <option value="studio_visit">Studio Visit</option>
                <option value="phone">Phone Consultation</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#11161D] text-white font-extrabold text-xs uppercase rounded-lg shadow-sm"
            >
              Publish Available Slot
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
