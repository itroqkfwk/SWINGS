const defaultApiBaseUrl = "http://localhost:8090/swings";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || defaultApiBaseUrl;

export const WS_BASE_URL =
  import.meta.env.VITE_WS_BASE_URL?.trim() || `${API_BASE_URL}/ws`;

export const UPLOADS_BASE_URL =
  import.meta.env.VITE_UPLOADS_BASE_URL?.trim() || `${API_BASE_URL}/uploads`;
