import { createContext, useContext } from 'react'

export interface AdminAuthContextValue {
  authed: boolean
  ready: boolean
  login: (password: string) => boolean
  logout: () => void
}

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function useAdminAuthContext() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('Missing AdminAuthContext provider')
  return ctx
}
