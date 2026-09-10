"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/Toast";
import { Store, ChevronDown } from "lucide-react";

type HouseOption = {
  id: string;
  name: string;
  handle: string;
};

export function AdminHouseSwitcher() {
  const router = useRouter();
  const { push } = useToast();
  const [houses, setHouses] = useState<HouseOption[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/designers")
      .then((res) => res.json())
      .then((body) => {
        if (body?.ok && Array.isArray(body.data?.houses)) {
          setHouses(
            body.data.houses.map((h: { id: string; name: string; handle: string }) => ({
              id: h.id,
              name: h.name,
              handle: h.handle,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_active_designer_id="));
    if (match) {
      setActiveId(match.split("=")[1]);
    }
  }, []);

  function handleSelectHouse(houseId: string) {
    if (!houseId) return;
    document.cookie = `admin_active_designer_id=${houseId}; path=/; max-age=86400`;
    setActiveId(houseId);
    push("Active house switched for Studio", "ok");
    router.refresh();
  }

  if (loading || houses.length === 0) return null;

  return (
    <div className="relative flex items-center gap-2 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-2xs hover:border-zinc-300 transition-colors">
      <Store className="w-3.5 h-3.5 text-zinc-500" />
      <span className="text-[11px] font-medium text-zinc-500">House:</span>
      <div className="relative flex items-center">
        <select
          value={activeId}
          onChange={(e) => handleSelectHouse(e.target.value)}
          aria-label="Select active designer house"
          className="appearance-none bg-transparent text-zinc-900 font-sans text-xs font-semibold pr-5 outline-none cursor-pointer"
        >
          <option value="">Select House…</option>
          {houses.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-0 pointer-events-none" />
      </div>
    </div>
  );
}
