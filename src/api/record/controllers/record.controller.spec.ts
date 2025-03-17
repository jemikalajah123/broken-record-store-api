import { Test, TestingModule } from '@nestjs/testing';
import { RecordController } from '.';
import { RecordService } from '../services';
import { CreateRecordRequestDTO } from '../dtos';
import { UpdateRecordRequestDTO } from '../dtos';
import { GetRecordsQueryDto } from '../dtos';
import { getModelToken } from '@nestjs/mongoose';
import { RecordFormat, RecordCategory } from '../schemas';

describe('RecordController', () => {
  let controller: RecordController;
  let service: RecordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordController],
      providers: [
        {
          provide: RecordService,
          useValue: {
            createRecord: jest.fn(),
            updateRecord: jest.fn(),
            findAllRecords: jest.fn(),
          },
        },
        {
          provide: getModelToken('Record'),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<RecordController>(RecordController);
    service = module.get<RecordService>(RecordService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new record', async () => {
      const dto: CreateRecordRequestDTO = { title: 'Test Record' } as any;
      const response = { status: true, message: 'Record created', data: dto };

      jest.spyOn(service, 'createRecord').mockResolvedValue(response);
      expect(await controller.create(dto)).toEqual(response);
    });

    it('should throw an error if service fails', async () => {
      const dto: CreateRecordRequestDTO = { title: 'Test Record' } as any;
      jest.spyOn(service, 'createRecord').mockRejectedValue(new Error('Service Error'));

      await expect(controller.create(dto)).rejects.toThrow('Service Error');
    });
  });

  describe('update', () => {
    it('should update an existing record', async () => {
      const id = '123';
      const dto: UpdateRecordRequestDTO = { title: 'Updated Record' } as any;
      const response = { status: true, message: 'Record updated', data: dto };

      jest.spyOn(service, 'updateRecord').mockResolvedValue(response);
      expect(await controller.update(id, dto)).toEqual(response);
    });

    it('should throw an error if the record does not exist', async () => {
      const id = 'invalid-id';
      const dto: UpdateRecordRequestDTO = { title: 'Updated Record' } as any;
      jest.spyOn(service, 'updateRecord').mockRejectedValue(new Error('Cannot find record to update'));

      await expect(controller.update(id, dto)).rejects.toThrow('Cannot find record to update');
    });
  });

  describe('findAll', () => {
    it('should return a list of records', async () => {
      const response = { status: true, message: 'Records retrieved', data: [] };
      jest.spyOn(service, 'findAllRecords').mockResolvedValue(response);

      expect(await controller.findAll()).toEqual(response);
    });

    it('should apply filters correctly', async () => {
      const query: GetRecordsQueryDto = {
        q: 'Beatles',
        artist: 'The Beatles',
        album: 'Abbey Road',
        format: RecordFormat.VINYL,
        category: RecordCategory.ROCK,
        page: 1,
        limit: 10,
      } as any;

      const response = { status: true, message: 'Filtered records retrieved', data: [] };
      jest.spyOn(service, 'findAllRecords').mockResolvedValue(response);

      expect(await controller.findAll(query)).toEqual(response);
    });

    it('should handle invalid record format', async () => {
      const query: GetRecordsQueryDto = {
        format: 'INVALID_FORMAT' as any,
        page: 0,
        limit: 0
      };

      const response = { status: true, message: 'Records retrieved', data: [] };
      jest.spyOn(service, 'findAllRecords').mockResolvedValue(response);

      expect(await controller.findAll(query)).toEqual(response);
    });
  });
});
