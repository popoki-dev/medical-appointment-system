import type { User } from '@/types'

/** Demo accounts. Every account uses the password `password123`. */
export const DEMO_PASSWORD = 'password123'

export const mockUsers: User[] = [
  {
    id: 'usr_patient_1',
    name: 'Emily Carter',
    email: 'patient@medibook.example',
    role: 'patient',
    phone: '+1 (555) 201-4410',
    createdAt: '2025-03-12T09:00:00.000Z',
  },
  {
    id: 'usr_doctor_1',
    name: 'Dr. James Wilson',
    email: 'doctor@medibook.example',
    role: 'doctor',
    phone: '+1 (555) 301-1120',
    createdAt: '2024-11-02T09:00:00.000Z',
  },
  {
    id: 'usr_reception_1',
    name: 'Sofia Martinez',
    email: 'reception@medibook.example',
    role: 'receptionist',
    phone: '+1 (555) 401-8890',
    createdAt: '2024-10-15T09:00:00.000Z',
  },
  {
    id: 'usr_admin_1',
    name: 'Daniel Okafor',
    email: 'admin@medibook.example',
    role: 'admin',
    phone: '+1 (555) 501-3300',
    createdAt: '2024-09-01T09:00:00.000Z',
  },
]
