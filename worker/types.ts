export type Bindings = {
  DB: D1Database
  MEDIA: R2Bucket
  ADMIN_PASSWORD: string
  JWT_SECRET: string
}

export type AppEnv = { Bindings: Bindings }
