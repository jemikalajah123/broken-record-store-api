import { Test, TestingModule } from '@nestjs/testing';
import { ThirdPartyServicesModule } from './third-party-services.module';
import { MusicBrainzService } from './musicbrainz';
import { HttpRequestModule } from '../../shared/http-request';

describe('ThirdPartyServicesModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ThirdPartyServicesModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide MusicBrainzService', () => {
    const service = module.get<MusicBrainzService>(MusicBrainzService);
    expect(service).toBeDefined();
  });

  it('should import HttpRequestModule', async () => {
    const importedModules = module.get(HttpRequestModule);
    expect(importedModules).toBeDefined();
  });
});
