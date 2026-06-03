import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 게시판 목록 조회 페이지네이션 (관리용 4.4 / 회원용 4.5 공용).
 * SPEC상 limit 최대 100 — 기존 PublicPaginationRequestDto(max 50)와 달라 board 전용으로 둔다(context-notes §5.1).
 */
export class GetBoardListRequestDto {
  @ApiProperty({
    description: '페이지 번호 (최소 1)',
    example: 1,
    required: false,
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: '페이지당 조회 건수 (최소 1, 최대 100)',
    example: 20,
    required: false,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}
