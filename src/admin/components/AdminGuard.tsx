import { Navigate } from 'react-router-dom'
import { useAdminAuthContext } from '@/admin/context/AdminAuthContext'
import type { ReactNode } from 'react'

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { authed, ready } = useAdminAuthContext()
  if (!ready) return null
  if (!authed) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}
