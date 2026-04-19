import { createContext } from 'react'
import type { SiteContent } from '@/types'

export interface SiteContentContextValue {
  siteContent: SiteContent
  hydrated: boolean
  saveContent: (next: SiteContent) => void
  resetContent: () => void
}

export const SiteContentContext = createContext<SiteContentContextValue | null>(null)
