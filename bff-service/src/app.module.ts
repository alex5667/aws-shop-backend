import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import { CUSTOM_CACHE_TTL } from './constants';

@Module({
  imports: [CacheModule.register({ ttl: CUSTOM_CACHE_TTL })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
