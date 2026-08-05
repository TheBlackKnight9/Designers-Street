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
    push("✅ Active house switched for Studio", "ok");
    router.refresh();
  }

  const activeHouse = houses.find((h) => h.id === activeId);

  if (loading || houses.length === 0) return null;

  return (
    <div className="relative flex items-center gap-1.5 bg-white border border-[#ECE8DC] px-3 py-1.5 rounded-none shadow-2xs hover:border-[#17181D] transition-colors">
      <Store className="w-3.5 h-3.5 text-[#8A8A8A]" />
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">House:</span>
      <div className="relative flex items-center">
        <select
          value={activeId}
          onChange={(e) => handleSelectHouse(e.target.value)}
          aria-label="Select active designer house"
          className="appearance-none bg-transparent text-[#1A1A1A] font-sans text-xs font-bold pr-5 outline-none cursor-pointer"
        >
          <option value="">Select House…</option>
          {houses.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 text-[#8A8A8A] absolute right-0 pointer-events-none" />
      </div>
    </div>
  );
}
