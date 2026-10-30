export type Gender = 'male' | 'female' | 'other'
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

export interface Patient {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: Gender
  bloodGroup?: BloodGroup
  address?: string
  allergies?: string[]
  emergencyContact?: EmergencyContact
  createdAt: string
}
