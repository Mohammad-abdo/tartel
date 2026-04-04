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

const LOCAL_HTTP = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i;

/** True if this string is non-localhost HTTP (causes mixed content on https sites). */
export function isNonLocalHttpUrl(s) {
  return Boolean(s && typeof s === 'string' && s.startsWith('http://') && !LOCAL_HTTP.test(s));
}

/**
 * Mutates axios request config so the final URL is never http:// on an https:// page.
 * Second line of defense if baseURL was baked wrong at build time.
 */
export function sanitizeAxiosRequestForHttpsPage(config) {
  if (typeof window === 'undefined' || window.location?.protocol !== 'https:') return config;
  const safeBase = DEFAULT_API_BASE_URL.replace(/\/$/, '');

  if (isNonLocalHttpUrl(config.baseURL)) {
    config.baseURL = safeBase;
  }

  const url = config.url;
  if (typeof url === 'string' && url.startsWith('http') && isNonLocalHttpUrl(url)) {
    try {
      const u = new URL(url);
      config.baseURL = safeBase;
      let path = u.pathname + (u.search || '');
      path = path.replace(/^\/api(\/|$)/, '/');
      if (!path.startsWith('/')) path = `/${path}`;
      config.url = path;
    } catch {
      config.baseURL = safeBase;
    }
  }

  return config;
}
