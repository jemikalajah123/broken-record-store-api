import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto } from '../dto';
import { Order } from '../schemas';
import { RecordService } from '../../record/services';
import { IApiResponse } from '../../../shared/types';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    private readonly recordService: RecordService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<IApiResponse> {
    try {
      const { recordId, quantity } = createOrderDto;

      // Find the record and check stock availability
      const record = await this.recordService.findOne(createOrderDto.recordId);
      if (!record) {
        throw new NotFoundException(`Record with ID ${recordId} not found`);
      }
      if (record.qty < quantity) {
        throw new BadRequestException(
          `Insufficient stock. Only ${record.qty} left.`,
        );
      }

      //Deduct stock quantity
      await this.recordService.updateStock(
        createOrderDto.recordId,
        -createOrderDto.quantity,
      );

      // Create the order
      const newOrder = await this.orderModel.create(createOrderDto);
      return {
        status: true,
        message: 'Order created successfully',
        data: newOrder,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error; // Re-throw known exceptions as they are
      }
      throw new InternalServerErrorException(
        error.message || 'An unexpected error occurred',
      );
    }
  }

  async getAllOrders(): Promise<IApiResponse> {
    try {
      const orders = await this.orderModel
        .find()
        .populate({
          path: 'record',
          strictPopulate: false, // Optional if you don't want strict validation
        })
        .exec();
      return {
        status: true,
        message: 'Orders retrieved successfully',
        data: orders,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch orders');
    }
  }

  async getOrderById(id: string): Promise<IApiResponse> {
    const order = await this.orderModel
      .findById(id)
      .populate({
        path: 'record',
        strictPopulate: false, // Optional if you don't want strict validation
      })
      .exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return {
      status: true,
      message: 'Order retrieved successfully',
      data: order,
    };
  }
}
