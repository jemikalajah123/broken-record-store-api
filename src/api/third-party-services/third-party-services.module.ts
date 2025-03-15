import { Module } from '@nestjs/common';
import { MusicBrainzService } from './musicbrainz';
import { HttpRequestModule } from '../../shared/http-request';

@Module({
  imports: [HttpRequestModule],
  providers: [MusicBrainzService],
  exports: [MusicBrainzService],
})
export class ThirdPartyServicesModule {}
