import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { execSync } from "node:child_process";
import { defineConfig, type Plugin } from "vite";

const versionStamp = (): Plugin => ({
  name: "affiliate-promo-version-stamp",
  generateBundle() {
    let commit = process.env.CF_PAGES_COMMIT_SHA || process.env.CF_WORKERS_COMMIT_SHA || "";
    if (!commit) {
      try { commit = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim(); } catch { commit = "unknown"; }
    }
    this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify({ commit, builtAt: new Date().toISOString() }, null, 2) });
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), versionStamp()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "client", "src"), "@shared": path.resolve(import.meta.dirname, "shared"), "@assets": path.resolve(import.meta.dirname, "attached_assets") } },
  root: path.resolve(import.meta.dirname, "client"),
  build: { outDir: path.resolve(import.meta.dirname, "dist/public"), emptyOutDir: true },
});
