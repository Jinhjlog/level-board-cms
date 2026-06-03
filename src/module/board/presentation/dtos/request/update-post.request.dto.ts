import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/** 글 수정 (4.9) — 전달된 필드만 수정. 첨부 변경은 미포함(SPEC 5장) */
export class UpdatePostRequestDto {
  @ApiProperty({
    type: String,
    required: false,
    description: '글 제목 (최대 255자)',
    example: '수정된 제목',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: '글 내용',
    example: '수정된 본문 내용입니다.',
  })
  @IsString()
  @IsOptional()
  content?: string;
}
