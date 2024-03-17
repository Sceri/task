import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CronExpression } from '@nestjs/schedule'
import { AppConfig } from './config'

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService<AppConfig>) {}

  public getPort(): number {
    return this.configService.get<number>('PORT', 3000)
  }

  public priceTtl(): number {
    return this.configService.get<number>('PRICE_TTL_MS', 15_000)
  }

  public serviceCommission(): string {
    return this.configService.get<string>('SERVICE_COMMISSION', '0.01')
  }

  public getRedisHost(): string {
    return this.configService.get<string>('REDIS_HOST', 'localhost')
  }

  public getRedisPort(): number {
    return this.configService.get<number>('REDIS_PORT', 6379)
  }

  public getRedisUrl(): string {
    return `redis://${this.getRedisHost()}:${this.getRedisPort()}`
  }

  public getPriceCron(): string {
    return this.configService.get<string>('PRICE_CRON', CronExpression.EVERY_10_SECONDS)
  }
}
