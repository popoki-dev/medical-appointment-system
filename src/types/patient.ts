export type Gender = 'male' | 'female' | 'other'
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

/** Patient profile. Name, email and phone live on the linked `User`. */
export interface Patient {
  id: string
  userId: string
  patientNumber: string
  dateOfBirth: string // "yyyy-MM-dd"
  gender: Gender
  bloodGroup: BloodGroup
  address: string
  emergencyContact: EmergencyContact
  /** Mock only — not real clinical data. */
  medicalNotes?: string
}
