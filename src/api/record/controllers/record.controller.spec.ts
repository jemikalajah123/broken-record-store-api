import { Test, TestingModule } from '@nestjs/testing';
import { RecordController } from './record.controller';
import { RecordService } from '../services/record.service';
import { CreateRecordRequestDTO } from '../dtos/create-record.request.dto';
import { UpdateRecordRequestDTO } from '../dtos/update-record.request.dto';
import { getModelToken } from '@nestjs/mongoose';

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
  });

  describe('update', () => {
    it('should update an existing record', async () => {
      const id = '123';
      const dto: UpdateRecordRequestDTO = { title: 'Updated Record' } as any;
      const response = { status: true, message: 'Record updated', data: dto };

      jest.spyOn(service, 'updateRecord').mockResolvedValue(response);
      expect(await controller.update(id, dto)).toEqual(response);
    });
  });

  describe('findAll', () => {
    it('should return a list of records', async () => {
      const response = { status: true, message: 'Records retrieved', data: [] };
      jest.spyOn(service, 'findAllRecords').mockResolvedValue(response);

      expect(await controller.findAll()).toEqual(response);
    });
  });
});
