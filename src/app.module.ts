import { Module } from '@nestjs/common';
import { EmergencyModule } from './emergency/emergency.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { HttpModule } from '@nestjs/axios';
import { ApiResponseModule } from '@zabih-dev/nest-api-response';
import { GeoModule } from './geo/geo.module';
import { RedisCacheModule } from './common/cache/redis-cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
        PORT: Joi.number().required(),
        LIVE_EMERGENCY_API_URL: Joi.string().uri().required(),
        API_SERVICE_KEY: Joi.string().required(),
        KAKAO_REST_API_URL: Joi.string().uri().required(),
        KAKAO_REST_API_KEY: Joi.string().required(),
      }),
    }),
    ApiResponseModule,
    HttpModule,
    GeoModule,
    EmergencyModule,
  ],
})
export class AppModule {}
