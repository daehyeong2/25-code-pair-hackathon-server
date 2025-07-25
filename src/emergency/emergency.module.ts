import { Module } from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { EmergencyController } from './emergency.controller';
import { HttpModule } from '@nestjs/axios';
import { GeoService } from 'src/geo/geo.service';
import { RedisCacheModule } from 'src/common/cache/redis-cache.module';

@Module({
  imports: [HttpModule, RedisCacheModule],
  controllers: [EmergencyController],
  providers: [EmergencyService, GeoService],
})
export class EmergencyModule {}
