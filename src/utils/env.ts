export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:4011").replace(/\/+$/, ""),
} as const
