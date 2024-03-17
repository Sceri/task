import { NestFactory } from '@nestjs/core'
import { json } from 'body-parser'

import { AppModule } from './app/app.module'
import helmet from 'helmet'
import { AppConfigService } from './app/config/config.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(helmet())
  app.use(json({ limit: '5mb' }))
  app.enableCors()
  app.enableShutdownHooks()

  const configService = app.get(AppConfigService)
  const port = configService.getPort()

  await app.listen(port)
}

void bootstrap()
