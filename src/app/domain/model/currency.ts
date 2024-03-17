export enum Currency {
  USDT = 'USDT',
  BTC = 'BTC',
}

export const DECIMAL_PLACES: Record<Currency, number> = {
  USDT: 2,
  BTC: 8,
}
