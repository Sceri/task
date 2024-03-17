import { Controller, Get } from '@nestjs/common'
import { BtcPriceService } from '../service/btc.price.service'

@Controller()
export class BtcPriceController {
  constructor(private readonly btcPriceService: BtcPriceService) {}

  @Get('/price/btc')
  public async getData() {
    return await this.btcPriceService.getBtcPrice()
  }
}
