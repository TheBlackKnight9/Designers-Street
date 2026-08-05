"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Sparkles, Mail, Phone, ChevronDown } from "lucide-react";

type ConceptLead = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  budgetRange?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string;
  product: { id: string; name: string; designerName: string; category: string; images: string[] };
};

export default function AdminConceptLeadsPage() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<ConceptLead[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchLeads() {
    try {
      const res = await fetch("/api/concept-interest");
      const data = await res.json();
      if (data?.ok) {
        setLeads(data.data.leads || []);
      }
    } catch {
      /* error */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  async function handleStatusChange(id: string, newStatus: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/concept-interest/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
        );
      }
    } catch {
      /* error */
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Bar */}
      <AdminTopBar
        title="Concept Art & Bespoke Leads"
        subtitle="Manage high-value bespoke inquiries, custom quotes & prototype concept interest leads"
      />

      {loading ? (
        <div className="space-y-3">
          <div className="h-28 bg-white/70 rounded-2xl animate-pulse border border-[#ECE8DC]" />
          <div className="h-28 bg-white/70 rounded-2xl animate-pulse border border-[#ECE8DC]" />
        </div>
      ) : leads.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-[#ECE8DC] bg-white space-y-1">
          <Sparkles className="w-8 h-8 text-[#F6D746] mx-auto mb-2" />
          <p className="text-sm font-bold text-[#1A1A1A]">No concept art leads received yet</p>
          <p className="text-xs text-[#8A8A8A] font-medium">Inquiries submitted on prototype concept listings will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#ECE8DC] overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#ECE8DC] flex justify-between items-center bg-[#FAF8F5]">
            <h2 className="font-display text-sm font-bold uppercase text-[#1A1A1A]">
              Inquiry Leads Queue
            </h2>
            <span className="text-xs font-mono font-bold text-[#8A8A8A]">
              Total Leads: {leads.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#ECE8DC] text-[11px] font-bold uppercase tracking-wider text-[#8A8A8A] bg-[#FAF8F5]">
                  <th className="py-3 px-4">Concept Piece</th>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Budget Segment</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE8DC]">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {l.product?.images?.[0] && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={l.product.images[0]} alt="" className="w-10 h-12 object-cover rounded-lg flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-[#1A1A1A] truncate max-w-[160px]">{l.product?.name || "Concept Item"}</p>
                          <p className="text-[10px] text-[#8A8A8A]">{l.product?.designerName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-xs text-[#1A1A1A]">
                      {l.name}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-[#1A1A1A]">
                      <div className="flex flex-col gap-0.5">
                        <a href={`mailto:${l.email}`} className="hover:underline flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#8A8A8A]" />
                          {l.email}
                        </a>
                        {l.phone && (
                          <a href={`tel:${l.phone}`} className="hover:underline flex items-center gap-1 text-[#8A8A8A]">
                            <Phone className="w-3 h-3" />
                            {l.phone}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-emerald-700">
                      {l.budgetRange || "Standard Quote"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#8A8A8A] font-medium">
                      {new Date(l.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      <AdminStatusBadge status={l.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="relative inline-block">
                        <select
                          disabled={updatingId === l.id}
                          value={l.status}
                          aria-label="Update lead status"
                          onChange={(e) => handleStatusChange(l.id, e.target.value)}
                          className="appearance-none bg-[#F4F0E5] border border-[#ECE8DC] text-[#1A1A1A] font-sans text-xs font-bold px-3 py-1.5 pr-7 rounded-full outline-none cursor-pointer hover:border-[#17181D]"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="quoted">Quoted</option>
                          <option value="converted">Converted</option>
                          <option value="closed">Closed</option>
                        </select>
                        <ChevronDown className="w-3 h-3 text-[#8A8A8A] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
