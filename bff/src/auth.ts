import { Buffer } from "node:buffer"
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { sign } from "hono/jwt"

import type { User } from "./types/api.js"

const KEY_LENGTH = 64

function scryptAsync(password: string, salt: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, derivedKey) => {
      if (error) {
        reject(error)
        return
      }
      resolve(derivedKey)
    })
  })
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex")
  const derivedKey = await scryptAsync(password, salt)
  return `scrypt:${salt}:${Buffer.from(derivedKey).toString("hex")}`
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, salt, hash] = storedHash.split(":")
  if (algorithm !== "scrypt" || !salt || !hash) return false

  const candidate = await scryptAsync(password, salt)
  const stored = Buffer.from(hash, "hex")
  if (candidate.byteLength !== stored.byteLength) return false
  return timingSafeEqual(candidate, stored)
}

export async function createToken(user: User, secret: string): Promise<string> {
  return sign(
    {
      sub: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    },
    secret
  )
}
