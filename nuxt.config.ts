import { fileURLToPath } from "node:url";

// https://nuxt.com/docs/api/configuration/nuxt-config
const projectRoot = fileURLToPath(new URL("./", import.meta.url));
const serverRoot = fileURLToPath(new URL("./server", import.meta.url));
const publicRoot = fileURLToPath(new URL("./public", import.meta.url));

export default defineNuxtConfig({
  srcDir: "app",
  alias: {
    "~": projectRoot,
    "@": projectRoot,
  },
  serverDir: serverRoot,
  dir: {
    public: publicRoot,
  },
  compatibilityDate: "2024-04-03",
  devtools: { enabled: process.env.NUXT_DEVTOOLS === "true" },
  modules: ["@nuxt/ui", "@nuxt/eslint"],
  css: ["~/app/assets/css/main.css"],
  app: {
    head: {
      titleTemplate: (titleChunk?: string) =>
        titleChunk ? `${titleChunk} · X-SUB-Store` : "X-SUB-Store",
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon-terminal.svg" },
        { rel: "alternate icon", type: "image/x-icon", href: "/favicon.ico" },
      ],
    },
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ["node", "bun"],
      },
    },
  },
  runtimeConfig: {
    // Support both APP_SECRET and Nuxt-style NUXT_APP_SECRET in all runtimes.
    appSecret: process.env.APP_SECRET || process.env.NUXT_APP_SECRET || "",
    // Support both classic and Nuxt-style env names.
    mongoUri:
      process.env.MONGO_URI ||
      process.env.MONGO_URL ||
      process.env.NUXT_MONGO_URI ||
      process.env.NUXT_MONGO_URL ||
      "",
    adminSessionSecret:
      process.env.ADMIN_SESSION_SECRET ||
      process.env.NUXT_ADMIN_SESSION_SECRET ||
      "",
    adminAuthTokenExpiresSeconds: Number(
      process.env.ADMIN_AUTH_TOKEN_EXPIRES_SECONDS ||
        process.env.NUXT_ADMIN_AUTH_TOKEN_EXPIRES_SECONDS ||
        86400,
    ),
    adminRefreshTokenExpiresSeconds: Number(
      process.env.ADMIN_REFRESH_TOKEN_EXPIRES_SECONDS ||
        process.env.NUXT_ADMIN_REFRESH_TOKEN_EXPIRES_SECONDS ||
        604800,
    ),
    adminAuthPrivateKey:
      process.env.ADMIN_AUTH_PRIVATE_KEY ||
      process.env.NUXT_ADMIN_AUTH_PRIVATE_KEY ||
      "",
    adminAuthPublicKey:
      process.env.ADMIN_AUTH_PUBLIC_KEY ||
      process.env.NUXT_ADMIN_AUTH_PUBLIC_KEY ||
      "",
    adminRefreshPrivateKey:
      process.env.ADMIN_REFRESH_PRIVATE_KEY ||
      process.env.NUXT_ADMIN_REFRESH_PRIVATE_KEY ||
      "",
    adminRefreshPublicKey:
      process.env.ADMIN_REFRESH_PUBLIC_KEY ||
      process.env.NUXT_ADMIN_REFRESH_PUBLIC_KEY ||
      "",
    fetchTimeoutMs: 10000,
    fetchMaxBytes: 5 * 1024 * 1024, // 5MB
    cacheTtlSeconds: 300, // 5 minutes
    public: {
      subscriptionBaseUrl:
        process.env.NUXT_PUBLIC_SUBSCRIPTION_BASE_URL ||
        process.env.SUBSCRIPTION_BASE_URL ||
        "",
    },
  },
  nitro: {
    // Ensuring we can use node/bun runtime features
    experimental: {
      tasks: true,
    },
  },
});
