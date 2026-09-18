import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/** Labelled text input. The label is a real <label> for screen readers. */
export function Input({ label, error, id, className = "", ...rest }: InputProps) {
  const inputId = id ?? `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        className={`rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition
          focus:border-brand focus:ring-2 focus:ring-brand/20
          ${error ? "border-red-400" : "border-line"} ${className}`}
        {...rest}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function Textarea({ label, id, className = "", ...rest }: TextareaProps) {
  const fieldId = id ?? `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <textarea
        id={fieldId}
        className={`resize-none rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none
          transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${className}`}
        {...rest}
      />
    </div>
  );
}
