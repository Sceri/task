import { Module } from '@nestjs/common'
import { RedisClientOptions } from 'redis'
import { redisStore } from 'cache-manager-redis-yet'
import { CacheModule } from '@nestjs/cache-manager'
import { AppConfigModule } from '../config/config.module'
import { AppConfigService } from '../config/config.service'

@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: async (configService: AppConfigService) => ({
        store: redisStore,
        socket: {
          host: configService.getRedisHost(),
          port: configService.getRedisPort(),
        },
      }),
      isGlobal: true,
    }),
  ],
})
export class AppCacheModule {}
