import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { SchedulerRegistry } from '@nestjs/schedule'
import { CronJob } from 'cron'
import { BtcPriceService } from '../btc.price.service'
import { AppConfigService } from '../../../config/config.service'

@Injectable()
export class TaskService implements OnModuleInit, OnModuleDestroy {
  private static readonly PRICE_UPDATE_JOB = 'update-btc-price'

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private configService: AppConfigService,
    private priceService: BtcPriceService,
  ) {}

  public onModuleInit() {
    const cronExpression = this.configService.getPriceCron()
    const priceUpdateJob = new CronJob(cronExpression, async () => this.priceService.updateBtcPrice())

    this.schedulerRegistry.addCronJob(TaskService.PRICE_UPDATE_JOB, priceUpdateJob)

    priceUpdateJob.start()
  }

  public async onModuleDestroy() {
    this.schedulerRegistry.deleteCronJob(TaskService.PRICE_UPDATE_JOB)
  }
}
