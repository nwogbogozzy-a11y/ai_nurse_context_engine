function requireEnv(key: string, devFallback?: string): string {
  const value = process.env[key]
  if (value) return value

  if (process.env.NODE_ENV === 'development' && devFallback) {
    console.warn(`[config] ${key} not set — using dev fallback: ${devFallback}`)
    return devFallback
  }

  throw new Error(
    `Missing required environment variable: ${key}. ` +
    `Set it in your Vercel dashboard or .env.local file.`
  )
}

export const config = {
  n8nWebhookUrl: requireEnv(
    'NEXT_PUBLIC_N8N_WEBHOOK_URL',
    'http://localhost:5678/webhook/nurse-context'
  ),
  n8nSupplyWebhookUrl: requireEnv(
    'NEXT_PUBLIC_N8N_WEBHOOK_URL_SUPPLY',
    'http://localhost:5678/webhook/supply-lookup'
  ),
} as const
