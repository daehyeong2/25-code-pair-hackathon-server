import { Injectable } from '@nestjs/common';
import {
  FindAllRoomsRequest,
  FindAllRoomsResponse,
} from './dto/findAllRooms.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Room } from './types/room';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EmergencyService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async findAllRooms(req: FindAllRoomsRequest): Promise<FindAllRoomsResponse> {
    const res = await firstValueFrom(
      this.httpService.get(this.configService.get('LIVE_EMERGENCY_API_URL')!, {
        params: {
          serviceKey: this.configService.get('API_SERVICE_KEY'),
          STAGE1: req.stage1,
          STAGE2: req.stage2,
          pageNo: req.pageNumber,
          numOfRows: 10,
        },
      }),
    );
    if (res.status !== 200 || !res.data.response) {
      throw new Error('Failed to fetch emergency rooms');
    }
    let items = res.data.response.body.items.item;
    if (items instanceof Array === false) items = [items]; // Ensure items is always an array
    const rooms: Room[] = items.map((item: any) => {
      item.hvidate = item.hvidate.toString();
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
    });
    return {
      rooms,
    };
  }
}
