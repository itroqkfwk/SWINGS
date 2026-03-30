import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import rollupNodePolyFill from "rollup-plugin-node-polyfills";

const manualChunks = (id) => {
  if (!id.includes("node_modules")) {
    return;
  }

  if (id.includes("react-router") || id.includes("@remix-run")) {
    return "router";
  }

  if (id.includes("framer-motion")) {
    return "motion";
  }

  if (id.includes("/react/") || id.includes("/react-dom/")) {
    return "react-core";
  }

  if (
    id.includes("date-fns") ||
    id.includes("dayjs") ||
    id.includes("react-datepicker") ||
    id.includes("react-day-picker")
  ) {
    return "date-ui";
  }

  if (id.includes("firebase")) {
    return "firebase";
  }

  if (id.includes("react-select") || id.includes("@radix-ui")) {
    return "form-ui";
  }

  if (
    id.includes("react-toastify") ||
    id.includes("react-hot-toast") ||
    id.includes("sweetalert2")
  ) {
    return "feedback";
  }

  if (id.includes("react-icons") || id.includes("lucide-react")) {
    return "icons";
  }

  if (id.includes("workbox") || id.includes("vite-plugin-pwa")) {
    return "pwa";
  }

  if (
    id.includes("axios") ||
    id.includes("sockjs-client") ||
    id.includes("stompjs")
  ) {
    return "network";
  }

  return "vendor";
};

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      includeAssets: ["pwa3-192x192.png", "pwa3-512x512.png"],
      injectRegister: "auto",
      manifest: {
        name: "SWINGS",
        short_name: "SWINGS",
        description: "Golf group matching service",
        theme_color: "#ffffff",
        start_url: "/swings",
        display: "standalone",
        background_color: "#ffffff",
        icons: [
          {
            src: "/pwa3-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa3-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
        suppressWarnings: true,
      },
    }),
  ],
  define: { global: "globalThis" },
  css: { postcss: "./postcss.config.js" },
  optimizeDeps: {
    esbuildOptions: {
      define: { global: "globalThis" },
      plugins: [NodeGlobalsPolyfillPlugin({ process: true, buffer: true })],
    },
  },
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()],
      output: {
        manualChunks,
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
});
