import {
  BadGatewayException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Request } from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

interface ServiceResponse {
  headers: AxiosResponse['headers'];
  data: AxiosResponse['data'];
  status: AxiosResponse['status'];
}

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getResponse(
    service: string,
    request: Request,
  ): Promise<ServiceResponse> {
    const { method, headers, body, originalUrl } = request;
    const recipientURL = process.env[service];
    console.log(recipientURL);
    if (!recipientURL) {
      throw new BadGatewayException('Unable to handle the request');
    }

    const shouldUseCache = method === 'GET' && originalUrl === '/products';

    if (shouldUseCache) {
      const cache = (await this.cacheManager.get(
        originalUrl,
      )) as ServiceResponse;

      if (cache) {
        return cache;
      }
    }

    try {
      const serviceRequest: AxiosRequestConfig = {
        method,
        url: `${recipientURL}${originalUrl}`,
      };
      const authorizationHeader = headers['authorization'];

      if (authorizationHeader) {
        serviceRequest.headers = {};
        serviceRequest.headers['authorization'] = authorizationHeader;
      }

      if (Object.keys(body).length) {
        serviceRequest.data = body;
      }

      const response = await axios.request(serviceRequest);

      const result = {
        headers: response.headers,
        data: response.data,
        status: response.status,
      };

      if (shouldUseCache) {
        await this.cacheManager.set(originalUrl, result);
      }

      return result;
    } catch (e) {
      if (e.response) {
        const result = {
          headers: e.response.headers,
          data: e.response.data,
          status: e.response.status,
        };

        return result;
      }

      throw new InternalServerErrorException(e.message);
    }
  }
}
