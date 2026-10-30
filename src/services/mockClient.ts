import { APP_CONFIG } from '@/config/app'
import { storage } from '@/lib/storage'
import type { PaginatedResult, QueryParams } from '@/types'

export const delay = (ms: number = APP_CONFIG.mockLatency) => new Promise((resolve) => setTimeout(resolve, ms))

export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'UNAUTHORIZED' | 'VALIDATION' | 'CONFLICT' = 'VALIDATION',
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}

/**
 * A localStorage-backed collection that mimics an async REST resource.
 *
 * Every service talks to the "backend" only through this class, so swapping to
 * a real API later means re-implementing these methods with fetch calls while
 * the service signatures stay the same.
 */
export class LocalCollection<T extends { id: string }> {
  constructor(
    private readonly name: string,
    private readonly seed: () => T[],
  ) {}

  private read(): T[] {
    const existing = storage.get<T[] | null>(this.name, null)
    if (existing) return existing
    const seeded = this.seed()
    storage.set(this.name, seeded)
    return seeded
  }

  private write(items: T[]) {
    storage.set(this.name, items)
  }

  async list(filter?: (item: T) => boolean): Promise<T[]> {
    await delay()
    const items = this.read()
    return filter ? items.filter(filter) : items
  }

  async get(id: string): Promise<T> {
    await delay()
    const item = this.read().find((i) => i.id === id)
    if (!item) throw new ServiceError(`${this.name} ${id} not found`, 'NOT_FOUND')
    return item
  }

  async create(item: T): Promise<T> {
    await delay()
    this.write([...this.read(), item])
    return item
  }

  async update(id: string, patch: Partial<T>): Promise<T> {
    await delay()
    const items = this.read()
    const index = items.findIndex((i) => i.id === id)
    if (index === -1) throw new ServiceError(`${this.name} ${id} not found`, 'NOT_FOUND')
    const updated = { ...items[index], ...patch, id }
    items[index] = updated
    this.write(items)
    return updated
  }

  async remove(id: string): Promise<void> {
    await delay()
    this.write(this.read().filter((i) => i.id !== id))
  }

  reset() {
    storage.remove(this.name)
  }
}

export function paginate<T>(items: T[], { page = 1, pageSize = APP_CONFIG.defaultPageSize }: QueryParams = {}): PaginatedResult<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(Math.max(1, page), pageCount)
  const start = (safePage - 1) * pageSize
  return { items: items.slice(start, start + pageSize), total: items.length, page: safePage, pageSize, pageCount }
}
