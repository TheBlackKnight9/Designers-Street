import { isRemoteApiEnabled } from "./catalog";
import {
  DEMO_MEASUREMENT_PROFILES,
  DEMO_APPOINTMENT_SLOTS,
  DEMO_APPOINTMENT_REQUESTS,
  DEMO_BESPOKE_REQUESTS,
} from "@/lib/phase10-demo";
import type {
  MeasurementProfileData,
  AppointmentSlotData,
  AppointmentRequestData,
  BespokeRequestData,
  BespokeMessageData,
} from "@/lib/types";

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { cache: "no-store", ...init });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const payload = await res.json();
  if (payload.ok === false) throw new Error(payload.error || "API Error");
  return payload.data ?? payload;
}

// ── Measurement Profiles ──────────────────────
export async function fetchMeasurementProfiles(): Promise<MeasurementProfileData[]> {
  if (!isRemoteApiEnabled()) return DEMO_MEASUREMENT_PROFILES;
  try {
    return await getJson<MeasurementProfileData[]>("/api/account/measurements");
  } catch {
    return DEMO_MEASUREMENT_PROFILES;
  }
}

export async function createMeasurementProfile(data: Partial<MeasurementProfileData>): Promise<MeasurementProfileData> {
  if (!isRemoteApiEnabled()) {
    const created: MeasurementProfileData = {
      id: `mp-${Date.now()}`,
      userId: "usr-1",
      name: data.name || "Custom Fit",
      isDefault: !!data.isDefault,
      unit: data.unit || "inches",
      height: data.height,
      chest: data.chest,
      waist: data.waist,
      hip: data.hip,
      shoulder: data.shoulder,
      sleeve: data.sleeve,
      inseam: data.inseam,
      neck: data.neck,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };
    DEMO_MEASUREMENT_PROFILES.unshift(created);
    return created;
  }
  return getJson<MeasurementProfileData>("/api/account/measurements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// ── Appointment Slots & Requests ─────────────
export async function fetchAppointmentSlots(designerId: string, date?: string): Promise<AppointmentSlotData[]> {
  if (!isRemoteApiEnabled()) {
    return DEMO_APPOINTMENT_SLOTS.filter((s) => s.designerId === designerId && (!date || s.date === date));
  }
  try {
    const q = new URLSearchParams({ designerId, ...(date ? { date } : {}) }).toString();
    return await getJson<AppointmentSlotData[]>(`/api/appointments/slots?${q}`);
  } catch {
    return DEMO_APPOINTMENT_SLOTS.filter((s) => s.designerId === designerId);
  }
}

export async function createAppointmentSlot(designerId: string, data: Partial<AppointmentSlotData>): Promise<AppointmentSlotData> {
  if (!isRemoteApiEnabled()) {
    const created: AppointmentSlotData = {
      id: `slot-${Date.now()}`,
      designerId,
      date: data.date || "2026-08-10",
      startTime: data.startTime || "10:00",
      endTime: data.endTime || "11:00",
      type: data.type || "virtual",
      isAvailable: true,
    };
    DEMO_APPOINTMENT_SLOTS.push(created);
    return created;
  }
  return getJson<AppointmentSlotData>("/api/appointments/slots", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, designerId }),
  });
}

export async function fetchAppointments(designerId?: string): Promise<AppointmentRequestData[]> {
  if (!isRemoteApiEnabled()) {
    if (designerId) return DEMO_APPOINTMENT_REQUESTS.filter((a) => a.designerId === designerId);
    return DEMO_APPOINTMENT_REQUESTS;
  }
  try {
    const url = designerId ? `/api/appointments?designerId=${encodeURIComponent(designerId)}` : "/api/appointments";
    return await getJson<AppointmentRequestData[]>(url);
  } catch {
    return DEMO_APPOINTMENT_REQUESTS;
  }
}

export async function bookAppointment(data: Partial<AppointmentRequestData>): Promise<AppointmentRequestData> {
  if (!isRemoteApiEnabled()) {
    const created: AppointmentRequestData = {
      id: `app-${Date.now()}`,
      userId: "usr-1",
      userName: "Aria Dev",
      designerId: data.designerId || "dh-1",
      designerName: "MAISON RIVIÈRE",
      slotId: data.slotId,
      preferredDate: data.preferredDate || "2026-08-05",
      preferredTime: data.preferredTime || "11:00 AM",
      appointmentType: data.appointmentType || "virtual",
      purpose: data.purpose || "Bridal Consultation",
      message: data.message,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    DEMO_APPOINTMENT_REQUESTS.unshift(created);
    return created;
  }
  return getJson<AppointmentRequestData>("/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateAppointmentStatus(id: string, status: string, statusNotes?: string): Promise<AppointmentRequestData> {
  if (!isRemoteApiEnabled()) {
    const found = DEMO_APPOINTMENT_REQUESTS.find((a) => a.id === id);
    if (found) {
      found.status = status as any;
      found.statusNotes = statusNotes;
    }
    return found || DEMO_APPOINTMENT_REQUESTS[0];
  }
  return getJson<AppointmentRequestData>(`/api/appointments/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, statusNotes }),
  });
}

// ── Bespoke Requests & Threads ────────────────
export async function fetchBespokeRequests(designerId?: string): Promise<BespokeRequestData[]> {
  if (!isRemoteApiEnabled()) {
    if (designerId) return DEMO_BESPOKE_REQUESTS.filter((r) => r.designerId === designerId);
    return DEMO_BESPOKE_REQUESTS;
  }
  try {
    const url = designerId ? `/api/bespoke?designerId=${encodeURIComponent(designerId)}` : "/api/bespoke";
    return await getJson<BespokeRequestData[]>(url);
  } catch {
    return DEMO_BESPOKE_REQUESTS;
  }
}

export async function createBespokeRequest(data: Partial<BespokeRequestData>): Promise<BespokeRequestData> {
  if (!isRemoteApiEnabled()) {
    const created: BespokeRequestData = {
      id: `bespoke-${Date.now()}`,
      userId: "usr-1",
      userName: "Aria Dev",
      designerId: data.designerId || "dh-1",
      designerName: "MAISON RIVIÈRE",
      category: data.category || "Custom Garment",
      occasion: data.occasion || "Couture Gala",
      budget: data.budget || 250000,
      deadline: data.deadline,
      notes: data.notes,
      measurementProfileId: data.measurementProfileId,
      measurements: data.measurements || {},
      referenceImages: data.referenceImages || [],
      attachments: [],
      messages: [
        {
          id: `msg-${Date.now()}`,
          requestId: `bespoke-${Date.now()}`,
          senderId: "usr-1",
          senderRole: "buyer",
          senderName: "Aria Dev",
          message: data.notes || "Bespoke request submitted.",
          createdAt: new Date().toISOString(),
        },
      ],
      status: "submitted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    DEMO_BESPOKE_REQUESTS.unshift(created);
    return created;
  }
  return getJson<BespokeRequestData>("/api/bespoke", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateBespokeStatus(id: string, status: string, statusNotes?: string): Promise<BespokeRequestData> {
  if (!isRemoteApiEnabled()) {
    const found = DEMO_BESPOKE_REQUESTS.find((r) => r.id === id);
    if (found) {
      found.status = status as any;
      found.statusNotes = statusNotes;
    }
    return found || DEMO_BESPOKE_REQUESTS[0];
  }
  return getJson<BespokeRequestData>(`/api/bespoke/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, statusNotes }),
  });
}

export async function sendBespokeMessage(id: string, message: string, senderRole: "buyer" | "designer" = "buyer"): Promise<BespokeMessageData> {
  if (!isRemoteApiEnabled()) {
    const req = DEMO_BESPOKE_REQUESTS.find((r) => r.id === id);
    const newMsg: BespokeMessageData = {
      id: `msg-${Date.now()}`,
      requestId: id,
      senderId: "usr-1",
      senderRole,
      senderName: senderRole === "buyer" ? "Client" : "Master Weaver",
      message,
      createdAt: new Date().toISOString(),
    };
    if (req) {
      req.messages = req.messages || [];
      req.messages.push(newMsg);
    }
    return newMsg;
  }
  return getJson<BespokeMessageData>(`/api/bespoke/${encodeURIComponent(id)}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, senderRole }),
  });
}
