import { post } from "./api-client"
import type { AuthResponse } from "@/types/api"

export interface AuthPayload {
  email: string
  password: string
}

export function login(payload: AuthPayload): Promise<AuthResponse> {
  return post<AuthResponse>("/auth/login", payload)
}

export function register(payload: AuthPayload): Promise<AuthResponse> {
  return post<AuthResponse>("/auth/register", payload)
}
