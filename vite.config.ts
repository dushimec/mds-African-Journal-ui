import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Extract base URL and version from VITE_API_URL or use separate vars
  const apiFullUrl = env.VITE_API_URL || env.VITE_API_BASE_URL || "http://localhost:9091";
  const apiBaseUrl = apiFullUrl.replace(/\/api\/v\d+\/?$/, '') || "http://localhost:9091";
  
  return {
    server: {
      host: "::",
      port: 3000,
      
      proxy: {
        // Proxy article PDF routes to backend: /:volume/:issue/:slug.pdf
        "/:volume/:issue/:slug.pdf": {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => `/api/v1${path}`
        },
        // Proxy article-pdf routes to backend: /article-pdf/:doiSlug/url
        "/article-pdf": {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => `/api/v1${path}`
        },
        // Proxy other API calls: /api/v1/*
        "/api": {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        }
      }
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

