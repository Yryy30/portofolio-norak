import type { ContactLink, Project, SiteContent, Skill } from '@shared/types'

async function get<T>(path: string): Promise<T> {
  const r = await fetch(path)
  if (!r.ok) throw new Error(`${path}: ${r.status}`)
  return r.json() as Promise<T>
}

export const api = {
  content: () => get<SiteContent>('/api/content'),
  projects: () => get<Project[]>('/api/projects'),
  skills: () => get<Skill[]>('/api/skills'),
  contactLinks: () => get<ContactLink[]>('/api/contact-links'),
}
