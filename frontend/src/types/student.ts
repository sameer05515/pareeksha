export interface StudentFormData {
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  phone: string
  adhaarNumber: string
  schoolName: string
  class: string
  gender: string
  address: string
  city: string
  state: string
  pincode: string
  guardianName: string
  guardianPhone: string
}

export const initialFormData: StudentFormData = {
  firstName: '',
  lastName: '',
  email: '',
  dateOfBirth: '',
  phone: '',
  adhaarNumber: '',
  schoolName: '',
  class: '',
  gender: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  guardianName: '',
  guardianPhone: '',
}

export const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'] as const
