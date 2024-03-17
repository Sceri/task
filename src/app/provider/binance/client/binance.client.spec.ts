import { Test } from '@nestjs/testing'
import axios from 'axios'
import { BinanceClient } from './binance.client'
import { Currency } from '../../../domain/model/currency'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('BinanceClient', () => {
  let binanceClient: BinanceClient

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [BinanceClient],
    }).compile()

    binanceClient = moduleRef.get<BinanceClient>(BinanceClient)
    jest.clearAllMocks()
  })

  it('should return the correct price data on successful API request', async () => {
    const mockResponse = { data: { bidPrice: '50000', askPrice: '50010' } }
    mockedAxios.get.mockResolvedValue(mockResponse)

    const priceRequest = { base: Currency.BTC, counter: Currency.USDT }
    const result = await binanceClient.getPrice(priceRequest)

    expect(result).toEqual({
      bidPrice: '50000',
      askPrice: '50010',
    })
    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('BTCUSDT'))
  })

  it('should throw an error when the API request fails', async () => {
    const errorMessage = 'Network Error'
    mockedAxios.get.mockRejectedValue(new Error(errorMessage))

    const priceRequest = { base: Currency.BTC, counter: Currency.USDT }

    await expect(binanceClient.getPrice(priceRequest)).rejects.toThrow(Error)

    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('BTCUSDT'))
  })
})
