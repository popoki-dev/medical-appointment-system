import type { Department } from '@/types'

export const mockDepartments: Department[] = [
  { id: 'dep_cardiology', name: 'Cardiology', description: 'Heart and cardiovascular care.', icon: 'HeartPulse' },
  { id: 'dep_neurology', name: 'Neurology', description: 'Brain, spine and nervous system.', icon: 'Brain' },
  { id: 'dep_pediatrics', name: 'Pediatrics', description: 'Care for infants, children and teens.', icon: 'Baby' },
  { id: 'dep_orthopedics', name: 'Orthopedics', description: 'Bones, joints and musculoskeletal health.', icon: 'Bone' },
  { id: 'dep_dermatology', name: 'Dermatology', description: 'Skin, hair and nail conditions.', icon: 'Sparkles' },
  { id: 'dep_general', name: 'General Medicine', description: 'Primary care and general consultations.', icon: 'Stethoscope' },
]
