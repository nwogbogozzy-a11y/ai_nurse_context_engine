function getEnv(key: string, devFallback?: string): string {
  const value = process.env[key]
  if (value) return value

  if (process.env.NODE_ENV === 'development' && devFallback) {
    return devFallback
  }

  // In production, return fallback rather than crashing the page
  // The webhook call will fail with a clear network error instead
  if (devFallback) return devFallback

  return ''
}

export const config = {
  n8nWebhookUrl: getEnv(
    'NEXT_PUBLIC_N8N_WEBHOOK_URL',
    'http://localhost:5678/webhook/nurse-context'
  ),
  n8nSupplyWebhookUrl: getEnv(
    'NEXT_PUBLIC_N8N_WEBHOOK_URL_SUPPLY',
    'http://localhost:5678/webhook/supply-lookup'
  ),
} as const
