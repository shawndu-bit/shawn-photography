import AdminLayout from '@/admin/components/AdminLayout'

export default function PortfolioPlaceholderPage() {
  return (
    <AdminLayout>
      <div className="px-8 py-10">
        <p className="mb-1 text-[11px] uppercase tracking-[0.45em] text-white/35">Placeholder</p>
        <h1 className="font-display text-3xl text-white">Portfolio 作品集</h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/65">
          Portfolio page management will be added later. Current homepage portfolio preview is
          managed under Homepage → Portfolio Preview.
        </p>
      </div>
    </AdminLayout>
  )
}
