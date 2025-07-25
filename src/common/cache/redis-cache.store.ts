// src/redis-cache.store.ts
import { Redis } from 'ioredis';
import { Milliseconds, Store } from 'cache-manager';

export class RedisCacheStore implements Store {
  readonly name = 'redis';

  constructor(private readonly client: Redis) {}

  async mset(args: [string, unknown][], ttl?: Milliseconds): Promise<void> {
    const pipeline = this.client.pipeline();
    for (const [key, value] of args) {
      const stringValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      if (ttl) {
        pipeline.set(key, stringValue, 'PX', ttl);
      } else {
        pipeline.set(key, stringValue);
      }
    }
    await pipeline.exec();
  }

  async mget(...args: string[]): Promise<unknown[]> {
    const values = await this.client.mget(...args);
    return values.map((value) => {
      if (value === null) return undefined;
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    });
  }

  async mdel(...args: string[]): Promise<void> {
    if (args.length > 0) {
      await this.client.del(...args);
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.client.get(key);
    if (value === null) return undefined;
    try {
      return JSON.parse(value) as T;
    } catch {
      // fallback for plain string values
      return value as unknown as T;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);
    if (ttl) {
      await this.client.set(key, stringValue, 'EX', ttl);
    } else {
      await this.client.set(key, stringValue);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async reset(): Promise<void> {
    await this.client.flushdb();
  }

  async keys(pattern = '*'): Promise<string[]> {
    return this.client.keys(pattern);
  }

  async ttl(key: string): Promise<number> {
    const ttl = await this.client.ttl(key);
    return ttl;
  }

  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }
}
