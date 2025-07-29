import { Module } from '@nestjs/common';
import { GeoService } from './geo.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [GeoService],
  exports: [GeoService],
})
export class GeoModule {}
