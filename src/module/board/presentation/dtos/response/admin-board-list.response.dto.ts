import { ApiProperty } from '@nestjs/swagger';

/** 관리용 게시판 목록 항목 (4.4) — 관리자 전용 필드(managerId, createdAt) 포함 */
export class AdminBoardListItemResponseDto {
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
}

export class AdminBoardListResponseDto {
  @ApiProperty({
    description: '게시판 목록',
    type: [AdminBoardListItemResponseDto],
  })
  items: AdminBoardListItemResponseDto[];

  @ApiProperty({ description: '전체 게시판 수', example: 42 })
  totalCount: number;

  @ApiProperty({ description: '전체 페이지 수', example: 3 })
  totalPages: number;

  @ApiProperty({ description: '현재 페이지 번호', example: 1 })
  currentPage: number;
}
