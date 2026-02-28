import type { InputHTMLAttributes } from 'react'

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string
  name: string
  error?: string
  hint?: string
}

const inputBase =
  'py-2.5 px-3.5 bg-input border border-border rounded text-text placeholder:text-muted/70 transition-colors hover:border-zinc-600 focus:outline-none focus:border-border-focus focus:ring-[3px] focus:ring-indigo-500/20'
const inputError = 'border-error focus:border-error focus:ring-red-500/20'

export function FormField({ label, name, error, hint, id, ...props }: FormFieldProps) {
  const inputId = id ?? name
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-muted">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        className={`${inputBase} ${error ? inputError : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        {...props}
      />
      {hint && !error && (
        <span id={`${name}-hint`} className="text-xs font-mono text-muted">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${name}-error`} className="text-xs font-mono text-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
