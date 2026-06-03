import { ApiProperty } from '@nestjs/swagger';

/** 게시판 상세 (관리자 4.1 생성 / 4.2 수정 응답 공용) */
export class BoardDetailResponseDto {
  @ApiProperty({
    description: '게시판 ID (ULID)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  id: string;

  @ApiProperty({ description: '게시판 이름', example: '공지사항' })
  name: string;

  @ApiProperty({ description: '읽기 최소 레벨', example: 1 })
  readLevel: number;

  @ApiProperty({ description: '글쓰기 최소 레벨', example: 1 })
  writeLevel: number;

  @ApiProperty({ description: '댓글 최소 레벨', example: 1 })
  commentLevel: number;

  @ApiProperty({
    type: String,
    nullable: true,
    description: '게시판 관리자 회원 ID (ULID, 없으면 null)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  managerId: string | null;

  @ApiProperty({ description: '생성일시', example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시', example: '2026-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
