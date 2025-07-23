import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Room } from '../types/room';

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
}

export interface FindAllRoomsResponse {
  rooms: Room[];
}
