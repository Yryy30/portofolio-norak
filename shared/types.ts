export interface HealthResponse {
  ok: boolean
  time: string
}

export type SiteContent = Record<string, string>

export interface Project {
  id: number
  slug: string
  title: string
  description: string
  tech: string[]
  url: string | null
  imageUrl: string | null
  sortOrder: number
}

export interface Skill {
  id: number
  name: string
  level: number | null
  sortOrder: number
}

export interface ContactLink {
  id: number
  label: string
  value: string
  url: string | null
  icon: string
  sortOrder: number
}
