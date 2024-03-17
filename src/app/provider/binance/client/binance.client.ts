import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import { AssetPrice, PriceRequest } from '../../provider.interface'
import { ServiceError } from '../../../domain/exception/service.error'
import { BinancePriceResponse } from './binance.client.types'

@Injectable()
export class BinanceClient {
  private readonly logger = new Logger(BinanceClient.name)

  public async getPrice(req: PriceRequest): Promise<AssetPrice> {
    try {
      this.logger.debug(`Fetching price for ${req.base} / ${req.counter} from Binance...`)

      const symbol = `${req.base}${req.counter}`.toUpperCase()
      const response = await axios.get<BinancePriceResponse>(
        `https://api.binance.com/api/v3/ticker/bookTicker?symbol=${symbol}`,
      )

      return {
        bidPrice: response.data.bidPrice,
        askPrice: response.data.askPrice,
      }
    } catch (error) {
      throw new ServiceError('Error getting price from Binance', error as Error)
    }
  }
}
