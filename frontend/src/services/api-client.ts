import { getConfig } from "./config"
import { FlorecerApiError, type ApiErrorResponse } from "@/types/api"

const IDEMPOTENT_METHODS = new Set(["GET", "HEAD", "OPTIONS"])
const AUTH_TOKEN_KEY = "florecer.auth.token"
const AUTH_USER_KEY = "florecer.auth.user"

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError || (error instanceof Error && error.message === "Failed to fetch")
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 503 || status >= 500
}

export async function request<T>(
  path: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const config = getConfig()
  const baseUrl = config.bffBaseUrl
  const timeoutMs = options.timeoutMs ?? config.timeoutMs
  const { maxAttempts, baseDelayMs, maxDelayMs } = config.retry

  const url = `${baseUrl}${path}`
  const method = (options.method ?? "GET").toUpperCase()
  const isIdempotent = IDEMPOTENT_METHODS.has(method)

  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const token = getStoredAuthToken()
      const headers = new Headers(options.headers)
      headers.set("Content-Type", "application/json")
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }

      const response = await fetch(url, {
        ...options,
        signal: options.signal ?? controller.signal,
        headers,
      })

      if (response.ok) {
        if (response.status === 204) {
          return undefined as T
        }
        return response.json() as Promise<T>
      }

      if (response.status === 401 || response.status === 403) {
        const body = await parseErrorBody(response)
        clearStoredAuth()
        throw new FlorecerApiError(body.code, body.message, response.status)
      }

      if (!isRetryableStatus(response.status) || !isIdempotent) {
        const body = await parseErrorBody(response)
        throw new FlorecerApiError(body.code, body.message, response.status)
      }

      const body = await parseErrorBody(response)
      lastError = new FlorecerApiError(body.code, body.message, response.status)
    } catch (error) {
      if (error instanceof FlorecerApiError) {
        throw error
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        lastError = new FlorecerApiError("TIMEOUT", `Request to ${path} timed out after ${timeoutMs}ms`, 408)
      } else if (isNetworkError(error)) {
        lastError = error
      } else {
        throw error
      }
    } finally {
      clearTimeout(timeoutId)
    }

    if (attempt < maxAttempts && (isIdempotent || isNetworkError(lastError))) {
      const backoffMs = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs)
      await delay(backoffMs)
    }
  }

  if (lastError instanceof FlorecerApiError) {
    throw lastError
  }

  throw new FlorecerApiError(
    "NETWORK_ERROR",
    `Request to ${path} failed after ${maxAttempts} attempts`,
    0
  )
}

export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setStoredAuth(token: string, user: unknown): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(AUTH_TOKEN_KEY, token)
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export function getStoredAuthUser<T>(clearInvalid = true): T | null {
  if (typeof window === "undefined") return null
  const storedUser = window.localStorage.getItem(AUTH_USER_KEY)
  if (!storedUser) return null

  try {
    return JSON.parse(storedUser) as T
  } catch {
    if (clearInvalid) clearStoredAuth()
    return null
  }
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  window.localStorage.removeItem(AUTH_USER_KEY)
  if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
    window.location.assign("/login")
  }
}

async function parseErrorBody(response: Response): Promise<{ code: string; message: string }> {
  try {
    const body: ApiErrorResponse = await response.json()
    return {
      code: body.error?.code ?? "UNKNOWN",
      message: body.error?.message ?? response.statusText,
    }
  } catch {
    return {
      code: "UNKNOWN",
      message: response.statusText || "Unknown error",
    }
  }
}

export function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  return request<T>(path, { method: "GET", signal })
}

export function post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  })
}

export function del<T>(path: string, signal?: AbortSignal): Promise<T> {
  return request<T>(path, { method: "DELETE", signal })
}
