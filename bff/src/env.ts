export interface Env {
  port: number
  jwtSecret: string
  corsOrigin: string
  dbPath: string
}

export function loadEnv(overrides: Partial<Env> = {}): Env {
  return {
    port: overrides.port ?? Number(process.env.PORT ?? "8787"),
    jwtSecret: overrides.jwtSecret ?? process.env.JWT_SECRET ?? "change-me",
    corsOrigin: overrides.corsOrigin ?? process.env.CORS_ORIGIN ?? "http://localhost:5173",
    dbPath: overrides.dbPath ?? process.env.DB_PATH ?? "data/florecer.db",
  }
}
