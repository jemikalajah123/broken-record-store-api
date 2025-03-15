import { Injectable, Logger } from '@nestjs/common';
import { HttpRequestService } from '../../../shared/http-request';
import { parseStringPromise } from 'xml2js';

@Injectable()
export class MusicBrainzService {
  private logger = new Logger(MusicBrainzService.name);
  constructor(private readonly httpRequest: HttpRequestService) {}

  private getRequestHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  async fetchTracklist(mbid: string): Promise<string[]> {
    try {
      const url = `https://musicbrainz.org/ws/2/release/${mbid}?inc=recordings&fmt=xml`;
      const response = await this.httpRequest.makeRequest({
        method: 'GET',
        url,
        headers: this.getRequestHeaders(),
      });

      const parsedData = await parseStringPromise(response);
      return parsedData['metadata']['release'][0]['medium-list'][0][
        'medium'
      ][0]['track-list'][0]['track'].map(
        (track: any) => track['recording'][0]['title'][0],
      );
    } catch (error) {
      this.logger.error(`Error fetching tracklist for MBID: ${mbid}`, error);
      return [];
    }
  }
}
