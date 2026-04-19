import type { ReactNode } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminGuard from './AdminGuard'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden bg-[#0e0e0e] text-mist">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </AdminGuard>
  )
}
