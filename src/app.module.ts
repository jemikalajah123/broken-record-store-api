import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfig } from './app.config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThirdPartyServicesModule } from './api/third-party-services';
import { OrderModule } from './api/order';
import { RecordModule } from './api/record';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    MongooseModule.forRoot(AppConfig.mongoUrl),
    RecordModule,
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 120, // Cache for 120 seconds
      isGlobal: true,
    }),
    ThirdPartyServicesModule,
    OrderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
