import { HttpService } from '@nestjs/axios';
import { HttpRequestService } from './http-request.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UnprocessableEntityException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import {
  Method,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from 'axios';

describe('HttpRequestService', () => {
  let service: HttpRequestService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpRequestService,
        {
          provide: HttpService,
          useValue: {
            request: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HttpRequestService>(HttpRequestService);
    httpService = module.get<HttpService>(HttpService);
  });

  describe('makeRequest', () => {
    const mockRequestData = {
      method: 'GET' as Method, // ✅ Explicitly cast method
      url: 'https://api.example.com/data',
      data: null,
      headers: { Authorization: 'Bearer token' },
    };

    it('should make a successful request and return data', async () => {
      const mockConfig: InternalAxiosRequestConfig<any> = {
        headers: new AxiosHeaders(),
        method: 'GET',
        url: 'https://api.example.com/data',
      };

      const mockResponse: AxiosResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders(),
        config: mockConfig,
      };

      jest.spyOn(httpService, 'request').mockReturnValue(of(mockResponse));

      const result = await service.makeRequest(mockRequestData);
      expect(result).toEqual({ success: true });
    });

    it('should throw UnprocessableEntityException if request fails', async () => {
      const mockConfig: InternalAxiosRequestConfig<any> = {
        headers: new AxiosHeaders(),
        method: 'GET',
        url: 'https://api.example.com/data',
      };

      const mockError = {
        response: {
          data: { error: 'Request failed' },
          status: 500,
          statusText: 'Internal Server Error',
          headers: new AxiosHeaders(),
          config: mockConfig,
        },
      };

      jest
        .spyOn(httpService, 'request')
        .mockReturnValue(throwError(() => mockError));

      await expect(service.makeRequest(mockRequestData)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });
});
