import type { SelectHTMLAttributes } from 'react'

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  name: string
  error?: string
  options: readonly string[] | { value: string; label: string }[]
  placeholder?: string
}

const selectBase =
  'py-2.5 pl-3.5 pr-10 bg-input border border-border rounded text-text cursor-pointer transition-colors hover:border-zinc-600 focus:outline-none focus:border-border-focus focus:ring-[3px] focus:ring-indigo-500/20 appearance-none bg-no-repeat bg-[length:12px_12px] bg-[right_0.9rem_center]'
const selectBgSvg =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a1a1aa' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")"
const selectError = 'border-error focus:border-error focus:ring-red-500/20'

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
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-muted">
        {label}
      </label>
      <select
        id={selectId}
        name={name}
        className={`${selectBase} ${error ? selectError : ''}`}
        style={{ backgroundImage: selectBgSvg }}
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
        <span id={`${name}-error`} className="text-xs font-mono text-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
