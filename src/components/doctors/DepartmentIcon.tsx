import { Baby, Bone, Brain, HeartPulse, Stethoscope, type LucideIcon, type LucideProps } from 'lucide-react'

/** Icons a department may name in its `icon` field. Unknown names fall back to a stethoscope. */
const DEPARTMENT_ICONS: Record<string, LucideIcon> = { HeartPulse, Brain, Baby, Bone, Stethoscope }

export function DepartmentIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = DEPARTMENT_ICONS[name] ?? Stethoscope
  return <Icon {...props} />
}
