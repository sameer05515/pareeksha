/**
 * Matches frontend StudentFormData (register.html).
 */
export interface StudentRegistrationBody {
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

export interface StudentRecord extends StudentRegistrationBody {
  id: string
  createdAt: string
}
