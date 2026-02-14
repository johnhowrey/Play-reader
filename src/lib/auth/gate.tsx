"use client";

import { useAuth } from "./context";
import type { TierLimits } from "../types";

/**
 * Hook for checking feature access based on subscription tier.
 *
 * Usage:
 *   const { canImport, canUsePremiumVoices, isReadOnly, showUpgrade } = useFeatureGate();
 *   if (!canImport) showUpgrade("Import more scripts");
 */
export function useFeatureGate() {
  const { tier, limits, isTrialActive, isTrialExpired, user } = useAuth();

  return {
    tier,
    limits,

    // Can the user import a new script?
    canImportScript: (currentScriptCount: number) => {
      if (tier === "pro") return true;
      if (isTrialExpired) return false;
      return currentScriptCount < limits.maxScripts;
    },

    // Can the user edit scripts / add annotations?
    isReadOnly: isTrialExpired && tier === "free",

    // Can the user use premium TTS voices?
    canUsePremiumVoices: limits.premiumVoices,

    // Can the user sync to cloud?
    canCloudSync: limits.cloudSync,

    // Allowed export formats
    exportFormats: limits.exportFormats,

    // Is the user in an active trial?
    isTrialActive,
    isTrialExpired,

    // Has the user ever started a trial?
    hasStartedTrial: !!user?.trialStartedAt,
  };
}

/**
 * Component that renders children only if a feature check passes.
 * Shows an upgrade prompt otherwise.
 */
export function FeatureGate({
  check,
  fallback,
  children,
}: {
  check: (limits: TierLimits) => boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { limits } = useAuth();

  if (check(limits)) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
}
