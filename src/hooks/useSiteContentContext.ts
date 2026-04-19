import { useContext } from 'react'
import { SiteContentContext } from '@/context/SiteContentContext'

export function useSiteContentContext() {
  const context = useContext(SiteContentContext)

  if (!context) {
    throw new Error('useSiteContentContext must be used within SiteContentContext provider')
  }

  return context
}
