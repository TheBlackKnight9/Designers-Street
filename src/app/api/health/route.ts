import { checkDatabaseConnection } from "@/server/db";
import { isDatabaseEnabled, getAppEnv } from "@/server/utils/env";
import { isSupabaseConfigured } from "@/server/auth/supabase";
import { isCloudinaryConfigured } from "@/server/media/cloudinary";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const wantsDb = isDatabaseEnabled();
  let database: "connected" | "disconnected" | "skipped" = "skipped";

  if (wantsDb) {
    database = (await checkDatabaseConnection()) ? "connected" : "disconnected";
  } else if (process.env.DATABASE_URL) {
    database = (await checkDatabaseConnection())
      ? "connected"
      : "disconnected";
  }

  const healthy =
    database === "connected" || database === "skipped" || !wantsDb;

  return NextResponse.json(
    {
      ok: healthy || database === "disconnected",
      status: wantsDb && database === "disconnected" ? "degraded" : "ok",
      api: "ok",
      database,
      useDatabase: wantsDb,
      supabaseConfigured: isSupabaseConfigured(),
      cloudinaryConfigured: isCloudinaryConfigured(),
      environment: getAppEnv(),
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
