import { Module } from '@nestjs/common'
import { BtcPriceService } from './service/btc.price.service'
import { TaskService } from './service/task/task.service'
import { ScheduleModule } from '@nestjs/schedule'
import { BtcPriceController } from './controller/btc.price.controller'
import { AppConfigModule } from '../config/config.module'
import { BinanceProviderModule } from '../provider/binance/binance.provider.module'

@Module({
  imports: [ScheduleModule.forRoot(), AppConfigModule, BinanceProviderModule],
  controllers: [BtcPriceController],
  providers: [BtcPriceService, TaskService],
})
export class BtcPriceModule {}
