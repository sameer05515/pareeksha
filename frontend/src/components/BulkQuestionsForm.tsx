import { useState, useCallback } from 'react'
import { createQuestionsBulk } from '@/api/questions'
import type { CreateQuestionBody } from '@/types/question'

const EXAMPLE_JSON = `[
  {
    "questionText": "What is 2 + 2?",
    "options": ["3", "4", "5"],
    "correctIndex": 1
  },
  {
    "questionText": "Capital of India?",
    "options": ["Mumbai", "Delhi", "Kolkata"],
    "correctIndex": 1
  }
]`

function parseBulkJson(raw: string): { ok: true; data: CreateQuestionBody[] } | { ok: false; error: string } {
  const trimmed = raw.trim()
  if (!trimmed) return { ok: false, error: 'Paste JSON array of questions' }
  let arr: unknown
  try {
    arr = JSON.parse(trimmed)
  } catch {
    return { ok: false, error: 'Invalid JSON' }
  }
  if (!Array.isArray(arr)) return { ok: false, error: 'Root must be a JSON array' }
  const out: CreateQuestionBody[] = []
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    if (!item || typeof item !== 'object') {
      return { ok: false, error: `Item ${i}: must be an object` }
    }
    const o = item as Record<string, unknown>
    const questionText = o.questionText
    if (!questionText || typeof questionText !== 'string' || String(questionText).trim() === '') {
      return { ok: false, error: `Item ${i}: questionText is required` }
    }
    const options = o.options
    if (!Array.isArray(options) || options.length < 2) {
      return { ok: false, error: `Item ${i}: options must be an array with at least 2 items` }
    }
    const optionsStrings = options.map((x) => (x != null ? String(x).trim() : '')).filter(Boolean)
    if (optionsStrings.length < 2) {
      return { ok: false, error: `Item ${i}: at least 2 non-empty options required` }
    }
    const correctIndex = o.correctIndex
    if (typeof correctIndex !== 'number' || correctIndex < 0 || correctIndex >= optionsStrings.length) {
      return { ok: false, error: `Item ${i}: correctIndex must be 0 to ${optionsStrings.length - 1}` }
    }
    out.push({
      questionText: String(questionText).trim(),
      options: optionsStrings,
      correctIndex,
    })
  }
  return { ok: true, data: out }
}

export function BulkQuestionsForm({ onSuccess }: { onSuccess?: () => void }) {
  const [json, setJson] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [parseCount, setParseCount] = useState<number | null>(null)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string; count?: number; errors?: { index: number; message: string }[] } | null>(null)
  const [loading, setLoading] = useState(false)

  const validate = useCallback(() => {
    setSubmitResult(null)
    const result = parseBulkJson(json)
    if (result.ok) {
      setParseError(null)
      setParseCount(result.data.length)
    } else {
      setParseError(result.error)
      setParseCount(null)
    }
  }, [json])

  const handleImport = useCallback(async () => {
    const result = parseBulkJson(json)
    if (!result.ok) {
      setParseError(result.error)
      setSubmitResult(null)
      return
    }
    setParseError(null)
    setLoading(true)
    setSubmitResult(null)
    try {
      const res = await createQuestionsBulk(result.data)
      if (res.success && res.count != null) {
        setSubmitResult({ success: true, message: res.message ?? `Added ${res.count} question(s)`, count: res.count })
        setJson('')
        setParseCount(null)
        onSuccess?.()
      } else {
        setSubmitResult({
          success: false,
          message: res.message ?? 'Import failed',
          errors: res.errors,
        })
      }
    } catch (err) {
      setSubmitResult({
        success: false,
        message: err instanceof Error ? err.message : 'Import failed',
      })
    } finally {
      setLoading(false)
    }
  }, [json, onSuccess])

  const insertExample = () => setJson(EXAMPLE_JSON)

  return (
    <div className="flex flex-col gap-4 max-w-[720px]">
      <h3 className="text-base font-semibold text-accent m-0 tracking-wide">Bulk import (JSON)</h3>
      <p className="text-sm text-muted m-0">
        Paste a JSON array of questions. Each item: <code className="bg-input px-1 rounded text-xs">questionText</code>,{' '}
        <code className="bg-input px-1 rounded text-xs">options</code> (array of strings),{' '}
        <code className="bg-input px-1 rounded text-xs">correctIndex</code> (0-based).
      </p>
      <textarea
        value={json}
        onChange={(e) => {
          setJson(e.target.value)
          setParseError(null)
          setSubmitResult(null)
        }}
        placeholder={EXAMPLE_JSON}
        className="w-full min-h-[180px] py-2.5 px-3.5 bg-input border border-border rounded text-text font-mono text-sm placeholder:text-muted/70 focus:outline-none focus:border-border-focus resize-y"
        spellCheck={false}
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={validate}
          className="py-2 px-4 bg-transparent border border-border rounded text-sm font-medium text-muted hover:bg-input hover:text-text transition-colors"
        >
          Validate
        </button>
        <button
          type="button"
          onClick={handleImport}
          disabled={loading || !json.trim()}
          className="py-2 px-4 bg-accent text-white border-0 rounded text-sm font-semibold hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Importing…' : parseCount != null ? `Import ${parseCount} question(s)` : 'Import'}
        </button>
        <button
          type="button"
          onClick={insertExample}
          className="py-2 px-4 text-sm text-muted hover:text-text transition-colors"
        >
          Insert example
        </button>
        {parseCount != null && !submitResult && (
          <span className="text-sm text-success">Valid: {parseCount} question(s)</span>
        )}
      </div>
      {parseError && (
        <div className="py-2 px-3 bg-red-500/10 border border-error rounded text-error text-sm" role="alert">
          {parseError}
        </div>
      )}
      {submitResult && (
        <div
          className={`py-2 px-3 rounded text-sm ${
            submitResult.success
              ? 'bg-success/10 border border-success text-success'
              : 'bg-red-500/10 border border-error text-error'
          }`}
          role="alert"
        >
          <p className="m-0 font-medium">{submitResult.message}</p>
          {submitResult.errors && submitResult.errors.length > 0 && (
            <ul className="mt-2 mb-0 pl-4 list-disc text-left">
              {submitResult.errors.map((e, i) => (
                <li key={i}>
                  Index {e.index}: {e.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
