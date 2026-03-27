import { execSync } from "node:child_process";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const commitHash = execSync("git rev-parse --short HEAD").toString().trim();

export default defineConfig({
  base: "/",
  plugins: [react()],
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  test: {
    globals: true,
  },
});
