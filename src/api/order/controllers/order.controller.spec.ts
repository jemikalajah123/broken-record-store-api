import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from '.';
import { OrderService } from '../services';
import { CreateOrderDto } from '../dto/create-order.dto';
import { IApiResponse } from '../../../shared/types';
import { NotFoundException } from '@nestjs/common';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  const mockOrderService = {
    createOrder: jest.fn(),
    getAllOrders: jest.fn(),
    getOrderById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: OrderService, useValue: mockOrderService }],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create an order and return response', async () => {
      const createOrderDto: CreateOrderDto = {
        recordId: '123',
        quantity: 2,
      };
      const mockResponse: IApiResponse = {
        status: true,
        message: 'Order created successfully',
        data: { id: '1', recordId: '123', quantity: 2 },
      };
      mockOrderService.createOrder.mockResolvedValue(mockResponse);

      const result = await controller.createOrder(createOrderDto);
      expect(result).toEqual(mockResponse);
      expect(service.createOrder).toHaveBeenCalledWith(createOrderDto);
    });
  });

  describe('getAllOrders', () => {
    it('should return a list of orders', async () => {
      const mockOrders: IApiResponse = {
        status: true,
        message: 'Orders retrieved successfully',
        data: [
          { id: '1', recordId: '123', quantity: 2 },
          { id: '2', recordId: '456', quantity: 1 },
        ],
      };
      mockOrderService.getAllOrders.mockResolvedValue(mockOrders);

      const result = await controller.getAllOrders();
      expect(result).toEqual(mockOrders);
      expect(service.getAllOrders).toHaveBeenCalled();
    });
  });

  describe('getOrderById', () => {
    it('should return a specific order by ID', async () => {
      const mockOrder: IApiResponse = {
        status: true,
        message: 'Order retrieved successfully',
        data: { id: '1', recordId: '123', quantity: 2 },
      };
      mockOrderService.getOrderById.mockResolvedValue(mockOrder);

      const result = await controller.getOrderById('1');
      expect(result).toEqual(mockOrder);
      expect(service.getOrderById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if order is not found', async () => {
      mockOrderService.getOrderById.mockRejectedValue(
        new NotFoundException('Order not found'),
      );

      await expect(controller.getOrderById('999')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.getOrderById).toHaveBeenCalledWith('999');
    });
  });
});
