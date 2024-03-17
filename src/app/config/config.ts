export interface AppConfig {
  PORT: number
  REDIS_HOST: string
  REDIS_PORT: number

  SERVICE_COMMISSION: string
  PRICE_TTL_MS: number
  PRICE_CRON: string
}
