import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { RecordFormat, RecordCategory } from '../src/api/record/schemas';

describe('RecordController (e2e)', () => {
  let app: INestApplication;
  let recordId: string;
  let recordModel;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    recordModel = app.get('RecordModel');
    await app.init();
  });

  // Test to create a record without mbid
  it('should create a new record', async () => {
    const createRecordDto = {
      artist: 'The Beatles',
      album: 'Abbeyys Road',
      price: 25,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ROCK,
    };

    const response = await request(app.getHttpServer())
      .post('/records')
      .send(createRecordDto)
      .expect(201);

    recordId = response.body.data._id;
    expect(response.body.data).toHaveProperty('artist', 'The Beatles');
    expect(response.body.data).toHaveProperty('album', 'Abbeyys Road');
  });

  it('should create a new record and fetch it with filters', async () => {
    const createRecordDto = {
      artist: 'The Fake Band',
      album: 'Fake Album',
      price: 25,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ROCK,
    };

    const createResponse = await request(app.getHttpServer())
      .post('/records')
      .send(createRecordDto)
      .expect(201);

    recordId = createResponse.body.data._id;

    const response = await request(app.getHttpServer())
      .get('/records?artist=The Fake Band')
      .expect(200);
      expect(response.body.data.records.length).toBe(1);
    expect(response.body.data.records[0]).toHaveProperty('artist', 'The Fake Band');
  });

  // Test to create a record
  it('should create a new record', async () => {
    const createRecordDto = {
      artist: 'Them Beatles',
      album: 'Abbey Road',
      price: 25,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ROCK,
      mbid: '63823c15-6abc-473e-9fad-d0d0fa983b34',
    };

    const response = await request(app.getHttpServer())
      .post('/records')
      .send(createRecordDto)
      .expect(201);

    recordId = response.body.data._id;
    expect(response.body).toHaveProperty('status', true);
    expect(response.body.data).toHaveProperty('artist', 'Them Beatles');
    expect(response.body.data).toHaveProperty('album', 'Abbey Road');
  });

  // Test to update a record
  it('should update an existing record', async () => {

    const createRecordDto = {
      artist: 'Themy Beatles',
      album: 'Abbey Road',
      price: 25,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ROCK,
      mbid: '63823c15-6abc-473e-9fad-d0d0fa983b34',
    };

    const res = await request(app.getHttpServer())
      .post('/records')
      .send(createRecordDto)
      .expect(201);

    recordId = res.body.data._id;

    const updateRecordDto = {
      album: 'Abbey Rd - Remastered',
    };

    const response = await request(app.getHttpServer())
      .put(`/records/${recordId}`)
      .send(updateRecordDto)
      .expect(200);

    expect(response.body).toHaveProperty('status', true);
    expect(response.body.data).toHaveProperty(
      'album',
      'Abbey Rd - Remastered',
    );
  });

  // Test to get all records with filters
  it('should get records filtered by artist', async () => {

    const createRecordDto = {
      artist: 'Frank Beatles',
      album: 'Abbey Road',
      price: 25,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.POP
    };

    const res = await request(app.getHttpServer())
      .post('/records')
      .send(createRecordDto)
      .expect(201);

    recordId = res.body.data._id;
    
    const response = await request(app.getHttpServer())
      .get('/records?artist=Frank Beatles')
      .expect(200);

    expect(response.body).toHaveProperty('status', true);
    expect(response.body.data.records.length).toBeGreaterThan(0);
    expect(response.body.data.records[0]).toHaveProperty('artist', 'Frank Beatles');
  });

  // Test to get all records with multiple filters
  it('should get records filtered by category and format', async () => {
    const createRecordDto = {
      artist: 'john Beatles',
      album: 'Abbey Road',
      price: 25,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ROCK,
      mbid: '63823c15-6abc-473e-9fad-d0d0fa983b34',
    };

    const res = await request(app.getHttpServer())
      .post('/records')
      .send(createRecordDto)
      .expect(201);

    recordId = res.body.data._id;

    const response = await request(app.getHttpServer())
      .get(
        `/records?category=${RecordCategory.ROCK}&format=${RecordFormat.VINYL}`,
      )
      .expect(200);

    expect(response.body).toHaveProperty('status', true);
    expect(response.body.data.records.length).toBeGreaterThan(0);
    expect(response.body.data.records[0]).toHaveProperty(
      'category',
      RecordCategory.ROCK,
    );
    expect(response.body.data.records[0]).toHaveProperty('format', RecordFormat.VINYL);
  });

  afterEach(async () => {
    if (recordId) {
      await recordModel.findByIdAndDelete(recordId);
    }
  });

  afterAll(async () => {
    await app.close();
  });
});
