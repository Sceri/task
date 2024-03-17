import { Currency } from '../domain/model/currency'

export type AssetPrice = {
  bidPrice: string
  askPrice: string
}

export type PriceRequest = {
  base: Currency
  counter: Currency
}

export interface PriceProvider {
  getPrice(req: PriceRequest): Promise<AssetPrice>
}
