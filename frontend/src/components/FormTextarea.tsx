import type { TextareaHTMLAttributes } from 'react'

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  name: string
  error?: string
}

const textareaBase =
  'py-2.5 px-3.5 bg-input border border-border rounded text-text min-h-[100px] resize-y placeholder:text-muted/70 transition-colors hover:border-zinc-600 focus:outline-none focus:border-border-focus focus:ring-[3px] focus:ring-indigo-500/20'
const textareaError = 'border-error focus:border-error focus:ring-red-500/20'

export function FormTextarea({ label, name, error, id, ...props }: FormTextareaProps) {
  const textareaId = id ?? name
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={textareaId} className="text-sm font-medium text-muted">
        {label}
      </label>
      <textarea
        id={textareaId}
        name={name}
        className={`${textareaBase} ${error ? textareaError : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${name}-error`} className="text-xs font-mono text-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
