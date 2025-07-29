import { Controller, Get, Query } from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import {
  FindAllRoomsRequest,
  FindAllRoomsResponse,
} from './dto/findAllRooms.dto';
import {
  FindAllRoomsByCoordinateRequest,
  FindAllRoomsByCoordinateResponse,
} from './dto/findAllRoomByCoordinate';

@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Get()
  async findAllRooms(
    @Query() req: FindAllRoomsRequest,
  ): Promise<FindAllRoomsResponse> {
    return this.emergencyService.findAllRooms(req);
  }

  @Get('/by-coordinate')
  async findAllRoomsByCoordinate(
    @Query() req: FindAllRoomsByCoordinateRequest,
  ): Promise<FindAllRoomsByCoordinateResponse> {
    return this.emergencyService.findAllRoomsByCoordinate(req);
  }
}
