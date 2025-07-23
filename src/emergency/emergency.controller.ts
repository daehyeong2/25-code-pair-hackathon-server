import { Controller, Get, Post, Body, Req, Query } from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import {
  FindAllRoomsRequest,
  FindAllRoomsResponse,
} from './dto/findAllRooms.dto';

@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Get()
  async findAllRooms(
    @Query() query: FindAllRoomsRequest,
  ): Promise<FindAllRoomsResponse> {
    return this.emergencyService.findAllRooms(query);
  }
}
