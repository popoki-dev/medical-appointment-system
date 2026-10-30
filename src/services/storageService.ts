import { APP_CONFIG } from '@/config/app'
import { createMockDatabase } from '@/data/mockData'
import { storage } from '@/lib/storage'
import type { CollectionName, Database, EntityOf } from '@/types'

/**
 * Bump when the shape of the stored data changes. On mismatch the stored data is
 * discarded and the mock dataset is seeded again.
 */
const DB_VERSION = 3

const COLLECTIONS: CollectionName[] = [
  'users',
  'patients',
  'departments',
  'doctors',
  'doctorSchedules',
  'appointments',
  'notifications',
]

const META_KEY = 'db:meta'
const collectionKey = (name: CollectionName) => `db:${name}`

interface DbMeta {
  version: number
  seededAt: string
}

type Listener = (changed: CollectionName[]) => void

/**
 * In-memory mirror of localStorage. Reads are served from here so they stay fast
 * and keep working even if the browser blocks storage; every write goes to both.
 */
let cache: Database | null = null
const listeners = new Set<Listener>()

function emit(changed: CollectionName[]) {
  listeners.forEach((listener) => listener(changed))
}

function persist(name: CollectionName) {
  storage.set(collectionKey(name), cache![name])
}

function seed(): Database {
  const db = createMockDatabase()
  cache = db
  COLLECTIONS.forEach(persist)
  storage.set<DbMeta>(META_KEY, { version: DB_VERSION, seededAt: new Date().toISOString() })
  return db
}

function load(): Database {
  if (cache) return cache
  const meta = storage.get<DbMeta | null>(META_KEY, null)
  if (!meta || meta.version !== DB_VERSION) {
    // First launch, or data from an older version of the app: start clean.
    storage.clearAll()
    return seed()
  }
  const loaded = {} as Record<CollectionName, unknown[]>
  for (const name of COLLECTIONS) {
    const items = storage.get<unknown[] | null>(collectionKey(name), null)
    if (!Array.isArray(items)) return seed() // a collection went missing or got corrupted
    loaded[name] = items
  }
  cache = loaded as Database
  return cache
}

// Keep other tabs in sync: another tab wrote to localStorage, so refresh our copy.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (!event.key?.startsWith(APP_CONFIG.storagePrefix) || !cache) return
    const key = event.key.slice(APP_CONFIG.storagePrefix.length)
    if (key === META_KEY) {
      cache = null
      load()
      emit(COLLECTIONS)
      return
    }
    const name = COLLECTIONS.find((c) => collectionKey(c) === key)
    if (!name) return
    cache[name] = storage.get(key, cache[name]) as never
    emit([name])
  })
}

/**
 * The single, low-level gateway to persisted data. Every service reads and writes
 * through here, so all screens share one data source and are notified of changes.
 */
export const storageService = {
  /** Loads the dataset, seeding the mock data on first launch. Safe to call repeatedly. */
  initialize() {
    load()
  },

  getAll<C extends CollectionName>(name: C): EntityOf<C>[] {
    return [...(load()[name] as EntityOf<C>[])]
  },

  getById<C extends CollectionName>(name: C, id: string): EntityOf<C> | undefined {
    return (load()[name] as EntityOf<C>[]).find((item) => item.id === id)
  },

  /** Replaces a whole collection. Prefer the CRUD helpers below. */
  setAll<C extends CollectionName>(name: C, items: EntityOf<C>[]) {
    load()[name] = items as Database[C]
    persist(name)
    emit([name])
  },

  insert<C extends CollectionName>(name: C, item: EntityOf<C>): EntityOf<C> {
    const items = load()[name] as EntityOf<C>[]
    if (items.some((existing) => existing.id === item.id)) {
      throw new Error(`Duplicate id "${item.id}" in ${name}`)
    }
    cache![name] = [...items, item] as Database[C]
    persist(name)
    emit([name])
    return item
  },

  update<C extends CollectionName>(name: C, id: string, patch: Partial<EntityOf<C>>): EntityOf<C> | undefined {
    const items = load()[name] as EntityOf<C>[]
    const index = items.findIndex((item) => item.id === id)
    if (index === -1) return undefined
    const updated = { ...items[index], ...patch, id } as EntityOf<C>
    const next = [...items]
    next[index] = updated
    cache![name] = next as Database[C]
    persist(name)
    emit([name])
    return updated
  },

  remove<C extends CollectionName>(name: C, id: string): boolean {
    const items = load()[name] as EntityOf<C>[]
    const next = items.filter((item) => item.id !== id)
    if (next.length === items.length) return false
    cache![name] = next as Database[C]
    persist(name)
    emit([name])
    return true
  },

  /** Removes every item matching `predicate`; returns how many were removed. */
  removeWhere<C extends CollectionName>(name: C, predicate: (item: EntityOf<C>) => boolean): number {
    const items = load()[name] as EntityOf<C>[]
    const next = items.filter((item) => !predicate(item))
    const removed = items.length - next.length
    if (removed) {
      cache![name] = next as Database[C]
      persist(name)
      emit([name])
    }
    return removed
  },

  /** Discards all changes and restores the original mock dataset. The session is kept. */
  reset() {
    seed()
    emit(COLLECTIONS)
  },

  getMeta(): DbMeta | null {
    return storage.get<DbMeta | null>(META_KEY, null)
  },

  /** Subscribes to data changes. Returns an unsubscribe function. */
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
