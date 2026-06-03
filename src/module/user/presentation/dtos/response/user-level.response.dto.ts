import { ApiProperty } from '@nestjs/swagger';

/** 회원 레벨 조정 결과 (4.10) */
export class UserLevelResponseDto {
  @ApiProperty({
    description: '회원 ID (ULID)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  id: string;

  @ApiProperty({ description: '변경된 회원 레벨', example: 3 })
  level: number;
}
