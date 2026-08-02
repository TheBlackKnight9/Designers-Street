"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  budgetRange: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  product?: { name: string };
};

export default function DesignerConceptLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLeads() {
    try {
      const res = await fetch("/api/concept-interest");
      const data = await res.json();
      if (data?.ok && Array.isArray(data.data?.leads)) {
        setLeads(data.data.leads);
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

  return (
    <main className="min-h-screen bg-paper pb-24 px-4 pt-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cloud pb-4">
        <div>
          <Link href="/dashboard" className="text-xs font-bold text-stone hover:text-charcoal">
            ← Dashboard
          </Link>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal mt-1">
            🎨 Concept Art Leads &amp; Bespoke Inquiries
          </h1>
          <p className="text-xs text-stone mt-0.5">
            Customer pre-orders, bespoke quotes &amp; concept interest leads for your runway prototypes
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-stone">Total Leads: {leads.length}</span>
      </div>

      <div className="bg-white rounded-3xl border border-cloud shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone animate-pulse font-bold">Loading concept leads...</div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone">No concept showcase inquiries received yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-mist text-[10px] font-bold uppercase tracking-wider text-stone border-b border-cloud">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Product Title</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">Est. Budget</th>
                  <th className="p-3.5">Notes</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud text-charcoal">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-mist/30">
                    <td className="p-3.5 font-mono text-stone">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td className="p-3.5 font-bold">{lead.product?.name || "Concept Showcase"}</td>
                    <td className="p-3.5 font-bold">{lead.name}</td>
                    <td className="p-3.5 font-mono">
                      <div>{lead.email}</div>
                      {lead.phone && <div className="text-stone">{lead.phone}</div>}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-800">{lead.budgetRange || "Flexible"}</td>
                    <td className="p-3.5 text-stone max-w-xs truncate">{lead.notes || "No notes"}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-md bg-amber-100 text-amber-900">
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
