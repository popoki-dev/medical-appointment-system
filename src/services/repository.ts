import { APP_CONFIG } from '@/config/app'
import { generateId } from '@/lib/utils'
import type { CollectionName, EntityOf } from '@/types'
import { storageService } from './storageService'

/** Simulated network latency so loading states behave as they will with a real API. */
export const delay = (ms: number = APP_CONFIG.mockLatency) => new Promise((resolve) => setTimeout(resolve, ms))

export type ServiceErrorCode = 'NOT_FOUND' | 'UNAUTHORIZED' | 'VALIDATION' | 'CONFLICT'

export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: ServiceErrorCode = 'VALIDATION',
    /** The form field the error belongs to, when there is one. */
    public readonly field?: string,
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}

export interface UniqueConstraint<T> {
  /** Returns the value that must be unique across the collection, e.g. a lower-cased email. */
  key: (item: T) => string
  message: string
}

interface RepositoryOptions<T> {
  /** Prefix for generated ids, e.g. "usr" -> "usr_k3j9…". */
  idPrefix: string
  unique?: UniqueConstraint<T>[]
}

export type CreateInput<T extends { id: string }> = Omit<T, 'id'> & { id?: string }

/**
 * Generic async CRUD over one collection, with unique ids and duplicate
 * protection. Domain services build on this; replacing its internals with HTTP
 * calls is all a real backend would need.
 */
export function createRepository<C extends CollectionName>(collection: C, options: RepositoryOptions<EntityOf<C>>) {
  type T = EntityOf<C>

  function assertUnique(candidate: T, ignoreId?: string) {
    const others = storageService.getAll(collection).filter((item) => item.id !== ignoreId)
    for (const rule of options.unique ?? []) {
      const value = rule.key(candidate)
      if (others.some((item) => rule.key(item) === value)) throw new ServiceError(rule.message, 'CONFLICT')
    }
  }

  function newId() {
    let id: string
    do id = generateId(options.idPrefix)
    while (storageService.getById(collection, id))
    return id
  }

  return {
    async getAll(filter?: (item: T) => boolean): Promise<T[]> {
      await delay()
      const items = storageService.getAll(collection)
      return filter ? items.filter(filter) : items
    },

    async getById(id: string): Promise<T> {
      await delay()
      const item = storageService.getById(collection, id)
      if (!item) throw new ServiceError(`No ${collection} record with id "${id}"`, 'NOT_FOUND')
      return item
    },

    async create(input: CreateInput<T>): Promise<T> {
      await delay()
      if (input.id && storageService.getById(collection, input.id)) {
        throw new ServiceError(`A ${collection} record with id "${input.id}" already exists`, 'CONFLICT')
      }
      const item = { ...input, id: input.id ?? newId() } as T
      assertUnique(item)
      return storageService.insert(collection, item)
    },

    async update(id: string, patch: Partial<Omit<T, 'id'>>): Promise<T> {
      await delay()
      const current = storageService.getById(collection, id)
      if (!current) throw new ServiceError(`No ${collection} record with id "${id}"`, 'NOT_FOUND')
      assertUnique({ ...current, ...patch, id } as T, id)
      return storageService.update(collection, id, patch as Partial<T>)!
    },

    async delete(id: string): Promise<void> {
      await delay()
      if (!storageService.remove(collection, id)) {
        throw new ServiceError(`No ${collection} record with id "${id}"`, 'NOT_FOUND')
      }
    },
  }
}

/**
 * Next value in a human-readable sequence, e.g. ("PAT-", 5) -> "PAT-00021".
 * Scans existing values so numbers stay unique after deletes and resets.
 */
export function nextSequence(values: string[], prefix: string, width: number) {
  const max = values.reduce((highest, value) => {
    if (!value.startsWith(prefix)) return highest
    const n = Number(value.slice(prefix.length))
    return Number.isFinite(n) ? Math.max(highest, n) : highest
  }, 0)
  return `${prefix}${String(max + 1).padStart(width, '0')}`
}

export const caseInsensitive = (value: string) => value.trim().toLowerCase()
