import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  base: mode === "development" ? "/" : "/orkhosssain.github.io/", // <-- replace with your repo name; use '/' if deploying to <username>.github.io root
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));


