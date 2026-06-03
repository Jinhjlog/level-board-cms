import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

/** 글 목록 조회 (4.6) — 페이지네이션 + 제목 키워드 필터 */
export class GetPostListRequestDto {
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

  @ApiProperty({
    description: '제목 키워드 (부분 일치)',
    example: '공지',
    required: false,
  })
  @IsString()
  @IsOptional()
  keyword?: string;
}
