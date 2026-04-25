import AdminLayout from '@/admin/components/AdminLayout'

export default function BlogPagePlaceholder() {
  return (
    <AdminLayout>
      <div className="px-8 py-10">
        <p className="mb-1 text-[11px] uppercase tracking-[0.45em] text-white/35">Placeholder</p>
        <h1 className="font-display text-3xl text-white">Blog 日志</h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/65">
          Full blog post management will be added later. Current homepage blog preview is managed
          under Homepage → Blog Preview.
        </p>
      </div>
    </AdminLayout>
  )
}
