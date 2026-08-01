import { DataProvider } from "@/context/DataContext";

/** The legacy local catalog editor is isolated to /admin. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DataProvider>{children}</DataProvider>;
}
