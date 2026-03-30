const defaultApiBaseUrl = "http://localhost:8090/swings";

const readEnv = (...keys) =>
  keys
    .map((key) => import.meta.env[key]?.trim())
    .find((value) => typeof value === "string" && value.length > 0);

export const API_BASE_URL =
  readEnv("VITE_API_BASE_URL", "VITE_API_BASE") || defaultApiBaseUrl;

export const WS_BASE_URL =
  readEnv("VITE_WS_BASE_URL", "VITE_WS_BASE") || `${API_BASE_URL}/ws`;

export const UPLOADS_BASE_URL =
  readEnv("VITE_UPLOADS_BASE_URL", "VITE_UPLOADS_BASE") ||
  `${API_BASE_URL}/uploads`;

export const API_TIMEOUT_MS = Number(
  readEnv("VITE_API_TIMEOUT_MS", "VITE_API_TIMEOUT") || "15000"
);
