import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Room } from '../types/room';
import { ToBoolean } from 'src/common/decorators/ToBoolean';

export class FindAllRoomsRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  stage1: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  stage2: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  pageNumber: number;

  @IsBoolean()
  @ApiProperty()
  @ToBoolean()
  wideSearch: boolean;
}

export interface FindAllRoomsResponse {
  rooms: Room[];
}
