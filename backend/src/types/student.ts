/**
 * Matches frontend StudentFormData. "class" is the student's class/grade.
 */
export interface StudentRegistrationBody {
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  phone: string
  adhaarNumber: string
  schoolName: string
  class: string
  course: string
  gender: string
  address: string
  city: string
  state: string
  pincode: string
  guardianName: string
  guardianPhone: string
}

export interface StudentRecord extends StudentRegistrationBody {
  id: string
  createdAt: string
}
