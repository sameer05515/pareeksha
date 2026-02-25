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
    'firstName',
    'lastName',
    'email',
    'dateOfBirth',
    'gender',
    'address',
    'city',
    'state',
    'pincode',
    'guardianName',
    'schoolName',
    'class',
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

  if (errors.length > 0) {
    return { success: false, errors }
  }

  const data: StudentRegistrationBody = {
    firstName: String(b.firstName).trim(),
    lastName: String(b.lastName).trim(),
    email: String(b.email).trim(),
    dateOfBirth: String(b.dateOfBirth).trim(),
    phone: String(b.phone ?? '').trim(),
    adhaarNumber: String(b.adhaarNumber ?? '').trim(),
    schoolName: String(b.schoolName).trim(),
    class: String(b.class).trim(),
    gender: String(b.gender).trim(),
    address: String(b.address).trim(),
    city: String(b.city).trim(),
    state: String(b.state).trim(),
    pincode: String(b.pincode).trim(),
    guardianName: String(b.guardianName).trim(),
    guardianPhone: String(b.guardianPhone ?? '').trim(),
  }

  return { success: true, data }
}
