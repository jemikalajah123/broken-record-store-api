import { Test, TestingModule } from '@nestjs/testing';
import { RecordService } from '.';
import { getModelToken } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Record } from '../schemas/record.schema';
import { CreateRecordRequestDTO, UpdateRecordRequestDTO } from '../dtos';
import { MusicBrainzService } from '../../third-party-services/musicbrainz/musicbrainz.service';

const mockRecord = {
  _id: '123',
  title: 'Test Record',
  artist: 'Test Artist',
  album: 'Test Album',
  format: 'CD',
  category: 'Rock',
  qty: 10,
  save: jest.fn().mockResolvedValue(true),
};

const mockQuery = {
  skip: jest.fn().mockReturnThis(), // Simulates .skip() returning the query object
  limit: jest.fn().mockReturnThis(), // Simulates .limit() returning the query object
  exec: jest.fn().mockResolvedValue([mockRecord]), // Simulates .exec() resolving the result
};

describe('RecordService', () => {
  let service: RecordService;
  let recordModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordService,
        {
          provide: getModelToken(Record.name),
          useValue: {
            create: jest.fn().mockResolvedValue(mockRecord),
            findById: jest.fn().mockResolvedValue(mockRecord),
            find: jest.fn().mockReturnValue(mockQuery),
            findOneAndUpdate: jest.fn().mockResolvedValue(mockRecord),
            countDocuments: jest.fn().mockResolvedValue(1),
            findByIdAndUpdate: jest.fn().mockImplementation((update) => ({
              ...mockRecord,
              qty: mockRecord.qty + update.$inc.qty, // Simulate stock update
            })),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: MusicBrainzService,
          useValue: {
            fetchTracklist: jest.fn().mockResolvedValue(['Track 1', 'Track 2']),
          },
        },
      ],
    }).compile();

    service = module.get<RecordService>(RecordService);
    recordModel = module.get(getModelToken(Record.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRecord', () => {
    it('should create a new record', async () => {
      const dto: CreateRecordRequestDTO = { title: 'New Record' } as any;
      const response = await service.createRecord(dto);
      expect(response.status).toBe(true);
      expect(response.message).toBe('Record created successfully');
      expect(response.data).toEqual(mockRecord);
    });
  });

  describe('updateRecord', () => {
    it('should update an existing record', async () => {
      const dto: UpdateRecordRequestDTO = { title: 'Updated Title' } as any;
      const response = await service.updateRecord('123', dto);
      expect(response.status).toBe(true);
      expect(response.message).toBe('Record updated successfully');
      expect(response.data).toEqual(mockRecord);
    });
  });

  describe('findAllRecords', () => {
    it('should return a list of records', async () => {
      const response = await service.findAllRecords();
      expect(response.status).toBe(true);
      expect(response.message).toBe('Records fetched successfully');
      expect(response.data).toEqual({
        pagination: expect.objectContaining({
          totalRecords: expect.any(Number),
          totalPages: expect.any(Number),
          page: expect.any(Number),
          limit: expect.any(Number),
        }),
        records: [mockRecord],
      });      
    });
  });

  describe('updateStock', () => {
    it('should increase stock quantity', async () => {
      const initialQty = mockRecord.qty;
      const additionalQty = 5;
      const updatedRecord = await service.updateStock('123', additionalQty);

      expect(updatedRecord.qty).toBe(initialQty + additionalQty);
    });
  });

  describe('findOne', () => {
    it('should find a record by ID', async () => {
      const response = await service.findOne('123');
      expect(response).toEqual(mockRecord);
    });
  });
});
