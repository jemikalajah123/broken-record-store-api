import { Test, TestingModule } from '@nestjs/testing';
import { RecordService } from './record.service';
import { getModelToken } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Record } from '../schemas/record.schema';
import { CreateRecordRequestDTO, UpdateRecordRequestDTO } from '../dtos';
import { MusicBrainzService } from '../../third-party-services/musicbrainz/musicbrainz.service';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { RecordCategory, RecordFormat } from '../schemas';

const mockRecord = {
  _id: '123',
  artist: 'Test Artist',
  album: 'Test Album',
  format: 'CD',
  category: 'Rock',
  qty: 10,
  mbid: 'mock-mbid',
  save: jest.fn().mockResolvedValue(true),
};

const mockQuery = {
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([mockRecord]),
};

describe('RecordService', () => {
  let service: RecordService;
  let recordModel: any;
  let cacheManager: any;
  let musicBrainzService: any;

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
            countDocuments: jest.fn().mockResolvedValue(1),
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
    cacheManager = module.get(CACHE_MANAGER);
    musicBrainzService = module.get(MusicBrainzService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRecord', () => {
    it('should create a new record', async () => {
      const dto: CreateRecordRequestDTO = {
        title: 'New Record',
        mbid: 'mock-mbid',
      } as any;
      const response = await service.createRecord(dto);
      expect(response.status).toBe(true);
      expect(response.message).toBe('Record created successfully');
      expect(response.data).toEqual(mockRecord);
    });

    it('should throw an error if record creation fails', async () => {
      jest
        .spyOn(recordModel, 'create')
        .mockRejectedValue(new Error('DB Error'));

      const dto: CreateRecordRequestDTO = {
        artist: 'Test Artist',
        album: 'Test Album',
        price: 1000,
        qty: 10,
        format: RecordFormat.VINYL,
        category: RecordCategory.ROCK,
        mbid: 'mock-mbid',
      };

      await expect(service.createRecord(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw ConflictException for duplicate records', async () => {
      jest.spyOn(recordModel, 'create').mockRejectedValue({ code: 11000 });

      await expect(
        service.createRecord({
          artist: 'The Beatles',
          album: 'Abbey Road',
          format: RecordFormat.VINYL,
          price: 1000,
          qty: 10,
          category: RecordCategory.ROCK,
        }),
      ).rejects.toThrow(
        'A record with this artist, album, and format already exists.',
      );
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

    it('should throw an error if updateRecord fails', async () => {
      jest
        .spyOn(recordModel, 'findById')
        .mockRejectedValue(new Error('DB Error'));
      await expect(service.updateRecord('123', {} as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should decrease stock when a valid quantity is passed', async () => {
      const response = await service.updateStock('123', -5);
      expect(response.qty).toBe(5);
    });

    it('should throw an error if stock goes below zero', async () => {
      await expect(service.updateStock('123', -20)).rejects.toThrow(Error);
    });

    it('should throw NotFoundException if record does not exist', async () => {
      jest.spyOn(recordModel, 'findById').mockResolvedValue(null);

      await expect(service.updateStock('nonexistentId', 5)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if stock goes below zero', async () => {
      const mockRecord = { qty: 3, save: jest.fn() } as any;
      jest.spyOn(recordModel, 'findById').mockResolvedValue(mockRecord);

      await expect(service.updateStock('validId', -5)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle errors when updating stock', async () => {
      const mockRecord = {
        qty: 10,
        save: jest.fn().mockRejectedValue(new Error('DB error')),
      } as any;
      jest.spyOn(recordModel, 'findById').mockResolvedValue(mockRecord);

      await expect(service.updateStock('validId', 5)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should update tracklist when mbid is different', async () => {
      const record = { _id: '123', mbid: 'old-mbid', save: jest.fn() };
      jest.spyOn(recordModel, 'findById').mockResolvedValue(record);

      const updateDto = { mbid: 'new-mbid' };
      jest
        .spyOn(musicBrainzService, 'fetchTracklist')
        .mockResolvedValue(['Track 1', 'Track 2']);

      await service.updateRecord('123', updateDto);

      expect(musicBrainzService.fetchTracklist).toHaveBeenCalledWith(
        'new-mbid',
      );
      expect(record.save).toHaveBeenCalled();
    });

    it('should throw an error if record is not found', async () => {
      jest.spyOn(recordModel, 'findById').mockResolvedValue(null);
      await expect(service.updateRecord('123', {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllCacheRecords', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should fetch records from database if cache is empty', async () => {
      // Mock cacheManager to return null (simulate cache miss)
      cacheManager.get.mockResolvedValue(null);

      // Mock database queries
      jest.spyOn(recordModel, 'countDocuments').mockResolvedValue(1);
      jest.spyOn(recordModel, 'find').mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockRecord]),
      });

      const response = await service.findAllRecords();

      expect(response.data.records).toEqual([mockRecord]);
      expect(recordModel.find).toHaveBeenCalled();
      expect(recordModel.countDocuments).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        60 * 1000,
      );
    });

    it('should log a warning when cache retrieval fails', async () => {
      // Simulate cache failure
      jest
        .spyOn(cacheManager, 'get')
        .mockRejectedValue(new Error('Cache error'));
      jest.spyOn(service['logger'], 'warn').mockImplementation();

      // Mock database queries
      jest.spyOn(recordModel, 'countDocuments').mockResolvedValue(1);
      jest.spyOn(recordModel, 'find').mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockRecord]),
      });

      await service.findAllRecords();

      expect(service['logger'].warn).toHaveBeenCalledWith(
        'Cache retrieval failed: Cache error',
      );
      expect(recordModel.find).toHaveBeenCalled();
    });
  });

  describe('findAllRecords', () => {
    it('should return cached records if available', async () => {
      const mockResponse = {
        status: true,
        message: 'Records fetched successfully',
        data: {
          records: [mockRecord], // Ensure correct structure
          pagination: { page: 1, limit: 20, totalPages: 1, totalRecords: 1 },
        },
      };

      cacheManager.get = jest.fn().mockResolvedValue(mockResponse);

      const response = await service.findAllRecords();

      expect(cacheManager.get).toHaveBeenCalled();
      expect(response).toEqual(mockResponse); // Compare full response
    });

    it('should return cached records if available', async () => {
      const mockRecords = [{ id: '1', artist: 'Test' }];
      const mockResponse = {
        status: true,
        message: 'Records fetched successfully',
        data: {
          records: mockRecords,
          pagination: { page: 1, limit: 20, totalPages: 1, totalRecords: 1 },
        },
      };

      jest.spyOn(cacheManager, 'get').mockResolvedValue(mockResponse);

      const result = await service.findAllRecords();

      expect(result).toEqual(mockResponse);
    });

    it('should filter records by artist and album', async () => {
      cacheManager.get.mockResolvedValue(null); // Simulate cache miss

      const mockArtist = 'The Beatles';
      const mockAlbum = 'Abbey Road';

      // Mock database queries
      jest.spyOn(recordModel, 'countDocuments').mockResolvedValue(1);

      jest.spyOn(recordModel, 'find').mockImplementation((query) => {
        // Explicitly cast query as an object
        const typedQuery = query as { [key: string]: any };

        expect(typedQuery.artist).toEqual({
          $regex: `^${mockArtist}$`,
          $options: 'i',
        });
        expect(typedQuery.album).toEqual({
          $regex: `^${mockAlbum}$`,
          $options: 'i',
        });

        return {
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([mockRecord]),
        };
      });

      await service.findAllRecords(undefined, mockArtist, mockAlbum);

      expect(recordModel.find).toHaveBeenCalled();
    });

    it('should return empty array when no records are found', async () => {
      jest.spyOn(recordModel, 'find').mockReturnValueOnce({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const response = await service.findAllRecords();
      expect(response.data.records).toEqual([]);
    });

    it('should filter records based on the search query', async () => {
      const mockRecords = [
        {
          artist: 'Test Artist',
          album: 'Test Album',
          category: 'Test Category',
        },
      ];

      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(recordModel, 'find').mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRecords),
      } as any);
      jest
        .spyOn(recordModel, 'countDocuments')
        .mockResolvedValue(mockRecords.length);

      const result = await service.findAllRecords('Test');

      expect(result.status).toBe(true);
      expect(result.data.records).toEqual(mockRecords);
      expect(recordModel.find).toHaveBeenCalledWith({
        $text: {
          $search: 'Test',
        },
      });
    });

    it('should log error and throw InternalServerErrorException when fetching records fails', async () => {
      const dbError = new Error('Database error');

      // Mock cache retrieval (successful but returning null)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);

      // Mock database query failure
      jest.spyOn(recordModel, 'find').mockImplementation(() => {
        throw dbError;
      });

      // Spy on logger.error
      const loggerErrorSpy = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation();

      // Expect an InternalServerErrorException to be thrown
      await expect(service.findAllRecords()).rejects.toThrow(
        InternalServerErrorException,
      );

      // Ensure logger.error is called with the correct message
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to fetch records'),
        expect.any(String), // Ensures the stack trace is logged
      );
    });

    it('should apply query filters correctly', async () => {
      const mockRecords = [{ _id: 'record1', artist: 'Artist1' }];
      jest.spyOn(recordModel, 'find').mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRecords),
      } as any);
      jest.spyOn(recordModel, 'countDocuments').mockResolvedValue(1);

      const result = await service.findAllRecords(
        'searchQuery',
        'Artist1',
        'Album1',
        RecordFormat.VINYL,
        RecordCategory.JAZZ,
        1,
        10,
      );

      expect(result.status).toBe(true);
      expect(recordModel.find).toHaveBeenCalledWith({
        $text: {
          $search: 'searchQuery',
        },
        format: RecordFormat.VINYL,
        category: RecordCategory.JAZZ,
      });
    });
  });

  describe('findOne', () => {
    it('should return a record by ID', async () => {
      const response = await service.findOne('123');
      expect(response).toEqual(mockRecord);
    });

    it('should throw NotFoundException if record is not found', async () => {
      jest.spyOn(recordModel, 'findById').mockResolvedValue(null);

      await expect(service.findOne('invalidId')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle errors when finding a record', async () => {
      jest
        .spyOn(recordModel, 'findById')
        .mockRejectedValue(new Error('DB error'));

      await expect(service.findOne('validId')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw an error if record is not found', async () => {
      jest.spyOn(recordModel, 'findById').mockResolvedValue(null);
      await expect(service.findOne('456')).rejects.toThrow(Error);
    });
  });
});
