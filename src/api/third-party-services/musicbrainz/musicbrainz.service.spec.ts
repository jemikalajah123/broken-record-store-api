import { Test, TestingModule } from '@nestjs/testing';
import { MusicBrainzService } from './musicbrainz.service';
import { HttpRequestService } from '../../../shared/http-request';
import { parseStringPromise } from 'xml2js';

jest.mock('xml2js', () => ({
  parseStringPromise: jest.fn(),
}));

describe('MusicBrainzService', () => {
  let service: MusicBrainzService;
  let httpRequestService: HttpRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MusicBrainzService,
        {
          provide: HttpRequestService,
          useValue: {
            makeRequest: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MusicBrainzService>(MusicBrainzService);
    httpRequestService = module.get<HttpRequestService>(HttpRequestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchTracklist', () => {
    it('should return a list of track titles on success', async () => {
      const mockXmlResponse = `<metadata>
        <release>
          <medium-list>
            <medium>
              <track-list>
                <track>
                  <recording>
                    <title>Song 1</title>
                  </recording>
                </track>
                <track>
                  <recording>
                    <title>Song 2</title>
                  </recording>
                </track>
              </track-list>
            </medium>
          </medium-list>
        </release>
      </metadata>`;

      (httpRequestService.makeRequest as jest.Mock).mockResolvedValue(
        mockXmlResponse,
      );
      (parseStringPromise as jest.Mock).mockResolvedValue({
        metadata: {
          release: [
            {
              'medium-list': [
                {
                  medium: [
                    {
                      'track-list': [
                        {
                          track: [
                            { recording: [{ title: ['Song 1'] }] },
                            { recording: [{ title: ['Song 2'] }] },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      });

      const result = await service.fetchTracklist('some-mbid');
      expect(result).toEqual(['Song 1', 'Song 2']);
      expect(httpRequestService.makeRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://musicbrainz.org/ws/2/release/some-mbid?inc=recordings&fmt=xml',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should return an empty array if an error occurs', async () => {
      (httpRequestService.makeRequest as jest.Mock).mockRejectedValue(
        new Error('Network error'),
      );
      const loggerSpy = jest.spyOn(service['logger'], 'error');

      const result = await service.fetchTracklist('invalid-mbid');
      expect(result).toEqual([]);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Error fetching tracklist for MBID: invalid-mbid',
        expect.any(Error),
      );
    });
  });
});
