import { useState, FormEvent } from 'react'
import { FormField } from '@/components/FormField'
import { FormSelect } from '@/components/FormSelect'
import type { StudentFormData } from '@/types/student'
import {
  initialFormData,
  LANGUAGES,
  GENDERS,
  CLASS_OPTIONS,
  BOARDS,
  CITIES,
  STATES,
  COUNTRIES,
} from '@/types/student'
import { validateStudentForm, computeAge } from '@/utils/validation'
import { registerStudent } from '@/api/students'

const STEPS = 3

export function StudentRegistrationForm() {
  const [formData, setFormData] = useState<StudentFormData>(initialFormData)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const update = (name: keyof StudentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    setSubmitError(null)
  }

  const age = computeAge(formData.dateOfBirth)

  const showStep = (n: number) => {
    setStep(n)
  }

  const handleNext = () => {
    if (step < STEPS - 1) showStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 0) showStep(step - 1)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    const nextErrors = validateStudentForm({ ...formData, confirmPassword })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    try {
      const result = await registerStudent(formData)
      if (result.success) {
        setSubmitted(true)
        return
      }
      const fieldErrors: Record<string, string> = {}
      for (const { field, message } of result.errors) {
        fieldErrors[field] = message
      }
      setErrors(fieldErrors)
      setSubmitError(result.message)
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const digitsOnly = (name: keyof StudentFormData, value: string) => {
    update(name, value.replace(/\D/g, ''))
  }

  if (submitted) {
    return (
      <div className="text-center py-10 px-10 bg-card border border-border rounded">
        <div className="w-16 h-16 mx-auto mb-4 bg-success/15 text-success text-2xl font-bold leading-[4rem] rounded-full">
          ✓
        </div>
        <h2 className="text-2xl font-semibold m-0 mb-2">Registration successful</h2>
        <p className="text-muted m-0 mb-6 max-w-[400px] mx-auto">
          Thank you, {formData.firstName}. Your student registration has been submitted. We will
          contact you at {formData.email} with further steps.
        </p>
        <button
          type="button"
          className="py-2.5 px-5 bg-transparent text-accent border border-accent rounded font-medium hover:bg-accent hover:text-white"
          onClick={() => {
            setFormData(initialFormData)
            setConfirmPassword('')
            setErrors({})
            setStep(0)
            setSubmitted(false)
          }}
        >
          Register another student
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>
      {submitError && (
        <div className="py-3 px-4 bg-red-500/10 border border-error rounded text-error text-sm" role="alert">
          {submitError}
        </div>
      )}

      <p className="font-semibold m-0 mb-2">
        Step <span className="text-accent">{step + 1}</span> of {STEPS}
      </p>

      {/* Step 1: Basic Details */}
      <div className={step === 0 ? 'flex flex-col gap-4' : 'hidden'}>
        <h3 className=" font-semibold text-accent m-0 mb-1 tracking-wide uppercase">Basic Details</h3>
        <FormSelect
          label="Preferred Language"
          name="preferredLanguage"
          value={formData.preferredLanguage}
          onChange={(e) => update('preferredLanguage', e.target.value)}
          error={errors.preferredLanguage}
          options={LANGUAGES}
          placeholder="Select"
          required
        />
        <FormField
          label="Aadhaar Number"
          name="adhaarNumber"
          type="text"
          inputMode="numeric"
          value={formData.adhaarNumber}
          onChange={(e) => digitsOnly('adhaarNumber', e.target.value)}
          error={errors.adhaarNumber}
          maxLength={12}
          required
        />
        <FormField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={(e) => update('firstName', e.target.value)}
          error={errors.firstName}
          required
        />
        <FormField
          label="Middle Name"
          name="middleName"
          value={formData.middleName}
          onChange={(e) => update('middleName', e.target.value)}
        />
        <FormField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={(e) => update('lastName', e.target.value)}
          error={errors.lastName}
          required
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={(e) => update('password', e.target.value)}
          error={errors.password}
          required
        />
        <FormField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }))
          }}
          error={errors.confirmPassword}
          required
        />
        <FormField
          label="Date Of Birth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => update('dateOfBirth', e.target.value)}
          error={errors.dateOfBirth}
          required
        />
        <FormField
          label="Age"
          name="age"
          type="text"
          value={age === '' ? '' : String(age)}
          readOnly
        />
        <FormSelect
          label="Gender"
          name="gender"
          value={formData.gender}
          onChange={(e) => update('gender', e.target.value)}
          error={errors.gender}
          options={GENDERS}
          placeholder="Select"
          required
        />
      </div>

      {/* Step 2: School Details */}
      <div className={step === 1 ? 'flex flex-col gap-4' : 'hidden'}>
        <h3 className=" font-semibold text-accent m-0 mb-1 tracking-wide uppercase">School Details</h3>
        <FormField
          label="School Name & Address"
          name="schoolNameAndAddress"
          value={formData.schoolNameAndAddress}
          onChange={(e) => update('schoolNameAndAddress', e.target.value)}
          error={errors.schoolNameAndAddress}
          required
        />
        <FormField
          label="School Enrollment Number"
          name="schoolEnrollmentNumber"
          value={formData.schoolEnrollmentNumber}
          onChange={(e) => update('schoolEnrollmentNumber', e.target.value)}
          error={errors.schoolEnrollmentNumber}
          required
        />
        <FormSelect
          label="Class / Grade"
          name="class"
          value={formData.class}
          onChange={(e) => update('class', e.target.value)}
          error={errors.class}
          options={CLASS_OPTIONS}
          placeholder="Select"
          required
        />
        <FormSelect
          label="Board"
          name="board"
          value={formData.board}
          onChange={(e) => update('board', e.target.value)}
          error={errors.board}
          options={BOARDS}
          placeholder="Select"
          required
        />
      </div>

      {/* Step 3: Address & Contact */}
      <div className={step === 2 ? 'flex flex-col gap-4' : 'hidden'}>
        <h3 className=" font-semibold text-accent m-0 mb-1 tracking-wide uppercase">Address & Contact</h3>
        <FormField
          label="Address Line 1"
          name="addressLine1"
          value={formData.addressLine1}
          onChange={(e) => update('addressLine1', e.target.value)}
          error={errors.addressLine1}
          required
        />
        <FormField
          label="Address Line 2"
          name="addressLine2"
          value={formData.addressLine2}
          onChange={(e) => update('addressLine2', e.target.value)}
        />
        <FormSelect
          label="City"
          name="city"
          value={formData.city}
          onChange={(e) => update('city', e.target.value)}
          error={errors.city}
          options={CITIES}
          placeholder="Select"
          required
        />
        <FormSelect
          label="State"
          name="state"
          value={formData.state}
          onChange={(e) => update('state', e.target.value)}
          error={errors.state}
          options={STATES}
          placeholder="Select"
          required
        />
        <FormSelect
          label="Country"
          name="country"
          value={formData.country}
          onChange={(e) => update('country', e.target.value)}
          error={errors.country}
          options={COUNTRIES}
          placeholder="Select"
          required
        />
        <FormField
          label="Pincode"
          name="pincode"
          type="text"
          inputMode="numeric"
          value={formData.pincode}
          onChange={(e) => digitsOnly('pincode', e.target.value)}
          error={errors.pincode}
          maxLength={6}
          required
        />
        <FormField
          label="Email ID"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => update('email', e.target.value)}
          error={errors.email}
          required
        />
        <FormField
          label="Mobile Number"
          name="mobile"
          type="text"
          inputMode="numeric"
          value={formData.mobile}
          onChange={(e) => digitsOnly('mobile', e.target.value)}
          error={errors.mobile}
          maxLength={10}
          required
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-2 justify-between">
        <button
          type="button"
          className="py-3 px-6 bg-transparent text-muted border border-border rounded font-medium hover:border-muted hover:text-text disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handlePrev}
          disabled={step === 0 || loading}
        >
          Back
        </button>
        {step < STEPS - 1 ? (
          <button type="button" className="py-3 px-6 bg-accent text-white border-0 rounded font-semibold hover:bg-accent-hover" onClick={handleNext}>
            Next
          </button>
        ) : (
          <button
            type="submit"
            className="py-3 px-6 bg-accent text-white border-0 rounded font-semibold hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Submitting…' : 'Submit'}
          </button>
        )}
      </div>
    </form>
  )
}
