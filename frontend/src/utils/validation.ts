import type { StudentFormData } from '@/types/student'

export function validateStudentForm(
  data: Partial<StudentFormData> & { confirmPassword?: string }
): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!data.preferredLanguage?.trim()) errors.preferredLanguage = 'Preferred language is required'
  if (!data.adhaarNumber?.trim()) errors.adhaarNumber = 'Aadhaar number is required'
  else if (!/^[0-9]{12}$/.test(data.adhaarNumber.replace(/\s/g, ''))) {
    errors.adhaarNumber = 'Aadhaar number must be 12 digits'
  }

  if (!data.firstName?.trim()) errors.firstName = 'First name is required'
  if (!data.lastName?.trim()) errors.lastName = 'Last name is required'

  if (!data.password?.trim()) errors.password = 'Password is required'
  else if (data.password.length < 6) errors.password = 'Password must be at least 6 characters'
  if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  if (!data.dateOfBirth?.trim()) {
    errors.dateOfBirth = 'Date of birth is required'
  } else {
    const dob = new Date(data.dateOfBirth)
    const today = new Date()
    if (dob >= today) errors.dateOfBirth = 'Date of birth must be in the past'
  }

  if (!data.gender?.trim()) errors.gender = 'Please select gender'

  if (!data.schoolNameAndAddress?.trim()) errors.schoolNameAndAddress = 'School name & address is required'
  if (!data.schoolEnrollmentNumber?.trim()) errors.schoolEnrollmentNumber = 'School enrollment number is required'
  if (!data.class?.trim()) errors.class = 'Class / grade is required'
  if (!data.board?.trim()) errors.board = 'Board is required'

  if (!data.addressLine1?.trim()) errors.addressLine1 = 'Address line 1 is required'
  if (!data.city?.trim()) errors.city = 'City is required'
  if (!data.state?.trim()) errors.state = 'State is required'
  if (!data.country?.trim()) errors.country = 'Country is required'
  if (!data.pincode?.trim()) {
    errors.pincode = 'Pincode is required'
  } else if (!/^[0-9]{6}$/.test(data.pincode)) {
    errors.pincode = 'Pincode must be 6 digits'
  }

  if (!data.email?.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Enter a valid email address'
  }

  if (!data.mobile?.trim()) errors.mobile = 'Mobile number is required'
  else if (!/^[0-9]{10}$/.test(data.mobile.replace(/\s/g, ''))) {
    errors.mobile = 'Mobile number must be 10 digits'
  }

  return errors
}

export function computeAge(dateOfBirth: string): number | '' {
  if (!dateOfBirth) return ''
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age < 0 ? '' : age
}
