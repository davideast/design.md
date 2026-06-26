import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { serveRuns } from "./plugins/serve-runs";

// React for the pipeline's page components; Tailwind v3 with our generated config.
// The serveRuns plugin maps /renders/ to ../runs/ so iframe thumbnails load
// directly from their canonical location — no copy step needed.
export default defineConfig({
  integrations: [react(), tailwind({ applyBaseStyles: true })],
  vite: {
    plugins: [serveRuns()],
    server: {
      fs: { allow: [".."] },
    },
  },
});
