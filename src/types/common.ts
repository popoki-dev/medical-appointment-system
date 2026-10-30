import type { LucideIcon } from 'lucide-react'

export interface SelectOption<T extends string = string> {
  label: string
  value: T
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

export interface QueryParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
}

export interface NavSection {
  label?: string
  items: NavItem[]
}

export type StatusTone = 'default' | 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'teal'
