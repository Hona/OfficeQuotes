import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";

export default defineConfig({
  site: "https://officequotes.xyz",
  integrations: [preact()],
  output: "static",
  trailingSlash: "never"
});
