import type { PostHog } from "@posthog/react";
import type { BeforeSendFn, CaptureResult, PostHogConfig } from "posthog-js";

type AnalyticsValue = string | number | boolean;

type AnalyticsProperties = Record<string, AnalyticsValue | undefined>;

const ABSOLUTE_URL_KEYS = new Set(["$current_url", "$initial_current_url", "$prev_pageview_url"]);
const PATHNAME_KEYS = new Set(["$pathname", "$prev_pageview_pathname"]);
const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";

export const POSTHOG_TOKEN =
  import.meta.env.VITE_PUBLIC_POSTHOG_TOKEN ?? import.meta.env.VITE_PUBLIC_POSTHOG_KEY ?? "";

export const analyticsEvents = {
  dashboardExported: "dashboard exported",
  dashboardFetchFailed: "dashboard fetch failed",
  dashboardFetchSucceeded: "dashboard fetch succeeded",
  orgImportCompleted: "org import completed",
  repoLinkClicked: "repo link clicked",
  settingsOpened: "settings opened",
  themeChanged: "theme changed",
  userDetailOpened: "user detail opened",
} as const;

export function sanitizeAbsoluteUrl(value: string): string {
  try {
    const url = new URL(value, window.location.origin);
    return `${url.origin}${url.pathname}`;
  } catch {
    return value.split("?")[0] ?? value;
  }
}

export function sanitizePathname(value: string): string {
  try {
    const url = new URL(value, window.location.origin);
    return url.pathname;
  } catch {
    return value.split("?")[0] ?? value;
  }
}

export function sanitizeCaptureResult(captureResult: CaptureResult | null): CaptureResult | null {
  if (!captureResult?.properties) return captureResult;

  const properties = { ...captureResult.properties };

  for (const [key, value] of Object.entries(properties)) {
    if (typeof value !== "string") continue;

    if (ABSOLUTE_URL_KEYS.has(key)) {
      properties[key] = sanitizeAbsoluteUrl(value);
      continue;
    }

    if (PATHNAME_KEYS.has(key)) {
      properties[key] = sanitizePathname(value);
    }
  }

  return {
    ...captureResult,
    properties,
  };
}

const beforeSend: BeforeSendFn = (captureResult) => sanitizeCaptureResult(captureResult);

export const posthogOptions = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST ?? DEFAULT_POSTHOG_HOST,
  defaults: "2026-01-30",
  autocapture: false,
  capture_pageview: true,
  capture_pageleave: "if_capture_pageview",
  disable_session_recording: true,
  person_profiles: "identified_only",
  before_send: beforeSend,
} satisfies Partial<PostHogConfig>;

export function captureAnalyticsEvent(
  client: PostHog,
  eventName: (typeof analyticsEvents)[keyof typeof analyticsEvents],
  properties?: AnalyticsProperties,
) {
  if (!POSTHOG_TOKEN || !client.__loaded) return;

  const filteredProperties =
    properties &&
    Object.fromEntries(Object.entries(properties).filter(([, value]) => value !== undefined));

  client.capture(eventName, filteredProperties);
}
