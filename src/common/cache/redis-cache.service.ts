// redis-cache.service.ts
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisCacheStore } from './redis-cache.store';
import { Room } from 'src/emergency/types/room';

@Injectable()
export class RedisCacheService {
  private redis: Redis;
  private store: RedisCacheStore;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    });
    this.store = new RedisCacheStore(this.redis);
  }

  async setObject(key: string, value: any, ttl: number = 60) {
    await this.store.set(key, JSON.stringify(value), ttl);
  }

  async getObject<T>(key: string): Promise<T | null> {
    const raw = (await this.store.get<string>(key)) as T | null;
    return raw;
  }

  async del(key: string) {
    await this.store.del(key);
  }
}
