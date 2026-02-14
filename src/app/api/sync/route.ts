import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/sync — Push local scripts to cloud
 *
 * Body: { userId: string, scripts: Script[] }
 *
 * TODO:
 * - Authenticate request (JWT cookie)
 * - Upsert scripts into cloud database (Postgres/Supabase/Planetscale)
 * - Handle conflict resolution (last-write-wins or merge strategy)
 * - Return updated syncedAt timestamps
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, scripts } = body;

  // Stub: acknowledge receipt
  return NextResponse.json({
    synced: (scripts || []).map((s: { id: string }) => ({
      id: s.id,
      syncedAt: Date.now(),
    })),
    message: "Sync stub — replace with real cloud storage",
  });
}

/**
 * GET /api/sync?userId=xxx — Pull scripts from cloud
 *
 * TODO:
 * - Authenticate request
 * - Fetch all scripts for the user from cloud database
 * - Return scripts array
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  // Stub: return empty
  return NextResponse.json({
    scripts: [],
    message: "Sync stub — no cloud scripts yet",
  });
}
