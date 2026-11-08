export interface HealthResponse {
  ok: boolean
  time: string
}

export type SiteContent = Record<string, string>

export type ProjectStatus = 'completed' | 'in-progress' | 'archived'

export interface ProjectImage {
  id: number
  url: string
  alt: string
}

export interface Project {
  id: number
  slug: string
  title: string
  summary: string
  description: string
  tech: string[]
  features: string[]
  role: string
  year: number | null
  status: ProjectStatus
  url: string | null
  repoUrl: string | null
  imageUrl: string | null
  images: ProjectImage[]
  featured: boolean
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

export type ContentFieldType = 'text' | 'textarea' | 'url' | 'number'

export interface ContentItem {
  key: string
  value: string
  type: ContentFieldType
  group: string
  label: string
  sortOrder: number
}

export interface AdminProject extends Project {
  published: boolean
}

export interface ProjectInput {
  slug: string
  title: string
  summary: string
  description: string
  tech: string[]
  features: string[]
  role: string
  year: number | null
  status: ProjectStatus
  url: string | null
  repoUrl: string | null
  featured: boolean
  published: boolean
  sortOrder: number
}

export type SkillInput = Pick<Skill, 'name' | 'level'>
export type ContactLinkInput = Pick<ContactLink, 'label' | 'value' | 'url' | 'icon'>
