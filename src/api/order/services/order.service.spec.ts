import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../services';
import { getModelToken } from '@nestjs/mongoose';
import { Order } from '../schemas';
import { RecordService } from '../../record/services';
import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

const mockOrderQuery = {
  populate: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};

const mockOrderModel = {
  create: jest.fn(),
  find: jest.fn().mockReturnValue(mockOrderQuery),
  findById: jest.fn().mockReturnValue(mockOrderQuery),
};

const mockRecordService = {
  findOne: jest.fn(),
  updateStock: jest.fn(),
};

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
        { provide: RecordService, useValue: mockRecordService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should successfully create an order', async () => {
      const mockRecord = { _id: 'recordId123', qty: 10 };
      const createOrderDto = { recordId: 'recordId123', quantity: 2 };

      mockRecordService.findOne.mockResolvedValue(mockRecord);
      mockRecordService.updateStock.mockResolvedValue(true);
      mockOrderModel.create.mockResolvedValue({
        _id: 'orderId123',
        ...createOrderDto,
      });

      const result = await service.createOrder(createOrderDto);
      expect(result.status).toBe(true);
      expect(result.message).toBe('Order created successfully');
      expect(result.data).toHaveProperty('_id', 'orderId123');
      expect(mockRecordService.findOne).toHaveBeenCalledWith('recordId123');
      expect(mockRecordService.updateStock).toHaveBeenCalledWith(
        'recordId123',
        -2,
      );
      expect(mockOrderModel.create).toHaveBeenCalledWith(createOrderDto);
    });

    it('should throw InternalServerErrorException with default message if error has no message', async () => {
      const errorWithoutMessage = new Error();
      delete errorWithoutMessage.message; // Ensure error has no message

      mockRecordService.findOne.mockRejectedValue(errorWithoutMessage);

      await expect(
        service.createOrder({ recordId: 'recordId123', quantity: 2 }),
      ).rejects.toThrowError(
        new InternalServerErrorException('An unexpected error occurred'),
      );
    });

    it('should throw NotFoundException if record is not found', async () => {
      mockRecordService.findOne.mockResolvedValue(null);

      await expect(
        service.createOrder({ recordId: 'recordId123', quantity: 2 }),
      ).rejects.toThrowError(
        new NotFoundException('Record with ID recordId123 not found'),
      );
    });

    it('should throw BadRequestException if stock is insufficient', async () => {
      mockRecordService.findOne.mockResolvedValue({
        _id: 'recordId123',
        qty: 1,
      });

      await expect(
        service.createOrder({ recordId: 'recordId123', quantity: 2 }),
      ).rejects.toThrowError(
        new BadRequestException('Insufficient stock. Only 1 left.'),
      );
    });

    it('should throw InternalServerErrorException on failure', async () => {
      mockRecordService.findOne.mockRejectedValue(new Error('Database error'));

      await expect(
        service.createOrder({ recordId: 'recordId123', quantity: 2 }),
      ).rejects.toThrowError(
        new InternalServerErrorException('Database error'), // Fix: Align error message
      );
    });
  });

  describe('getAllOrders', () => {
    it('should return all orders', async () => {
      const mockOrders = [{ _id: 'order1' }, { _id: 'order2' }];
      mockOrderQuery.exec.mockResolvedValue(mockOrders);

      const result = await service.getAllOrders();
      expect(result.status).toBe(true);
      expect(result.data).toEqual(mockOrders);
      expect(mockOrderModel.find).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on failure', async () => {
      mockOrderQuery.exec.mockRejectedValue(new Error('Database error'));

      await expect(service.getAllOrders()).rejects.toThrowError(
        new InternalServerErrorException('Failed to fetch orders'),
      );
    });
  });

  describe('getOrderById', () => {
    it('should return an order by ID', async () => {
      const mockOrder = { _id: 'orderId123', record: { _id: 'recordId123' } };
      mockOrderQuery.exec.mockResolvedValue(mockOrder);

      const result = await service.getOrderById('orderId123');
      expect(result.status).toBe(true);
      expect(result.data).toEqual(mockOrder);
      expect(mockOrderModel.findById).toHaveBeenCalledWith('orderId123');
    });

    it('should throw NotFoundException if order is not found', async () => {
      mockOrderQuery.exec.mockResolvedValue(null);

      await expect(service.getOrderById('orderId123')).rejects.toThrowError(
        new NotFoundException('Order with ID orderId123 not found'),
      );
    });
  });
});
