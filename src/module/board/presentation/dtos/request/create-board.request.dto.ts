import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBoardRequestDto {
  @ApiProperty({
    type: String,
    description: '게시판 이름 (최대 100자)',
    example: '공지사항',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: Number,
    description: '읽기 최소 레벨 (1~10)',
    example: 1,
    minimum: 1,
    maximum: 10,
  })
  @IsInt()
  readLevel: number;

  @ApiProperty({
    type: Number,
    description: '글쓰기 최소 레벨 (1~10)',
    example: 1,
    minimum: 1,
    maximum: 10,
  })
  @IsInt()
  writeLevel: number;

  @ApiProperty({
    type: Number,
    description: '댓글 최소 레벨 (1~10)',
    example: 1,
    minimum: 1,
    maximum: 10,
  })
  @IsInt()
  commentLevel: number;

  @ApiProperty({
    type: String,
    required: false,
    description: '게시판 관리자 회원 ID (ULID, 생략 시 관리자 없음)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  @IsString()
  @IsOptional()
  managerId?: string;
}
