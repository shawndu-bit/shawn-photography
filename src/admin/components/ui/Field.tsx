import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface BaseProps {
  label: string
  hint?: string
  as?: 'input' | 'textarea'
}

type FieldProps =
  | (BaseProps & { as?: 'input' } & InputHTMLAttributes<HTMLInputElement>)
  | (BaseProps & { as: 'textarea' } & TextareaHTMLAttributes<HTMLTextAreaElement>)

const baseClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-white/30 focus:bg-white/[0.06]'

export default function Field(props: FieldProps) {
  if (props.as === 'textarea') {
    const { label, hint, as: _as, ...rest } = props as BaseProps &
      TextareaHTMLAttributes<HTMLTextAreaElement>
    return (
      <div className="flex flex-col gap-2">
        <label className="text-[11px] uppercase tracking-[0.3em] text-white/50">{label}</label>
        <textarea rows={4} className={`${baseClass} resize-y`} {...rest} />
        {hint && <p className="text-[11px] text-white/30">{hint}</p>}
      </div>
    )
  }

  const { label, hint, as: _as, ...rest } = props as BaseProps &
    InputHTMLAttributes<HTMLInputElement>
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] uppercase tracking-[0.3em] text-white/50">{label}</label>
      <input className={baseClass} {...rest} />
      {hint && <p className="text-[11px] text-white/30">{hint}</p>}
    </div>
  )
}
