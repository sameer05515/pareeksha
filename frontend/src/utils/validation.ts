import type { StudentFormData } from '@/types/student'

export function validateStudentForm(data: Partial<StudentFormData>): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!data.firstName?.trim()) errors.firstName = 'First name is required'
  if (!data.lastName?.trim()) errors.lastName = 'Last name is required'

  if (!data.email?.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Enter a valid email address'
  }

  if (!data.dateOfBirth?.trim()) {
    errors.dateOfBirth = 'Date of birth is required'
  } else {
    const dob = new Date(data.dateOfBirth)
    const today = new Date()
    if (dob >= today) errors.dateOfBirth = 'Date of birth must be in the past'
  }

  if (data.phone?.trim() && !/^[0-9+\-\s]{10,15}$/.test(data.phone)) {
    errors.phone = 'Enter a valid phone number'
  }

  if (data.adhaarNumber?.trim()) {
    const digits = data.adhaarNumber.replace(/\s/g, '')
    if (!/^[0-9]{12}$/.test(digits)) {
      errors.adhaarNumber = 'Aadhaar number must be 12 digits'
    }
  }

  if (!data.schoolName?.trim()) errors.schoolName = 'School name is required'
  if (!data.class?.trim()) errors.class = 'Class is required'

  if (!data.gender?.trim()) errors.gender = 'Please select gender'

  if (!data.address?.trim()) errors.address = 'Address is required'
  if (!data.city?.trim()) errors.city = 'City is required'
  if (!data.state?.trim()) errors.state = 'State is required'
  if (!data.pincode?.trim()) {
    errors.pincode = 'Pincode is required'
  } else if (!/^[0-9]{6}$/.test(data.pincode)) {
    errors.pincode = 'Pincode must be 6 digits'
  }

  if (!data.guardianName?.trim()) errors.guardianName = 'Guardian name is required'
  if (data.guardianPhone?.trim() && !/^[0-9+\-\s]{10,15}$/.test(data.guardianPhone)) {
    errors.guardianPhone = 'Enter a valid phone number'
  }

  return errors
}
