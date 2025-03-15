import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { ThirdPartyServicesModule } from './api/third-party-services';
import { OrderModule } from './api/order';
import { RecordModule } from './api/record';
import * as redisStore from 'cache-manager-redis-store';

jest.mock('@nestjs/mongoose', () => {
    return {
      MongooseModule: {
        forRoot: jest.fn().mockReturnValue({}),
        forFeature: jest.fn().mockReturnValue({}),
      },
      Prop: jest.fn(),  // Add this line
      Schema: jest.fn(),
      SchemaFactory: jest.fn(),
    };
 });

  
jest.mock('@nestjs/cache-manager', () => ({
    CacheModule: {
      register: jest.fn().mockReturnValue({}),
    },
}));
  

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should import MongooseModule', () => {
    expect(MongooseModule.forRoot).toHaveBeenCalledWith(expect.any(String));
  });

  it('should import CacheModule', () => {
    expect(CacheModule.register).toHaveBeenCalledWith({
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 120,
      isGlobal: true,
    });
  });

  it('should import ThirdPartyServicesModule', () => {
    expect(module.get(ThirdPartyServicesModule)).toBeDefined();
  });

  it('should import OrderModule', () => {
    expect(module.get(OrderModule)).toBeDefined();
  });

  it('should import RecordModule', () => {
    expect(module.get(RecordModule)).toBeDefined();
  });
});
