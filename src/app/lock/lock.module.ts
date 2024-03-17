import { Module } from '@nestjs/common'
import { MurLockModule } from 'murlock'
import { AppConfigModule } from '../config/config.module'
import { AppConfigService } from '../config/config.service'

@Module({
  imports: [
    MurLockModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: async (configService: AppConfigService) => ({
        redisOptions: { url: configService.getRedisUrl() },
        wait: 1000,
        maxAttempts: 1,
        logLevel: 'log',
        ignoreUnlockFail: true
      }),
    }),
  ],
})
export class LockModule {}
