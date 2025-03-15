import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { IHttpRequest } from './types';

@Injectable()
export class HttpRequestService {
  protected logger = new Logger(HttpRequestService.name);

  constructor(private readonly httpService: HttpService) {}

  async makeRequest({ method, data, url, headers }: IHttpRequest) {
    try {
      const response = await firstValueFrom(
        this.httpService.request({
          url,
          method,
          data,
          headers,
        }),
      );
      this.logger.log({ url, status: response.status });

      return response.data;
    } catch (error) {
      this.logger.error(error.response.data);

      throw new UnprocessableEntityException(error);
    }
  }
}
