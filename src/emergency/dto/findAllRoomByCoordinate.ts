import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Room } from '../types/room';
import { ToBoolean } from 'src/common/decorators/ToBoolean';
import { Region } from '../types/region';

export class FindAllRoomsByCoordinateRequest {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  longitude: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  pageNumber: number;

  @IsBoolean()
  @ApiProperty()
  @ToBoolean()
  wideSearch: boolean;
}

export interface FindAllRoomsByCoordinateResponse {
  region: Region;
  rooms: Room[];
}
