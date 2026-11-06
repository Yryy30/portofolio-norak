import { api } from '$lib/api/client'
import type { SiteContent } from '@shared/types'

class ContentStore {
  data = $state<SiteContent>({})
  loaded = $state(false)

  async load() {
    try {
      this.data = await api.content()
    } catch {
      /* leave it empty, fallback to the default text */
    }
    this.loaded = true
  }

  t(key: string, fallback = '') {
    return this.data[key] ?? fallback
  }
}

export const content = new ContentStore()
