import { Inject, Injectable, Logger } from '@nestjs/common'
import BigNumber from 'bignumber.js'
import { MurLock } from 'murlock'
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import { PRICE_PROVIDER_TOKEN } from '../../provider/provider.constants'
import { PriceProvider } from '../../provider/provider.interface'
import { AppConfigService } from '../../config/config.service'
import { Currency, DECIMAL_PLACES } from '../../domain/model/currency'

@Injectable()
export class BtcPriceService {
  public static readonly BTC_PRICE_KEY = 'btc-price'
  private readonly logger = new Logger(BtcPriceService.name)

  constructor(
    @Inject(PRICE_PROVIDER_TOKEN) private readonly priceProvider: PriceProvider,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly appConfigService: AppConfigService,
  ) {}

  @MurLock(5000)
  public async updateBtcPrice() {
    const price = await this.calculatePrice()
    await this.cacheManager.set(BtcPriceService.BTC_PRICE_KEY, price, this.appConfigService.priceTtl())
  }

  public async getBtcPrice() {
    return this.cacheManager.wrap(
      BtcPriceService.BTC_PRICE_KEY,
      () => this.calculatePrice(),
      this.appConfigService.priceTtl,
    )
  }

  private async calculatePrice() {
    this.logger.log('Calculating price for BTC / USDT...')

    const base = Currency.BTC
    const counter = Currency.USDT

    const { askPrice, bidPrice } = await this.priceProvider.getPrice({ base, counter })

    this.logger.debug(`Received price from provider: ${askPrice} / ${bidPrice}`)

    const commissionPercent = new BigNumber(this.appConfigService.serviceCommission())
    const commissionMultiplier = new BigNumber(1).plus(commissionPercent.dividedBy(100))

    const decimalPlaces = DECIMAL_PLACES[counter]

    const newAskPrice = new BigNumber(askPrice)
      .multipliedBy(commissionMultiplier)
      .decimalPlaces(decimalPlaces, BigNumber.ROUND_HALF_EVEN)

    const newBidPrice = new BigNumber(bidPrice)
      .multipliedBy(commissionMultiplier)
      .decimalPlaces(decimalPlaces, BigNumber.ROUND_HALF_EVEN)

    const midPrice = newBidPrice
      .plus(newAskPrice)
      .dividedBy(2)
      .decimalPlaces(decimalPlaces, BigNumber.ROUND_HALF_EVEN)

    this.logger.debug(
      `Calculated price (commission: ${commissionPercent}%): ${newAskPrice} / ${newBidPrice} / ${midPrice}`,
    )

    return {
      askPrice: newAskPrice.toFixed(decimalPlaces),
      bidPrice: newBidPrice.toFixed(decimalPlaces),
      midPrice: midPrice.toFixed(decimalPlaces),
    }
  }
}
