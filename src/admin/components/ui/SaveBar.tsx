interface SaveBarProps {
  dirty: boolean
  saving?: boolean
  onSave: () => void
  onReset?: () => void
}

export default function SaveBar({ dirty, saving, onSave, onReset }: SaveBarProps) {
  if (!dirty) return null
  return (
    <div className="sticky bottom-0 z-10 flex items-center justify-between gap-4 border-t border-white/10 bg-[#0e0e0e]/90 px-8 py-4 backdrop-blur">
      <p className="text-[12px] text-white/40">有未保存的修改</p>
      <div className="flex gap-3">
        {onReset && (
          <button
            onClick={onReset}
            className="rounded-full border border-white/10 px-5 py-2 text-[12px] tracking-wide text-white/50 transition hover:border-white/20 hover:text-white/80"
          >
            撤销
          </button>
        )}
        <button
          onClick={onSave}
          disabled={saving}
          className="rounded-full bg-white px-6 py-2 text-[12px] font-medium tracking-wide text-black transition hover:bg-white/90 disabled:opacity-50"
        >
          {saving ? '保存中…' : '保存修改'}
        </button>
      </div>
    </div>
  )
}
