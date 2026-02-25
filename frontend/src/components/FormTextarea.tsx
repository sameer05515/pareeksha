import type { TextareaHTMLAttributes } from 'react'
import styles from './FormTextarea.module.css'

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  name: string
  error?: string
}

export function FormTextarea({ label, name, error, id, ...props }: FormTextareaProps) {
  const textareaId = id ?? name
  return (
    <div className={styles.field}>
      <label htmlFor={textareaId} className={styles.label}>
        {label}
      </label>
      <textarea
        id={textareaId}
        name={name}
        className={`${styles.textarea} ${error ? styles.textareaError : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${name}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
