import { validate } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';
import { OrderStatus } from '../schemas';

describe('CreateOrderDto', () => {
  it('should be valid with correct values', async () => {
    const dto = new CreateOrderDto();
    dto.recordId = '507f1f77bcf86cd799439011'; // Valid MongoID
    dto.quantity = 2;
    dto.status = OrderStatus.PENDING;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when recordId is missing', async () => {
    const dto = new CreateOrderDto();
    dto.quantity = 2;
    dto.status = OrderStatus.PENDING;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'recordId')).toBe(true);
  });

  it('should fail validation when recordId is not a valid MongoID', async () => {
    const dto = new CreateOrderDto();
    dto.recordId = 'invalid-id'; // Invalid MongoID
    dto.quantity = 2;
    dto.status = OrderStatus.PENDING;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'recordId')).toBe(true);
  });

  it('should fail validation when quantity is missing', async () => {
    const dto = new CreateOrderDto();
    dto.recordId = '507f1f77bcf86cd799439011';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'quantity')).toBe(true);
  });

  it('should fail validation when quantity is not a number', async () => {
    const dto = new CreateOrderDto();
    dto.recordId = '507f1f77bcf86cd799439011';
    dto.quantity = 'invalid' as any; // Invalid quantity

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'quantity')).toBe(true);
  });

  it('should fail validation when status is not in the enum', async () => {
    const dto = new CreateOrderDto();
    dto.recordId = '507f1f77bcf86cd799439011';
    dto.quantity = 2;
    dto.status = 'INVALID_STATUS' as any; // Invalid status

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'status')).toBe(true);
  });
});
