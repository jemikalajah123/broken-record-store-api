import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('OrderController (e2e)', () => {
  let app: INestApplication;
  let orderId: string;
  let recordId: string;
  let orderModel;
  let recordModel;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    orderModel = app.get('OrderModel');
    recordModel = app.get('RecordModel');
    await app.init();
  });

  it('should create a new order', async () => {
    const record = await recordModel.create({
      artist: 'New Beatles',
      album: 'Abbey Road',
      price: 25,
      qty: 10,
      format: 'Vinyl',
      category: 'Pop',
      mbid: '63823c15-6abc-473e-9fad-d0d0fa983b34x',
    });
    recordId = record._id;

    const createOrderDto = {
      recordId: recordId,
      quantity: 2,
    };

    const response = await request(app.getHttpServer())
      .post('/orders')
      .send(createOrderDto)
      .expect(201);

    orderId = response.body.data._id;
    expect(response.body).toHaveProperty('status', true);
    expect(response.body.data).toHaveProperty('recordId', recordId.toString());
  });

  it('should not create an order if stock is insufficient', async () => {
    const record = await recordModel.create({
      artist: 'fivey Beatles',
      album: 'Abbey Road',
      price: 25,
      qty: 10,
      format: 'Vinyl',
      category: 'Pop',
      mbid: '63823c15-6abc-473e-9fad-d0d0fa983b34x',
    });

    recordId = record._id;

    const createOrderDto = {
      recordId: record._id,
      quantity: 20, // More than available stock
    };

    const response = await request(app.getHttpServer())
      .post('/orders')
      .send(createOrderDto)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Bad Request');
    expect(response.body).toHaveProperty(
      'message',
      'Insufficient stock. Only 10 left.',
    );
  });

  it('should get all orders', async () => {
    const response = await request(app.getHttpServer())
      .get('/orders')
      .expect(200);

    expect(response.body).toHaveProperty('status', true);
    expect(Array.isArray(response.body.data)).toBeTruthy();
  });

  it('should get an order by ID', async () => {
    const record = await recordModel.create({
      artist: 'The meal',
      album: 'Abbey Road',
      price: 25,
      qty: 10,
      format: 'Vinyl',
      category: 'Pop',
    });

    recordId = record._id;

    const createOrderDto = {
      recordId: record._id,
      quantity: 2, // More than available stock
    };

    const res = await request(app.getHttpServer())
      .post('/orders')
      .send(createOrderDto)
      .expect(201);

    orderId = res.body.data._id;

    const response = await request(app.getHttpServer())
      .get(`/orders/${res.body.data._id}`)
      .expect(200);

    expect(response.body).toHaveProperty('status', true);
    expect(response.body.data).toHaveProperty('_id', res.body.data._id);
  });

  afterEach(async () => {
    if (orderId) {
      await orderModel.findByIdAndDelete(orderId);
    }
    if (recordId) {
      await recordModel.findByIdAndDelete(recordId);
    }
  });

  afterAll(async () => {
    await app.close();
  });
});
