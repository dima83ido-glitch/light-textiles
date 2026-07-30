import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Lightweight liveness+readiness check for Render's healthCheckPath / external uptime
// monitors. Deliberately public (no session check — health probes shouldn't need auth)
// and deliberately minimal in what it reveals on failure (no stack trace, no connection
// string) since it's reachable by anyone. Unlike "/", this doesn't render the homepage
// (categories/settings/banners/etc.) — it only proves the process is up and the database
// is reachable, which is what a deploy health check actually needs to know.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
