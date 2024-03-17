import { Injectable } from '@nestjs/common'
import { BinanceClient } from './client/binance.client'
import { PriceProvider, PriceRequest } from '../provider.interface'

@Injectable()
export class BinancePriceProvider implements PriceProvider {
  constructor(private readonly binanceClient: BinanceClient) {}

  public async getPrice(req: PriceRequest) {
    return await this.binanceClient.getPrice(req)
  }
}
