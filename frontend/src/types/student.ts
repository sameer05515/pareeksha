export interface StudentFormData {
  preferredLanguage: string
  adhaarNumber: string
  firstName: string
  middleName: string
  lastName: string
  password: string
  dateOfBirth: string
  gender: string
  schoolNameAndAddress: string
  schoolEnrollmentNumber: string
  class: string
  board: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  country: string
  pincode: string
  email: string
  mobile: string
}

export const initialFormData: StudentFormData = {
  preferredLanguage: '',
  adhaarNumber: '',
  firstName: '',
  middleName: '',
  lastName: '',
  password: '',
  dateOfBirth: '',
  gender: '',
  schoolNameAndAddress: '',
  schoolEnrollmentNumber: '',
  class: '',
  board: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  email: '',
  mobile: '',
}

export const LANGUAGES = ['English', 'Hindi', 'Marathi'] as const
export const GENDERS = ['Male', 'Female', 'Other'] as const
export const CLASS_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const
export const BOARDS = ['CBSE', 'ICSE', 'State Board'] as const
export const CITIES = ['Mumbai', 'Delhi', 'Pune'] as const
export const STATES = ['Maharashtra', 'Delhi', 'Karnataka'] as const
export const COUNTRIES = ['India'] as const

export interface StudentRecord extends StudentFormData {
  id: string
  createdAt: string
}
