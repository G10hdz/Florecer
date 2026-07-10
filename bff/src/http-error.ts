import type { Context } from "hono"

export class HttpError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = "HttpError"
    this.status = status
    this.code = code
  }
}

export function errorResponse(c: Context, error: unknown) {
  if (error instanceof HttpError) {
    return c.json(
      {
        error: {
          code: error.code,
          message: error.message,
          status: error.status,
        },
      },
      error.status as 400
    )
  }

  if (hasStatus(error)) {
    return c.json(
      {
        error: {
          code: error.status === 401 ? "UNAUTHORIZED" : "HTTP_ERROR",
          message: error.message,
          status: error.status,
        },
      },
      error.status as 400
    )
  }

  const message = error instanceof Error ? error.message : "Unexpected error"
  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message,
        status: 500,
      },
    },
    500
  )
}

function hasStatus(error: unknown): error is { status: number; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  )
}
