import { toast as sonner } from 'sonner'

/**
 * App-wide toast API. Components import from here rather than from `sonner`
 * directly so the underlying library can be swapped in one place.
 */
export const toast = {
  success: (title: string, description?: string) => sonner.success(title, { description }),
  error: (title: string, description?: string) => sonner.error(title, { description }),
  info: (title: string, description?: string) => sonner.info(title, { description }),
  warning: (title: string, description?: string) => sonner.warning(title, { description }),
  promise: sonner.promise,
  dismiss: sonner.dismiss,
}
