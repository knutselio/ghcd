/// <reference types="vite/client" />

declare const __COMMIT_HASH__: string;

interface ImportMetaEnv {
  readonly VITE_PUBLIC_POSTHOG_HOST?: string;
  readonly VITE_PUBLIC_POSTHOG_KEY?: string;
  readonly VITE_PUBLIC_POSTHOG_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
