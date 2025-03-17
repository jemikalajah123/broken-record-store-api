import {
  Injectable,
  Logger,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cache } from 'cache-manager';
import { Record } from '../schemas';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateRecordRequestDTO, UpdateRecordRequestDTO } from '../dtos';
import { IApiResponse } from '../../../shared/types';
import { RecordFormat, RecordCategory } from '../schemas/record.enum';
import { MusicBrainzService } from '../../third-party-services/musicbrainz';

@Injectable()
export class RecordService {
  private readonly logger = new Logger(RecordService.name);

  constructor(
    @InjectModel('Record') private readonly recordModel: Model<Record>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly musicBrainzService: MusicBrainzService,
  ) {}

  async createRecord(request: CreateRecordRequestDTO): Promise<IApiResponse> {
    try {
      let tracklist: string[] = [];
      if (request.mbid) {
        tracklist = await this.musicBrainzService.fetchTracklist(request.mbid);
      }

      const record = await this.recordModel.create({
        ...request,
        tracklist,
      });

      return {
        status: true,
        message: 'Record created successfully',
        data: record,
      };
    } catch (error) {
      this.logger.error('Error creating record', error.stack);
      throw new InternalServerErrorException('Failed to create record');
    }
  }

  async updateRecord(
    id: string,
    updateDto: UpdateRecordRequestDTO,
  ): Promise<IApiResponse> {
    try {
      const record = await this.recordModel.findById(id);
      if (!record) {
        throw new NotFoundException('Record not found');
      }
  
      if (updateDto.mbid && updateDto.mbid !== record.mbid) {
        updateDto.tracklist = await this.musicBrainzService.fetchTracklist(
          updateDto.mbid,
        );
      }
  
      Object.assign(record, updateDto);
      await record.save();
  
      return {
        status: true,
        message: 'Record updated successfully',
        data: record,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update record: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update record');
    }
  }

  async findAllRecords(
    q?: string,
    artist?: string,
    album?: string,
    format?: RecordFormat,
    category?: RecordCategory,
    page: number = 1,
    limit: number = 20,
  ): Promise<IApiResponse> {
    const cacheKey = `records:${q || ''}:${artist || ''}:${album || ''}:${format || ''}:${category || ''}:${page}:${limit}`;
  
    try {
      let cachedRecords: Record[] | null = null;
      try {
        cachedRecords = await this.cacheManager.get<Record[]>(cacheKey);
      } catch (cacheError) {
        this.logger.warn(`Cache retrieval failed: ${cacheError.message}`);
      }

      if (cachedRecords) {
        return {
          status: true,
          message: 'Records fetched successfully (cached)',
          data: {
            records: cachedRecords,
            pagination: {
              page,
              limit,
              totalPages: Math.ceil(cachedRecords.length / limit),
              totalRecords: cachedRecords.length,
            },
          },
        };
      }
  
      const query: any = {};
      if (q) {
        query.$or = [
          { artist: new RegExp(q, 'i') },
          { album: new RegExp(q, 'i') },
          { category: new RegExp(q, 'i') },
        ];
      }
      if (artist) query.artist = new RegExp(artist, 'i');
      if (album) query.album = new RegExp(album, 'i');
      if (format) query.format = format;
      if (category) query.category = category;
  
      const totalRecords = await this.recordModel.countDocuments(query);
      const records = await this.recordModel
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
  
      await this.cacheManager.set(cacheKey, records, 60 * 1000);
  
      return {
        status: true,
        message: 'Records fetched successfully',
        data: {
          records,
          pagination: {
            page,
            limit,
            totalPages: Math.ceil(totalRecords / limit),
            totalRecords,
          },
        },
      };
    } catch (error) {
      this.logger.error(`Failed to fetch records: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch records');
    }
  }
  
  async updateStock(recordId: string, quantityChange: number): Promise<Record> {
    try {
      const record = await this.recordModel.findById(recordId);
      if (!record) {
        throw new NotFoundException(`Record with ID ${recordId} not found`);
      }
    
      if (record.qty + quantityChange < 0) {
        throw new BadRequestException('Not enough stock available');
      }
      record.qty += quantityChange;
      await record.save();
      return record;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to update stock: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update stock');
    }
    
  }
  
  async findOne(recordId: string): Promise<Record | null> {
    try {
      const record = await this.recordModel.findById(recordId);
      if (!record) {
        throw new NotFoundException(`Record with ID ${recordId} not found`);
      }
      return record;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch record: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch record');
    }
    
  }
}
