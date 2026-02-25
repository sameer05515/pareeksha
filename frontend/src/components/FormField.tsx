import type { InputHTMLAttributes } from 'react'
import styles from './FormField.module.css'

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string
  name: string
  error?: string
  hint?: string
}

export function FormField({ label, name, error, hint, id, ...props }: FormFieldProps) {
  const inputId = id ?? name
  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        {...props}
      />
      {hint && !error && (
        <span id={`${name}-hint`} className={styles.hint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={`${name}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
