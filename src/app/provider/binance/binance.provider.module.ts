import { Module } from '@nestjs/common'
import { BinanceClient } from './client/binance.client'
import { BinancePriceProvider } from './binance.provider'
import { PRICE_PROVIDER_TOKEN } from '../provider.constants'

@Module({
  providers: [
    BinanceClient,
    {
      provide: PRICE_PROVIDER_TOKEN,
      useClass: BinancePriceProvider,
    },
  ],
  exports: [PRICE_PROVIDER_TOKEN],
})
export class BinanceProviderModule {}
