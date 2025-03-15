import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { RecordController } from './controllers/record.controller';
import { RecordService } from './services/record.service';
import { ThirdPartyServicesModule } from '../third-party-services';
import { RecordSchema } from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Record', schema: RecordSchema }]),
    ThirdPartyServicesModule,
    CacheModule.register(),
  ],
  controllers: [RecordController],
  providers: [RecordService],
  exports: [RecordService],
})
export class RecordModule {}
