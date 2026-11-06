import { api } from '$lib/api/client'
import type { Project } from '@shared/types'

class ProjectsStore {
  list = $state<Project[]>([])
  loaded = $state(false)
  error = $state('')
  #started = false

  async load() {
    if (this.#started) return
    this.#started = true
    try {
      this.list = await api.projects()
    } catch {
      this.error = 'Failed to load projects.'
      this.#started = false
    }
    this.loaded = true
  }
}

export const projects = new ProjectsStore()
