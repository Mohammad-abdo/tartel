/**
 * API base URL used by axios (api.js) and URL helpers (imageUtils).
 *
 * Vite inlines import.meta.env.VITE_API_URL at BUILD time.
 * Precedence: .env.[mode].local > .env.local > .env.[mode] > .env
 * So .env.local overrides .env.production — use production URL there or unset VITE_API_URL for prod builds.
 */
export const DEFAULT_API_BASE_URL = 'https://back.rattelapp.com/api';

export function getViteApiBaseUrl() {
  const v = import.meta.env.VITE_API_URL;
  if (v && String(v).trim()) return String(v).trim().replace(/\/$/, '');
  return DEFAULT_API_BASE_URL;
}

/** Origin without trailing /api (for fixing media URLs). */
export function getApiOriginFromEnv() {
  let base = getViteApiBaseUrl().replace(/\/api\/?$/, '');
  if (base.startsWith('http://')) {
    base = base.replace('http://', 'https://');
  }
  return base;
}
