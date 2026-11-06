export type Bindings = {
  DB: D1Database
  MEDIA: R2Bucket
}

export type AppEnv = { Bindings: Bindings }
