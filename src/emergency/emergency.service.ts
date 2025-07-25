import { Inject, Injectable } from '@nestjs/common';
import {
  FindAllRoomsRequest,
  FindAllRoomsResponse,
} from './dto/findAllRooms.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Room } from './types/room';
import { firstValueFrom } from 'rxjs';
import { GeoService } from 'src/geo/geo.service';
import { Region } from './types/region';
import { RedisCacheService } from 'src/common/cache/redis-cache.service';

@Injectable()
export class EmergencyService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly geoService: GeoService,
    private readonly redis: RedisCacheService,
  ) {}

  async findAllRooms(req: FindAllRoomsRequest): Promise<FindAllRoomsResponse> {
    let searchTarget: Region[] = [{ stage1: req.stage1, stage2: req.stage2 }];
    if (req.wideSearch) {
      const neighbors = this.geoService.getNeighbors({
        stage1: req.stage1,
        stage2: req.stage2,
      });
      searchTarget.push(...neighbors);
    }
    const rooms: Room[] = [];
    for (const target of searchTarget) {
      const roomsRes: Room[] = await this.fetchRooms(target, req.pageNumber);
      rooms.push(...roomsRes);
    }
    return {
      rooms,
    };
  }

  async fetchRooms(target: Region, pageNumber: number): Promise<Room[]> {
    const cacheKey = `emergency_rooms_data_${target.stage1}_${target.stage2}_${pageNumber}`;
    const cached = await this.redis.getObject<Room[]>(cacheKey);

    if (cached) {
      return cached; // 캐시된 값 반환
    }
    const res = await firstValueFrom(
      this.httpService.get(this.configService.get('LIVE_EMERGENCY_API_URL')!, {
        params: {
          serviceKey: this.configService.get('API_SERVICE_KEY'),
          STAGE1: target.stage1,
          STAGE2: target.stage2,
          pageNo: pageNumber,
          numOfRows: 10,
        },
      }),
    );
    if (res.status !== 200 || !res.data.response) {
      throw new Error('Failed to fetch emergency rooms');
    }
    let items = res.data.response.body.items.item;
    if (items === undefined || items.length === 0) {
      return [];
    }
    if (items instanceof Array === false) items = [items]; // Ensure items is always an array
    const roomsRes: Room[] = items.map((item: any) => {
      item.hvidate = item.hvidate.toString();
      return this.itemToRoom(item, target.stage1, target.stage2);
    });
    await this.redis.setObject(cacheKey, roomsRes);
    return roomsRes;
  }

  itemToRoom(item: any, provinces: string, municipalities: string): Room {
    return {
      hospitalId: item.hpid,
      institution_name: item.dutyName,
      available_emergency_room_count: item.hvec,
      available_surgery_room_count: item.hvoc,
      available_hospital_room_count: item.hvgc,
      isAvailableCT: item.hvctayn,
      isAvailableMRI: item.hvmriayn,
      isAvailableAmbulance: item.hvamyn,
      emergency_duty_tel: item.hv1,
      emergency_tel: item.dutyTel3,
      provinces,
      municipalities,
      updatedAt: new Date(
        item.hvidate.slice(0, 4) +
          '-' +
          item.hvidate.slice(4, 6) +
          '-' +
          item.hvidate.slice(6, 8) +
          'T' +
          item.hvidate.slice(8, 10) +
          ':' +
          item.hvidate.slice(10, 12) +
          ':' +
          item.hvidate.slice(12, 14) +
          'Z',
      ),
    };
  }
}
