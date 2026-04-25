import AdminLayout from '@/admin/components/AdminLayout'

export default function PhotosLibraryPlaceholderPage() {
  return (
    <AdminLayout>
      <div className="px-8 py-10">
        <p className="mb-1 text-[11px] uppercase tracking-[0.45em] text-white/35">Placeholder</p>
        <h1 className="font-display text-3xl text-white">Photos 图片管理</h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/65">
          A full photo/media library will be added later. Current homepage portfolio preview images
          are managed under Homepage → Portfolio Preview.
        </p>
      </div>
    </AdminLayout>
  )
}
