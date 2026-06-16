import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// React for the pipeline's page components; Tailwind v3 with our generated config.
export default defineConfig({
  integrations: [react(), tailwind({ applyBaseStyles: true })],
});
