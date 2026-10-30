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
  /** Null until the patient completes their profile after self-registration. */
  bloodGroup: BloodGroup | null
  address: string
  emergencyContact: EmergencyContact | null
  /** Mock only — not real clinical data. */
  medicalNotes?: string
}
