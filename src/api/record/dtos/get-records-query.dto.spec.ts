import { GetRecordsQueryDto } from './get-records-query.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('GetRecordsQueryDto', () => {
  it('should be valid with default values', async () => {
    const dto = new GetRecordsQueryDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should return a validation error for an invalid page value', async () => {
    const dto = new GetRecordsQueryDto();
    dto.page = -1;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('min');
  });

  it('should return a validation error if limit is less than 1', async () => {
    const dto = new GetRecordsQueryDto();
    dto.limit = 0; // Invalid limit

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('min');
  });

  it('should transform page and limit into numbers', async () => {
    const rawData = { page: '2', limit: '15' }; // Simulating query params (which are strings)

    const dto = plainToInstance(GetRecordsQueryDto, rawData); // ✅ Correctly transforms

    // Ensure validation still passes
    const errors = await validate(dto);
    expect(errors.length).toBe(0);

    // Check if page and limit are now numbers
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(15);
  });

  it('should accept valid optional string filters', async () => {
    const dto = new GetRecordsQueryDto();
    dto.q = 'test';
    dto.artist = 'artistName';
    dto.album = 'albumName';
    dto.format = 'CD';
    dto.category = 'Rock';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should return a validation error if q is not a string', async () => {
    const dto = new GetRecordsQueryDto();
    dto.q = 123 as any; // Invalid type

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should return a validation error if artist is not a string', async () => {
    const dto = new GetRecordsQueryDto();
    dto.artist = 456 as any; // Invalid type

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should return a validation error if format is not a string', async () => {
    const dto = new GetRecordsQueryDto();
    dto.format = {} as any; // Invalid type

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });
});
