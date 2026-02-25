import type { SelectHTMLAttributes } from 'react'
import styles from './FormSelect.module.css'

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  name: string
  error?: string
  options: readonly string[] | { value: string; label: string }[]
  placeholder?: string
}

export function FormSelect({
  label,
  name,
  error,
  options,
  placeholder = 'Select...',
  id,
  ...props
}: FormSelectProps) {
  const selectId = id ?? name
  const optionList = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  )
  return (
    <div className={styles.field}>
      <label htmlFor={selectId} className={styles.label}>
        {label}
      </label>
      <select
        id={selectId}
        name={name}
        className={`${styles.select} ${error ? styles.selectError : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      >
        <option value="">{placeholder}</option>
        {optionList.map(({ value, label: l }) => (
          <option key={value} value={value}>
            {l}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${name}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
