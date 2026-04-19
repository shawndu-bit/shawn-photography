interface ToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (val: boolean) => void
}

export default function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.05]">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="mt-1 text-[12px] text-white/45">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 flex-shrink-0 rounded-full border transition-colors ${
          checked
            ? 'border-white/30 bg-white/20'
            : 'border-white/10 bg-white/5'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  )
}
