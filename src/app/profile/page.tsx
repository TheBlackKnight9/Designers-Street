"use client";

import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

const TABS = ["Orders", "Measurements", "Addresses"];

export default function ProfilePage() {
  return (
    <>
      <TopBar />
      <main className="min-h-screen">
        {/* Header */}
        <div className="px-4 pt-5 pb-4">
          <h1 className="font-display text-2xl font-bold text-[#2B2B2B] uppercase tracking-wide">
            Account
          </h1>
        </div>

        {/* User placeholder */}
        <div className="px-4 pb-6">
          <div className="flex items-center gap-4 p-4 bg-[#F0F0F0] rounded-xl">
            <div className="w-14 h-14 rounded-full bg-[#E0E0E0] flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-[#A0A0A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <p className="font-sans text-sm font-semibold text-[#2B2B2B]">Guest</p>
              <p className="font-sans text-xs text-[#7A7A7A]">Sign in to view orders and saved details</p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="px-4 space-y-3 pb-8">
          {TABS.map((tab) => (
            <div key={tab} className="border border-[#E0E0E0] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="font-sans text-sm font-semibold text-[#2B2B2B]">{tab}</span>
                <svg className="w-4 h-4 text-[#A0A0A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
              <p className="font-sans text-xs text-[#7A7A7A] mt-1">
                {tab === "Orders" && "Track orders and view purchase history."}
                {tab === "Measurements" && "Saved body measurements for bespoke orders."}
                {tab === "Addresses" && "Manage delivery addresses."}
              </p>
            </div>
          ))}

          {/* Consultations */}
          <div className="border border-[#E0E0E0] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-sm font-semibold text-[#2B2B2B]">Consultations</span>
              <svg className="w-4 h-4 text-[#A0A0A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
            <p className="font-sans text-xs text-[#7A7A7A] mt-1">
              Upcoming and past bespoke design consultations.
            </p>
          </div>

          {/* Help */}
          <div className="border border-[#E0E0E0] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-sm font-semibold text-[#2B2B2B]">Help & Support</span>
              <svg className="w-4 h-4 text-[#A0A0A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
            <p className="font-sans text-xs text-[#7A7A7A] mt-1">
              Contact our concierge team or submit a return request.
            </p>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
