import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import type { DatabaseSync } from "node:sqlite"

const currentDir = dirname(fileURLToPath(import.meta.url))
const migrationPath = join(currentDir, "../../migrations/001_initial.sql")

export function runMigrations(db: DatabaseSync): void {
  db.exec(readFileSync(migrationPath, "utf8"))
}
