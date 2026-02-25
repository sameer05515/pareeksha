import { useState, FormEvent } from 'react'
import { FormField } from '@/components/FormField'
import { FormSelect } from '@/components/FormSelect'
import { FormTextarea } from '@/components/FormTextarea'
import type { StudentFormData } from '@/types/student'
import { initialFormData, COURSES, GENDERS } from '@/types/student'
import { validateStudentForm } from '@/utils/validation'
import { registerStudent } from '@/api/students'
import styles from './StudentRegistrationForm.module.css'

export function StudentRegistrationForm() {
  const [formData, setFormData] = useState<StudentFormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const update = (name: keyof StudentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    setSubmitError(null)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    const nextErrors = validateStudentForm(formData)
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
      setSubmitError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className={styles.successCard}>
        <div className={styles.successIcon}>✓</div>
        <h2 className={styles.successTitle}>Registration successful</h2>
        <p className={styles.successText}>
          Thank you, {formData.firstName}. Your student registration has been submitted. We will
          contact you at {formData.email} with further steps.
        </p>
        <button
          type="button"
          className={styles.successButton}
          onClick={() => {
            setFormData(initialFormData)
            setErrors({})
            setSubmitted(false)
          }}
        >
          Register another student
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      {submitError && (
        <div className={styles.submitError} role="alert">
          {submitError}
        </div>
      )}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Personal details</h3>
        <div className={styles.row}>
          <FormField
            label="First name"
            name="firstName"
            value={formData.firstName}
            onChange={(e) => update('firstName', e.target.value)}
            error={errors.firstName}
            placeholder="e.g. Ramesh"
            autoComplete="given-name"
            required
          />
          <FormField
            label="Last name"
            name="lastName"
            value={formData.lastName}
            onChange={(e) => update('lastName', e.target.value)}
            error={errors.lastName}
            placeholder="e.g. Kumar"
            autoComplete="family-name"
            required
          />
        </div>
        <div className={styles.row}>
          <FormField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => update('email', e.target.value)}
            error={errors.email}
            placeholder="student@example.com"
            autoComplete="email"
            required
          />
          <FormField
            label="Date of birth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => update('dateOfBirth', e.target.value)}
            error={errors.dateOfBirth}
            required
          />
        </div>
        <div className={styles.row}>
          <FormField
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => update('phone', e.target.value)}
            error={errors.phone}
            placeholder="10-digit mobile number"
            autoComplete="tel"
          />
          <FormSelect
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={(e) => update('gender', e.target.value)}
            error={errors.gender}
            options={GENDERS}
            required
          />
        </div>
        <div className={styles.row}>
          <FormField
            label="Aadhaar number"
            name="adhaarNumber"
            type="text"
            inputMode="numeric"
            value={formData.adhaarNumber}
            onChange={(e) => update('adhaarNumber', e.target.value)}
            error={errors.adhaarNumber}
            placeholder="12-digit Aadhaar number"
            maxLength={14}
          />
          <FormField
            label="School name"
            name="schoolName"
            value={formData.schoolName}
            onChange={(e) => update('schoolName', e.target.value)}
            error={errors.schoolName}
            placeholder="Name of school"
            required
          />
          <FormField
            label="Class"
            name="class"
            value={formData.class}
            onChange={(e) => update('class', e.target.value)}
            error={errors.class}
            placeholder="e.g. 10, 12"
            required
          />
        </div>
        <div className={styles.single}>
          <FormSelect
            label="Course"
            name="course"
            value={formData.course}
            onChange={(e) => update('course', e.target.value)}
            error={errors.course}
            options={COURSES}
            placeholder="Choose course"
            required
          />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Address</h3>
        <FormTextarea
          label="Address"
          name="address"
          value={formData.address}
          onChange={(e) => update('address', e.target.value)}
          error={errors.address}
          placeholder="Street, building, locality"
          rows={3}
          required
        />
        <div className={styles.rowThree}>
          <FormField
            label="City"
            name="city"
            value={formData.city}
            onChange={(e) => update('city', e.target.value)}
            error={errors.city}
            placeholder="City"
            autoComplete="address-level2"
            required
          />
          <FormField
            label="State"
            name="state"
            value={formData.state}
            onChange={(e) => update('state', e.target.value)}
            error={errors.state}
            placeholder="State"
            autoComplete="address-level1"
            required
          />
          <FormField
            label="Pincode"
            name="pincode"
            value={formData.pincode}
            onChange={(e) => update('pincode', e.target.value)}
            error={errors.pincode}
            placeholder="6 digits"
            maxLength={6}
            required
          />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Guardian / Parent</h3>
        <div className={styles.row}>
          <FormField
            label="Guardian name"
            name="guardianName"
            value={formData.guardianName}
            onChange={(e) => update('guardianName', e.target.value)}
            error={errors.guardianName}
            placeholder="Full name"
            autoComplete="name"
            required
          />
          <FormField
            label="Guardian phone"
            name="guardianPhone"
            type="tel"
            value={formData.guardianPhone}
            onChange={(e) => update('guardianPhone', e.target.value)}
            error={errors.guardianPhone}
            placeholder="Contact number"
            autoComplete="tel"
          />
        </div>
      </section>

      <div className={styles.actions}>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'Submitting…' : 'Submit registration'}
        </button>
        <button
          type="button"
          className={styles.resetButton}
          disabled={loading}
          onClick={() => {
            setFormData(initialFormData)
            setErrors({})
            setSubmitError(null)
          }}
        >
          Reset form
        </button>
      </div>
    </form>
  )
}
