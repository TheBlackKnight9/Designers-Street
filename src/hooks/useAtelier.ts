"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchMeasurementProfiles,
  fetchAppointments,
  fetchAppointmentSlots,
  fetchBespokeRequests,
  createMeasurementProfile,
  bookAppointment,
  createBespokeRequest,
  updateAppointmentStatus,
  updateBespokeStatus,
  sendBespokeMessage,
} from "@/lib/api/atelier";
import type {
  MeasurementProfileData,
  AppointmentSlotData,
  AppointmentRequestData,
  BespokeRequestData,
} from "@/lib/types";

export function useMeasurementProfiles() {
  const [profiles, setProfiles] = useState<MeasurementProfileData[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    fetchMeasurementProfiles().then((res) => {
      setProfiles(res);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const addProfile = async (data: Partial<MeasurementProfileData>) => {
    const created = await createMeasurementProfile(data);
    reload();
    return created;
  };

  return { profiles, loading, reload, addProfile };
}

export function useAppointmentSlots(designerId: string, date?: string) {
  const [slots, setSlots] = useState<AppointmentSlotData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!designerId) return;
    let cancelled = false;
    fetchAppointmentSlots(designerId, date).then((res) => {
      if (!cancelled) {
        setSlots(res);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [designerId, date]);

  return { slots, loading };
}

export function useAppointments(designerId?: string) {
  const [appointments, setAppointments] = useState<AppointmentRequestData[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    fetchAppointments(designerId).then((res) => {
      setAppointments(res);
      setLoading(false);
    });
  }, [designerId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const book = async (data: Partial<AppointmentRequestData>) => {
    const created = await bookAppointment(data);
    reload();
    return created;
  };

  const setStatus = async (id: string, status: string, statusNotes?: string) => {
    const updated = await updateAppointmentStatus(id, status, statusNotes);
    reload();
    return updated;
  };

  return { appointments, loading, reload, book, setStatus };
}

export function useBespokeRequests(designerId?: string) {
  const [requests, setRequests] = useState<BespokeRequestData[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    fetchBespokeRequests(designerId).then((res) => {
      setRequests(res);
      setLoading(false);
    });
  }, [designerId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const createRequest = async (data: Partial<BespokeRequestData>) => {
    const created = await createBespokeRequest(data);
    reload();
    return created;
  };

  const setStatus = async (id: string, status: string, statusNotes?: string) => {
    const updated = await updateBespokeStatus(id, status, statusNotes);
    reload();
    return updated;
  };

  const postMessage = async (id: string, message: string, senderRole: "buyer" | "designer" = "buyer") => {
    const msg = await sendBespokeMessage(id, message, senderRole);
    reload();
    return msg;
  };

  return { requests, loading, reload, createRequest, setStatus, postMessage };
}
