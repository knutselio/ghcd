const GITHUB_CLIENT_ID = import.meta.env.VITE_PUBLIC_GITHUB_CLIENT_ID ?? "";
const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
const OAUTH_PROXY_URL = import.meta.env.VITE_PUBLIC_OAUTH_PROXY_URL ?? "";
const OAUTH_REDIRECT_URI = import.meta.env.VITE_PUBLIC_OAUTH_REDIRECT_URI ?? "";
const OAUTH_SCOPES = "read:user,read:org";

const STORAGE_KEY = "ghcd-oauth";
const SESSION_STATE = "ghcd-oauth-state";
const SESSION_APP_STATE = "ghcd-app-state";

export const SESSION_CALLBACK_CODE = "ghcd-oauth-code";
export const SESSION_CALLBACK_STATE = "ghcd-oauth-callback-state";

// --- Types ---

export interface OAuthTokens {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface StoredAuth {
  accessToken: string;
}

// --- Random string for CSRF state ---

function generateRandomString(length: number): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (v) => charset[v % charset.length]).join("");
}

// --- Token Storage ---

export function saveOAuthTokens(tokens: OAuthTokens): StoredAuth {
  const stored: StoredAuth = {
    accessToken: tokens.access_token,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  return stored;
}

export function loadOAuthTokens(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.accessToken === "string") {
      return parsed as StoredAuth;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearOAuthTokens(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// --- OAuth Flow ---

export function isOAuthConfigured(): boolean {
  return Boolean(GITHUB_CLIENT_ID && OAUTH_PROXY_URL);
}

export function startOAuthFlow(): void {
  const state = generateRandomString(32);
  sessionStorage.setItem(SESSION_STATE, state);

  const appState = new URLSearchParams(window.location.search).get("state");
  if (appState) {
    sessionStorage.setItem(SESSION_APP_STATE, appState);
  }

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    scope: OAUTH_SCOPES,
    state,
  });

  if (OAUTH_REDIRECT_URI) {
    params.set("redirect_uri", OAUTH_REDIRECT_URI);
  }

  window.location.href = `${GITHUB_AUTH_URL}?${params}`;
}

export async function exchangeCodeForToken(code: string, state: string): Promise<OAuthTokens> {
  const expectedState = sessionStorage.getItem(SESSION_STATE);
  if (state !== expectedState) {
    throw new Error("OAuth state mismatch — possible CSRF attack.");
  }

  const body: Record<string, string> = { code };

  if (OAUTH_REDIRECT_URI) {
    body.redirect_uri = OAUTH_REDIRECT_URI;
  }

  const res = await fetch(OAUTH_PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Token exchange failed: HTTP ${res.status}`);
  }

  const json = await res.json();
  if (json.error) {
    throw new Error(`Token exchange failed: ${json.error_description || json.error}`);
  }

  // Clean up ephemeral session keys
  sessionStorage.removeItem(SESSION_STATE);
  sessionStorage.removeItem(SESSION_APP_STATE);

  return json as OAuthTokens;
}
