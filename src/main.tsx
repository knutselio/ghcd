import { PostHogProvider } from "@posthog/react";
import posthog from "posthog-js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { POSTHOG_TOKEN, posthogOptions } from "./lib/analytics";
import { SESSION_CALLBACK_CODE, SESSION_CALLBACK_STATE } from "./lib/oauth";
import { ToastProvider } from "./lib/ToastContext";
import "./index.css";

// Handle OAuth callback synchronously before React mounts so useSettings
// doesn't see ?code=&state= params meant for the OAuth flow.
const searchParams = new URLSearchParams(window.location.search);
if (searchParams.has("code")) {
  sessionStorage.setItem(SESSION_CALLBACK_CODE, searchParams.get("code") ?? "");
  sessionStorage.setItem(SESSION_CALLBACK_STATE, searchParams.get("state") ?? "");

  const savedAppState = sessionStorage.getItem("ghcd-app-state");
  const cleanUrl = new URL(window.location.href);
  cleanUrl.searchParams.delete("code");
  cleanUrl.searchParams.delete("state");
  if (savedAppState) {
    cleanUrl.searchParams.set("state", savedAppState);
    sessionStorage.removeItem("ghcd-app-state");
  }
  window.history.replaceState(null, "", cleanUrl.toString());
}

if (POSTHOG_TOKEN && !posthog.__loaded) {
  posthog.init(POSTHOG_TOKEN, posthogOptions);
}

// biome-ignore lint/style/noNonNullAssertion: root element always exists in index.html
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </PostHogProvider>
  </StrictMode>,
);
