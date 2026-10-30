import { toast as sonner } from 'sonner'

/**
 * App-wide toast API. Components import from here rather than from `sonner`
 * directly so the underlying library can be swapped in one place.
 */
export const toast = {
  success: (title: string, description?: string) => sonner.success(title, { description }),
  error: (title: string, description?: string) => sonner.error(title, { description }),
  info: (title: string, description?: string) => sonner.info(title, { description }),
  /** Pass an `id` to replace rather than stack a toast that may fire twice. */
  warning: (title: string, description?: string, id?: string) => sonner.warning(title, { description, id }),
  promise: sonner.promise,
  dismiss: sonner.dismiss,
}
