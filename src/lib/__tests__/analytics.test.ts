import type { CaptureResult } from "posthog-js";
import { describe, expect, it } from "vitest";
import { sanitizeAbsoluteUrl, sanitizeCaptureResult, sanitizePathname } from "../analytics";

describe("analytics sanitizers", () => {
  it("removes query params from absolute URLs", () => {
    expect(sanitizeAbsoluteUrl("https://ghcd.io/?state=abc123")).toBe("https://ghcd.io/");
  });

  it("removes query params from pathnames", () => {
    expect(sanitizePathname("/?state=abc123")).toBe("/");
  });

  it("redacts tracked URL properties but leaves unrelated properties intact", () => {
    const result = sanitizeCaptureResult({
      event: "$pageview",
      properties: {
        $current_url: "https://ghcd.io/?state=abc123",
        $pathname: "/?state=abc123",
        user_count: 3,
      },
      uuid: "test-event-id",
    } as CaptureResult);

    expect(result?.properties.$current_url).toBe("https://ghcd.io/");
    expect(result?.properties.$pathname).toBe("/");
    expect(result?.properties.user_count).toBe(3);
  });
});
