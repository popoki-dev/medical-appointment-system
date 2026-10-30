import type { Patient } from '@/types'

export const mockPatients: Patient[] = [
  { id: 'pat_1', userId: 'usr_patient_1', firstName: 'Emily', lastName: 'Carter', email: 'patient@medibook.example', phone: '+1 (555) 201-4410', dateOfBirth: '1990-06-14', gender: 'female', bloodGroup: 'O+', allergies: ['Penicillin'], createdAt: '2025-03-12T09:00:00.000Z' },
  { id: 'pat_2', userId: 'usr_patient_2', firstName: 'Marcus', lastName: 'Johnson', email: 'marcus.j@example.com', phone: '+1 (555) 201-4411', dateOfBirth: '1984-02-03', gender: 'male', bloodGroup: 'A+', createdAt: '2025-04-01T09:00:00.000Z' },
  { id: 'pat_3', userId: 'usr_patient_3', firstName: 'Hannah', lastName: 'Lee', email: 'hannah.lee@example.com', phone: '+1 (555) 201-4412', dateOfBirth: '2016-09-21', gender: 'female', bloodGroup: 'B+', createdAt: '2025-05-18T09:00:00.000Z' },
  { id: 'pat_4', userId: 'usr_patient_4', firstName: 'Omar', lastName: 'Haddad', email: 'omar.h@example.com', phone: '+1 (555) 201-4413', dateOfBirth: '1972-11-30', gender: 'male', bloodGroup: 'AB-', createdAt: '2025-06-07T09:00:00.000Z' },
  { id: 'pat_5', userId: 'usr_patient_5', firstName: 'Grace', lastName: 'Kim', email: 'grace.kim@example.com', phone: '+1 (555) 201-4414', dateOfBirth: '1995-01-09', gender: 'female', bloodGroup: 'O-', createdAt: '2025-07-22T09:00:00.000Z' },
  { id: 'pat_6', userId: 'usr_patient_6', firstName: 'Lucas', lastName: 'Silva', email: 'lucas.s@example.com', phone: '+1 (555) 201-4415', dateOfBirth: '1988-04-17', gender: 'male', bloodGroup: 'A-', createdAt: '2025-08-03T09:00:00.000Z' },
  { id: 'pat_7', userId: 'usr_patient_7', firstName: 'Zara', lastName: 'Ahmed', email: 'zara.a@example.com', phone: '+1 (555) 201-4416', dateOfBirth: '2001-12-25', gender: 'female', bloodGroup: 'B-', createdAt: '2025-09-11T09:00:00.000Z' },
  { id: 'pat_8', userId: 'usr_patient_8', firstName: 'Thomas', lastName: 'Wright', email: 'thomas.w@example.com', phone: '+1 (555) 201-4417', dateOfBirth: '1965-07-08', gender: 'male', bloodGroup: 'O+', createdAt: '2025-10-01T09:00:00.000Z' },
]
