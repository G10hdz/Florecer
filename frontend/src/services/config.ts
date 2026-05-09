const config = {
  dev: {
    bffBaseUrl: "http://localhost:8787",
    r2BaseUrl: "https://r2-cdn-dev.florecer.com",
    logLevel: "debug",
    retry: {
      maxAttempts: 3,
      baseDelayMs: 1000,
      maxDelayMs: 10000,
    },
    timeoutMs: 15000,
  },
  prod: {
    bffBaseUrl: "https://florecer-bff.railway.app",
    r2BaseUrl: "https://r2-cdn.florecer.com",
    logLevel: "error",
    retry: {
      maxAttempts: 3,
      baseDelayMs: 1000,
      maxDelayMs: 10000,
    },
    timeoutMs: 15000,
  },
} as const

export type Environment = keyof typeof config

type ConfigShape = (typeof config)[Environment]

function resolveEnv(): Environment {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "dev"
  }
  if (import.meta.env.VITE_ENV === "production") {
    return "prod"
  }
  return import.meta.env.MODE === "production" ? "prod" : "dev"
}

const currentEnv = resolveEnv()
const currentConfig: ConfigShape = config[currentEnv]

export function getBffUrl(): string {
  return import.meta.env.VITE_BFF_URL ?? currentConfig.bffBaseUrl
}

export function getR2Url(): string {
  return import.meta.env.VITE_R2_URL ?? currentConfig.r2BaseUrl
}

export function getConfig() {
  return {
    env: currentEnv,
    bffBaseUrl: getBffUrl(),
    r2BaseUrl: getR2Url(),
    logLevel: currentConfig.logLevel,
    retry: currentConfig.retry,
    timeoutMs: currentConfig.timeoutMs,
  }
}
