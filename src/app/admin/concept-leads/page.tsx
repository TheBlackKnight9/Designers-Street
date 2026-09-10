"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  Sparkles,
  Mail,
  Phone,
  ChevronDown,
  Search,
  MessageSquareQuote,
  Clock,
  CheckCircle2,
  DollarSign,
  Layers,
} from "lucide-react";

type ConceptLead = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  budgetRange?: string | null;
  notes?: string | null;
  status: string;
  sourceType: string;
  createdAt: string;
  product?: { id: string; name: string; designerName: string; category: string; images: string[] };
  post?: { id: string; caption: string; designerName: string; image: string; tag: string };
};

export default function AdminConceptLeadsPage() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<ConceptLead[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  async function fetchLeads() {
    setLoading(true);
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

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesSearch =
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.phone && l.phone.includes(searchQuery)) ||
        (l.product?.designerName && l.product.designerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.post?.designerName && l.post.designerName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "ALL" ? true : l.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchQuery, statusFilter]);

  const newCount = leads.filter((l) => l.status === "NEW").length;
  const inProgressCount = leads.filter((l) => ["DESIGNER_CONTACTED", "QUOTED"].includes(l.status)).length;
  const confirmedCount = leads.filter((l) => l.status === "CONFIRMED").length;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Bar */}
      <AdminTopBar
        title="Bespoke & Prototype Inquiries"
        subtitle="Manage custom commission requests, high-value atelier consultations, and prototype buyer interest"
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <AdminStatCard
          label="Total Leads"
          value={String(leads.length)}
          icon={<MessageSquareQuote className="w-4 h-4 text-zinc-600" />}
          badgeBg="bg-zinc-100 text-zinc-900"
        />
        <AdminStatCard
          label="New Inquiries"
          value={String(newCount)}
          icon={<Sparkles className="w-4 h-4 text-zinc-900" />}
          badgeBg="bg-zinc-950 text-white"
        />
        <AdminStatCard
          label="In Negotiation"
          value={String(inProgressCount)}
          icon={<Clock className="w-4 h-4 text-zinc-600" />}
          badgeBg="bg-zinc-100 text-zinc-900"
        />
        <AdminStatCard
          label="Confirmed Bespoke"
          value={String(confirmedCount)}
          icon={<CheckCircle2 className="w-4 h-4 text-zinc-900" />}
          badgeBg="bg-zinc-100 text-zinc-900"
        />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Tabs */}
            <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  statusFilter === "ALL" ? "bg-white text-zinc-950 shadow-2xs font-semibold" : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                All ({leads.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("NEW")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  statusFilter === "NEW" ? "bg-white text-zinc-950 shadow-2xs font-semibold" : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                New ({newCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("QUOTED")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  statusFilter === "QUOTED" ? "bg-white text-zinc-950 shadow-2xs font-semibold" : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                Quoted
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("CONFIRMED")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  statusFilter === "CONFIRMED" ? "bg-white text-zinc-950 shadow-2xs font-semibold" : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                Confirmed
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lead, designer, or email..."
                className="pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg w-56 sm:w-64 focus:outline-none focus:ring-1 focus:ring-zinc-950 text-zinc-900 placeholder:text-zinc-400"
              />
            </div>
          </div>

          <span className="text-xs text-zinc-500 font-medium">
            Showing <strong className="text-zinc-900">{filteredLeads.length}</strong> inquiries
          </span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-500 animate-pulse">
            Loading bespoke inquiries...
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500">
            {leads.length === 0
              ? "No concept art or bespoke leads received yet. Client inquiries on concept listings will appear here."
              : "No inquiry records match your search filter."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200/80 bg-zinc-50/75 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Source & Reference</th>
                  <th className="py-3 px-4 font-semibold">Client Name</th>
                  <th className="py-3 px-4 font-semibold">Contact Details</th>
                  <th className="py-3 px-4 font-semibold">Target Budget</th>
                  <th className="py-3 px-4 font-semibold">Submitted</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Workflow Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 text-xs">
                {filteredLeads.map((l) => (
                  <tr key={l.id} className="hover:bg-zinc-50/60 transition-colors">
                    {/* Source Item */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {l.sourceType === "POST" ? (
                          l.post?.image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={l.post.image}
                              alt=""
                              className="w-10 h-12 object-cover rounded-lg border border-zinc-200 shrink-0 bg-zinc-100"
                            />
                          ) : null
                        ) : (
                          l.product?.images?.[0] && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={l.product.images[0]}
                              alt=""
                              className="w-10 h-12 object-cover rounded-lg border border-zinc-200 shrink-0 bg-zinc-100"
                            />
                          )
                        )}
                        <div>
                          <span
                            className={`inline-block px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-md mb-1 ${
                              l.sourceType === "POST"
                                ? "bg-zinc-100 text-zinc-800 border border-zinc-200"
                                : "bg-zinc-950 text-white"
                            }`}
                          >
                            {l.sourceType === "POST" ? "Editorial Post" : "Concept Prototype"}
                          </span>
                          <p className="font-semibold text-zinc-950 truncate max-w-[170px]">
                            {l.sourceType === "POST"
                              ? l.post?.caption || "Lookbook Feature"
                              : l.product?.name || "Bespoke Prototype"}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            {l.sourceType === "POST" ? l.post?.designerName : l.product?.designerName}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Client Name */}
                    <td className="py-3.5 px-4 font-semibold text-zinc-950">
                      {l.name}
                    </td>

                    {/* Contact Details */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <a
                          href={`mailto:${l.email}`}
                          className="text-zinc-900 hover:text-zinc-600 font-medium inline-flex items-center gap-1.5 group"
                        >
                          <Mail className="w-3 h-3 text-zinc-400 group-hover:text-zinc-600" />
                          <span>{l.email}</span>
                        </a>
                        {l.phone && (
                          <div>
                            <a
                              href={`tel:${l.phone}`}
                              className="text-zinc-500 hover:text-zinc-800 inline-flex items-center gap-1.5 group"
                            >
                              <Phone className="w-3 h-3 text-zinc-400 group-hover:text-zinc-600" />
                              <span className="font-mono">{l.phone}</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Budget Range */}
                    <td className="py-3.5 px-4 font-mono font-medium text-zinc-950">
                      {l.budgetRange || "Standard Quote"}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">
                      {new Date(l.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <AdminStatusBadge status={l.status} />
                    </td>

                    {/* Workflow Select */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="relative inline-block">
                        <select
                          disabled={updatingId === l.id}
                          value={l.status}
                          aria-label="Update lead status"
                          onChange={(e) => handleStatusChange(l.id, e.target.value)}
                          className="appearance-none bg-zinc-50 border border-zinc-200 text-zinc-900 font-medium text-xs px-3 py-1.5 pr-7 rounded-lg outline-none cursor-pointer hover:bg-white focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-colors"
                        >
                          <option value="NEW">New</option>
                          <option value="DESIGNER_CONTACTED">Designer Contacted</option>
                          <option value="QUOTED">Quoted</option>
                          <option value="CONFIRMED">Confirmed / Converted</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
