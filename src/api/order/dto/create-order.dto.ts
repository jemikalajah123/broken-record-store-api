import { IsNotEmpty, IsNumber, IsMongoId, IsEnum } from 'class-validator';
import { OrderStatus } from '../schemas';

export class CreateOrderDto {
  @IsMongoId()
  @IsNotEmpty()
  recordId: string; // Reference to Record model

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsEnum(OrderStatus)
  status?: OrderStatus = OrderStatus.PENDING; // Default to pending
}
