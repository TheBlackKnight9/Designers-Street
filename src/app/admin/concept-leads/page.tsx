"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/mock-data";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
            Concept Art &amp; Bespoke Lead Capture Desk
          </h1>
          <p className="text-xs text-stone mt-1">
            Manage high-value bespoke inquiries, custom size quotes &amp; concept art prototype interest leads
          </p>
        </div>

        <Link
          href="/admin"
          className="px-5 py-2.5 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-xs hover:bg-black"
        >
          ← Admin Console
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-28 bg-mist rounded-3xl animate-pulse" />
          <div className="h-28 bg-mist rounded-3xl animate-pulse" />
        </div>
      ) : leads.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-cloud bg-white">
          <p className="text-sm font-semibold text-charcoal">🎨 No concept art leads received yet.</p>
          <p className="text-xs text-stone mt-1">Inquiries submitted on prototype concept listings will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-cloud shadow-xs overflow-hidden">
          <div className="p-5 border-b border-cloud flex justify-between items-center">
            <h2 className="font-display text-sm font-bold uppercase text-charcoal">Inquiry Leads Desk</h2>
            <span className="text-xs font-mono font-bold text-stone">Total Leads: {leads.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-mist text-[10px] font-bold uppercase tracking-wider text-stone border-b border-cloud">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Designer / Prototype Item</th>
                  <th className="p-3.5">Customer Contact</th>
                  <th className="p-3.5">Budget Range</th>
                  <th className="p-3.5">Sizing &amp; Notes</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud text-charcoal">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-mist/30">
                    <td className="p-3.5 font-mono text-[11px] text-stone">
                      {new Date(lead.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-charcoal">{lead.product?.name}</p>
                      <span className="text-[10px] uppercase font-bold text-stone">House: {lead.product?.designerName}</span>
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-charcoal">{lead.name}</p>
                      <p className="text-[10px] font-mono text-stone">{lead.email}</p>
                      {lead.phone && <p className="text-[10px] font-mono text-stone">{lead.phone}</p>}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-800">
                      {lead.budgetRange || "Flexible"}
                    </td>
                    <td className="p-3.5 max-w-xs truncate text-[11px] text-stone">
                      {lead.notes || "No extra notes"}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-full ${
                          lead.status === "converted"
                            ? "bg-emerald-100 text-emerald-900"
                            : lead.status === "contacted"
                            ? "bg-blue-100 text-blue-900"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      {lead.status === "new" && (
                        <button
                          type="button"
                          disabled={updatingId === lead.id}
                          onClick={() => handleStatusChange(lead.id, "contacted")}
                          className="px-3 py-1 bg-blue-900 text-white text-[10px] font-bold uppercase rounded-full"
                        >
                          Mark Contacted
                        </button>
                      )}
                      {lead.status !== "converted" && (
                        <button
                          type="button"
                          disabled={updatingId === lead.id}
                          onClick={() => handleStatusChange(lead.id, "converted")}
                          className="px-3 py-1 bg-emerald-800 text-white text-[10px] font-bold uppercase rounded-full"
                        >
                          Mark Converted
                        </button>
                      )}
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
