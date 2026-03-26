import { PostHogProvider } from "@posthog/react";
import posthog from "posthog-js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { POSTHOG_TOKEN, posthogOptions } from "./lib/analytics";
import { ToastProvider } from "./lib/ToastContext";
import "./index.css";

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
