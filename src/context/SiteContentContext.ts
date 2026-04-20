import { createContext } from 'react'
import type { SiteContent } from '@/types'

export interface SiteContentContextValue {
  siteContent: SiteContent
  hydrated: boolean
  saveContent: (next: SiteContent) => Promise<void>
  resetContent: () => Promise<void>
}

export const SiteContentContext = createContext<SiteContentContextValue | null>(null)
