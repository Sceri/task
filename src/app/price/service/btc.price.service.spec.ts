import { Test } from '@nestjs/testing'
import { Cache, CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager'
import { BtcPriceService } from './btc.price.service'
import { MurLockService } from 'murlock'
import { PRICE_PROVIDER_TOKEN } from '../../provider/provider.constants'
import { AppConfigService } from '../../config/config.service'

const mockPriceProvider = {
  getPrice: jest.fn(),
}

const mockConfigService = {
  priceTtl: jest.fn(),
  serviceCommission: jest.fn(),
}

describe('PriceService', () => {
  let priceService: BtcPriceService
  let cacheManager: Cache

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        BtcPriceService,
        {
          provide: PRICE_PROVIDER_TOKEN,
          useValue: mockPriceProvider,
        },
        {
          provide: AppConfigService,
          useValue: mockConfigService,
        },
        {
          provide: MurLockService,
          useValue: {
            lock: jest.fn(() => Promise.resolve(true)),
            unlock: jest.fn(() => Promise.resolve(true)),
          },
        },
      ],
    }).compile()

    priceService = moduleRef.get<BtcPriceService>(BtcPriceService)
    cacheManager = moduleRef.get(CACHE_MANAGER)
  })

  afterEach(() => {
    jest.clearAllMocks()
    cacheManager.reset()
  })

  it('should update BTC price and cache it', async () => {
    const spy = jest.spyOn(cacheManager, 'set')

    mockConfigService.priceTtl = jest.fn().mockReturnValue(10000)
    mockConfigService.serviceCommission = jest.fn().mockReturnValue('0')

    const mockPrice = { askPrice: '50000', bidPrice: '49500' }
    mockPriceProvider.getPrice.mockResolvedValue(mockPrice)

    await priceService.updateBtcPrice()

    expect(mockPriceProvider.getPrice).toHaveBeenCalledWith({ base: 'BTC', counter: 'USDT' })
    expect(spy).toHaveBeenCalledWith(
      BtcPriceService.BTC_PRICE_KEY,
      {
        askPrice: '50000.00',
        bidPrice: '49500.00',
        midPrice: '49750.00',
      },
      10000,
    )
  })

  it('should retrieve BTC price from cache or calculate if not available', async () => {
    mockConfigService.priceTtl = jest.fn().mockReturnValue(10000)
    mockConfigService.serviceCommission = jest.fn().mockReturnValue('1')

    mockPriceProvider.getPrice.mockResolvedValue({ askPrice: '50000', bidPrice: '49500' })

    const price = await priceService.getBtcPrice()

    expect(mockPriceProvider.getPrice).toHaveBeenCalledWith({ base: 'BTC', counter: 'USDT' })

    expect(price).toEqual({
      askPrice: '50500.00',
      bidPrice: '49995.00',
      midPrice: '50247.50',
    })
  })

  it('should retrieve BTC price from cache', async () => {
    mockConfigService.priceTtl = jest.fn().mockReturnValue(10000)
    mockConfigService.serviceCommission = jest.fn().mockReturnValue('1')

    mockPriceProvider.getPrice.mockResolvedValue({ askPrice: '50000', bidPrice: '49500' })

    await priceService.getBtcPrice()

    const price = await priceService.getBtcPrice()

    expect(mockPriceProvider.getPrice).toHaveBeenCalledTimes(1)

    expect(price).toEqual({
      askPrice: '50500.00',
      bidPrice: '49995.00',
      midPrice: '50247.50',
    })
  })

  describe('should apply service commission', () => {
    it.each([
      ['67342.40', '67342.39', '1', '68015.82', '68015.81', '68015.82'],

      ['0.01', '0.009', '1', '0.01', '0.01', '0.01'],
      ['100000000', '99999999', '1', '101000000.00', '100999998.99', '100999999.50'],
      ['100.50', '99.50', '0', '100.50', '99.50', '100.00'],
      ['100', '95', '100', '200.00', '190.00', '195.00'],
    ])(
      'commission calculation for askPrice: %s, bidPrice: %s, serviceCommission: %s, expectedAskPrice: %s, expectedBidPrice: %s, expectedMidPrice: %s',
      async (askPrice, bidPrice, serviceCommission, expectedAskPrice, expectedBidPrice, expectedMidPrice) => {
        mockConfigService.priceTtl = jest.fn().mockReturnValue(10000)
        mockConfigService.serviceCommission = jest.fn().mockReturnValue(serviceCommission)

        mockPriceProvider.getPrice.mockResolvedValue({ askPrice, bidPrice })

        const result = await priceService.getBtcPrice()

        expect(result.askPrice).toEqual(expectedAskPrice)
        expect(result.bidPrice).toEqual(expectedBidPrice)
        expect(result.midPrice).toEqual(expectedMidPrice)
      },
    )
  })
})
