import { Module } from '@nestjs/common'
import { AppConfigModule } from './config/config.module'
import { AppCacheModule } from './cache/cache.module'
import { LockModule } from './lock/lock.module'
import { BtcPriceModule } from './price/btc.price.module'

@Module({
  imports: [AppConfigModule, AppCacheModule, LockModule, BtcPriceModule],
})
export class AppModule {}
