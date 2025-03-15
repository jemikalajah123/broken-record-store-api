import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderService } from './services';
import { OrderController } from './controllers/order.controller';
import { OrderSchema } from './schemas';
import { RecordModule } from '../record';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    RecordModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
