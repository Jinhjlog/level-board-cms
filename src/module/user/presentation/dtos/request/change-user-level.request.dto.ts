import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class ChangeUserLevelRequestDto {
  @ApiProperty({
    type: Number,
    description: '변경할 회원 레벨 (1~10 정수)',
    example: 3,
    minimum: 1,
    maximum: 10,
  })
  @IsInt()
  level: number;
}
