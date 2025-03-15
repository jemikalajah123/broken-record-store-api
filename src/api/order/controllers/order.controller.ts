import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IApiResponse } from '../../../shared/types';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  async createOrder(
    @Body() createOrderDTO: CreateOrderDto,
  ): Promise<IApiResponse> {
    return this.orderService.createOrder(createOrderDTO);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  async getAllOrders(): Promise<IApiResponse> {
    return this.orderService.getAllOrders();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  async getOrderById(@Param('id') id: string): Promise<IApiResponse> {
    return this.orderService.getOrderById(id);
  }
}
