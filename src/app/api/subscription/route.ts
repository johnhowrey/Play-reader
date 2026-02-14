import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/subscription — Create or update subscription
 *
 * Body: { userId: string, plan: "pro", paymentToken?: string }
 *
 * TODO:
 * - Validate payment via Stripe / App Store / Google Play
 * - Update user tier in database
 * - Return updated user object
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, plan } = body;

  // Stub: echo upgrade
  return NextResponse.json({
    user: {
      id: userId,
      tier: plan || "pro",
      subscriptionExpiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    },
    message: "Subscription stub — replace with real payment processing",
  });
}

/**
 * GET /api/subscription?userId=xxx — Get subscription status
 *
 * TODO:
 * - Look up user subscription in database
 * - Check if subscription is still valid
 * - Return tier, expiry, etc.
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  // Stub: return free tier
  return NextResponse.json({
    tier: "free",
    subscriptionExpiresAt: null,
    message: "Subscription stub — no payment integration yet",
  });
}

/**
 * DELETE /api/subscription — Cancel subscription
 *
 * TODO: Cancel via Stripe, update user tier at period end.
 */
export async function DELETE(request: NextRequest) {
  return NextResponse.json({
    message: "Subscription cancelled (stub)",
  });
}
