import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth — Login / register
 *
 * Body: { provider: "google" | "apple" | "email", token?: string, email?: string }
 *
 * TODO: Validate OAuth tokens, create/find user in database,
 *       return JWT session cookie.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { provider, token, email } = body;

  // Stub: echo back a mock user
  return NextResponse.json({
    user: {
      id: "stub-user-id",
      email: email || "",
      authProvider: provider,
      tier: "free",
      trialStartedAt: Date.now(),
      trialExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      subscriptionExpiresAt: null,
      createdAt: Date.now(),
    },
    message: "Auth stub — replace with real implementation",
  });
}

/**
 * GET /api/auth — Get current user from session
 *
 * TODO: Read JWT from cookie, validate, return user data.
 */
export async function GET() {
  return NextResponse.json({
    user: null,
    message: "Auth stub — no session implementation yet",
  });
}

/**
 * DELETE /api/auth — Logout
 *
 * TODO: Clear session cookie.
 */
export async function DELETE() {
  return NextResponse.json({
    message: "Logged out (stub)",
  });
}
