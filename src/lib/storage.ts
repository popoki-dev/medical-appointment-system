import { APP_CONFIG } from '@/config/app'

/** The full localStorage key for an app-owned entry, e.g. to match `storage` events. */
export const storageKey = (name: string) => `${APP_CONFIG.storagePrefix}${name}`
const key = storageKey

/** Thin, exception-safe wrapper around localStorage with JSON (de)serialisation. */
export const storage = {
  get<T>(name: string, fallback: T): T {
    try {
      const raw = window.localStorage.getItem(key(name))
      return raw === null ? fallback : (JSON.parse(raw) as T)
    } catch {
      return fallback
    }
  },
  set<T>(name: string, value: T) {
    try {
      window.localStorage.setItem(key(name), JSON.stringify(value))
    } catch {
      // Quota exceeded or storage unavailable — persistence is best-effort.
    }
  },
  remove(name: string) {
    try {
      window.localStorage.removeItem(key(name))
    } catch {
      // ignore
    }
  },
  clearAll() {
    try {
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith(APP_CONFIG.storagePrefix))
        .forEach((k) => window.localStorage.removeItem(k))
    } catch {
      // ignore
    }
  },
}
