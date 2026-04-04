/**
 * API base URL used by axios (api.js) and URL helpers (imageUtils).
 *
 * Vite inlines import.meta.env.VITE_API_URL at BUILD time.
 * Precedence: .env.[mode].local > .env.local > .env.[mode] > .env
 * So .env.local overrides .env.production — use production URL there or unset VITE_API_URL for prod builds.
 */
export const DEFAULT_API_BASE_URL = 'https://back.rattelapp.com/api';

function isUnsafeHttpOnHttpsPage(apiUrl) {
  if (typeof window === 'undefined' || window.location?.protocol !== 'https:') return false;
  if (!apiUrl || !apiUrl.startsWith('http://')) return false;
  return !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(apiUrl);
}

export function getViteApiBaseUrl() {
  let v = import.meta.env.VITE_API_URL;
  v = v && String(v).trim() ? String(v).trim().replace(/\/$/, '') : DEFAULT_API_BASE_URL;
  // Old bundles may still embed http://<IP>/api — browser blocks that on https://rattelapp.com
  if (isUnsafeHttpOnHttpsPage(v)) return DEFAULT_API_BASE_URL;
  return v;
}

/** Origin without trailing /api (for fixing media URLs). */
export function getApiOriginFromEnv() {
  let base = getViteApiBaseUrl().replace(/\/api\/?$/, '');
  if (base.startsWith('http://')) {
    base = base.replace('http://', 'https://');
  }
  return base;
}
