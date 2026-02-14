"use client";

import { useRouter } from "next/navigation";
import { useAuth, useFeatureGate } from "@/lib/auth";

export default function AccountPage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    tier,
    trialDaysRemaining,
    isTrialActive,
    isTrialExpired,
    login,
    logout,
    startTrial,
  } = useAuth();
  const { limits } = useFeatureGate();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-muted hover:text-foreground"
          >
            &larr; Back
          </button>
          <h1 className="font-semibold ml-4">Account</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Account status card */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Your Account</h2>

          {!user ? (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                Start a free trial to begin importing and reading scripts.
                No account required.
              </p>
              <button
                onClick={startTrial}
                className="py-3 px-6 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
              >
                Start Free Trial (30 days)
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tier badge */}
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    tier === "pro"
                      ? "bg-violet-100 text-violet-700"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {tier === "pro" ? "Pro" : "Free"}
                </span>

                {isTrialActive && trialDaysRemaining !== null && (
                  <span className="text-sm text-amber-600">
                    {trialDaysRemaining} day{trialDaysRemaining !== 1 ? "s" : ""} remaining in trial
                  </span>
                )}

                {isTrialExpired && (
                  <span className="text-sm text-red-500 font-medium">
                    Trial expired
                  </span>
                )}
              </div>

              {/* User info */}
              {isAuthenticated && user.email && (
                <p className="text-sm text-muted">
                  Signed in as <span className="text-foreground">{user.email}</span>
                </p>
              )}

              {!isAuthenticated && (
                <p className="text-sm text-muted">
                  Using local storage only. Sign in to sync across devices.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sign in / Sign up (if not authenticated) */}
        {user && !isAuthenticated && (
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-2">Sign In</h2>
            <p className="text-sm text-muted mb-4">
              Create an account to sync your scripts across devices and unlock cloud features.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => login("google")}
                className="w-full py-3 px-4 border border-border rounded-xl text-sm font-medium hover:bg-surface-hover transition-colors flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>

              <button
                onClick={() => login("apple")}
                className="w-full py-3 px-4 border border-border rounded-xl text-sm font-medium hover:bg-surface-hover transition-colors flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Continue with Apple
              </button>

              <div className="flex items-center gap-4 my-2">
                <div className="flex-1 border-t border-border" />
                <span className="text-xs text-muted">or</span>
                <div className="flex-1 border-t border-border" />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const email = formData.get("email") as string;
                  if (email) login("email", email);
                }}
                className="flex gap-2"
              >
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="flex-1 py-3 px-4 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/50"
                  required
                />
                <button
                  type="submit"
                  className="py-3 px-5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors"
                >
                  Sign In
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Subscription / Upgrade */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">
            {tier === "pro" ? "Your Plan" : "Upgrade to Pro"}
          </h2>

          {tier === "pro" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">&#10003;</span>
                Unlimited scripts
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">&#10003;</span>
                Premium TTS voices
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">&#10003;</span>
                Cloud sync across devices
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">&#10003;</span>
                Export to Markdown, PDF, FDX
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2 text-muted">Free</h3>
                  <ul className="space-y-1.5 text-sm">
                    <li>{limits.maxScripts} script</li>
                    <li>Browser voices</li>
                    <li>Local storage only</li>
                    <li>Markdown export</li>
                  </ul>
                </div>
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                  <h3 className="text-sm font-medium mb-2 text-accent">Pro</h3>
                  <ul className="space-y-1.5 text-sm">
                    <li>Unlimited scripts</li>
                    <li>Premium voices</li>
                    <li>Cloud sync</li>
                    <li>PDF + FDX export</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => {
                  // TODO: Open Stripe checkout or App Store subscription
                  alert("Subscription coming soon! For now, enjoy your free trial.");
                }}
                className="w-full py-3 px-6 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
              >
                Upgrade to Pro
              </button>
            </div>
          )}
        </div>

        {/* Sign out */}
        {user && (
          <div className="border-t border-border pt-6">
            <button
              onClick={async () => {
                await logout();
                router.push("/");
              }}
              className="text-sm text-red-500 hover:text-red-600 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
