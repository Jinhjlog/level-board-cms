import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateBoardRequestDto {
  @ApiProperty({
    type: String,
    required: false,
    description: '게시판 이름 (최대 100자)',
    example: '자유게시판',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    type: Number,
    required: false,
    description: '읽기 최소 레벨 (1~10)',
    example: 2,
    minimum: 1,
    maximum: 10,
  })
  @IsInt()
  @IsOptional()
  readLevel?: number;

  @ApiProperty({
    type: Number,
    required: false,
    description: '글쓰기 최소 레벨 (1~10)',
    example: 2,
    minimum: 1,
    maximum: 10,
  })
  @IsInt()
  @IsOptional()
  writeLevel?: number;

  @ApiProperty({
    type: Number,
    required: false,
    description: '댓글 최소 레벨 (1~10)',
    example: 2,
    minimum: 1,
    maximum: 10,
  })
  @IsInt()
  @IsOptional()
  commentLevel?: number;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: '게시판 관리자 회원 ID (ULID). null 전송 시 관리자 해제',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @IsOptional()
  managerId?: string | null;
}
