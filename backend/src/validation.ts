import type { StudentRegistrationBody } from './types/student.js'

export interface ValidationError {
  field: string
  message: string
}

export function validateRegistration(
  body: unknown
): { success: true; data: StudentRegistrationBody } | { success: false; errors: ValidationError[] } {
  const errors: ValidationError[] = []

  if (!body || typeof body !== 'object') {
    return { success: false, errors: [{ field: '_', message: 'Request body must be a JSON object' }] }
  }

  const b = body as Record<string, unknown>

  const required = [
    'preferredLanguage',
    'adhaarNumber',
    'firstName',
    'lastName',
    'password',
    'dateOfBirth',
    'gender',
    'schoolNameAndAddress',
    'schoolEnrollmentNumber',
    'class',
    'board',
    'addressLine1',
    'city',
    'state',
    'country',
    'pincode',
    'email',
    'mobile',
  ] as const

  for (const key of required) {
    const val = b[key]
    if (val === undefined || val === null || String(val).trim() === '') {
      const label = key === 'class' ? 'class' : key
      errors.push({ field: label, message: `${label} is required` })
    }
  }

  const email = b.email
  if (email !== undefined && email !== null && String(email).trim() !== '') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      errors.push({ field: 'email', message: 'Enter a valid email address' })
    }
  }

  const pincode = b.pincode
  if (pincode !== undefined && pincode !== null && String(pincode).trim() !== '') {
    if (!/^[0-9]{6}$/.test(String(pincode).trim())) {
      errors.push({ field: 'pincode', message: 'Pincode must be 6 digits' })
    }
  }

  const adhaarNumber = b.adhaarNumber
  if (adhaarNumber !== undefined && adhaarNumber !== null && String(adhaarNumber).trim() !== '') {
    const digits = String(adhaarNumber).replace(/\s/g, '')
    if (!/^[0-9]{12}$/.test(digits)) {
      errors.push({ field: 'adhaarNumber', message: 'Aadhaar number must be 12 digits' })
    }
  }

  const mobile = b.mobile
  if (mobile !== undefined && mobile !== null && String(mobile).trim() !== '') {
    if (!/^[0-9]{10}$/.test(String(mobile).replace(/\s/g, ''))) {
      errors.push({ field: 'mobile', message: 'Mobile number must be 10 digits' })
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  const data: StudentRegistrationBody = {
    preferredLanguage: String(b.preferredLanguage).trim(),
    adhaarNumber: String(b.adhaarNumber).trim(),
    firstName: String(b.firstName).trim(),
    middleName: String(b.middleName ?? '').trim(),
    lastName: String(b.lastName).trim(),
    password: String(b.password).trim(),
    dateOfBirth: String(b.dateOfBirth).trim(),
    gender: String(b.gender).trim(),
    schoolNameAndAddress: String(b.schoolNameAndAddress).trim(),
    schoolEnrollmentNumber: String(b.schoolEnrollmentNumber).trim(),
    class: String(b.class).trim(),
    board: String(b.board).trim(),
    addressLine1: String(b.addressLine1).trim(),
    addressLine2: String(b.addressLine2 ?? '').trim(),
    city: String(b.city).trim(),
    state: String(b.state).trim(),
    country: String(b.country).trim(),
    pincode: String(b.pincode).trim(),
    email: String(b.email).trim(),
    mobile: String(b.mobile).trim(),
  }

  return { success: true, data }
}
