/**
 * Lightweight funnel analytics tracker.
 * Replace the `send` implementation with your analytics provider
 * (e.g. Google Analytics, Mixpanel, PostHog) when ready.
 */

type FunnelEvent =
  | "lead_captured"
  | "audit_started"
  | "audit_completed"
  | "cta_clicked"
  | "breakthrough_registered";

interface EventPayload {
  [key: string]: string | number | boolean | null | undefined;
}

const send = (event: FunnelEvent, payload?: EventPayload) => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${event}`, payload ?? "");
  }

  // TODO: Replace with real provider
  // Example: window.gtag?.("event", event, payload);
  // Example: posthog.capture(event, payload);
};

export const analytics = {
  leadCaptured: (variant: string) =>
    send("lead_captured", { variant }),

  auditStarted: (leadId?: string | null) =>
    send("audit_started", { lead_id: leadId ?? undefined }),

  auditCompleted: (scores: Record<string, number>) =>
    send("audit_completed", scores),

  ctaClicked: (label: string, destination: string) =>
    send("cta_clicked", { label, destination }),

  breakthroughRegistered: () =>
    send("breakthrough_registered"),
};
