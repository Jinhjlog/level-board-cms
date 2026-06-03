import { ApiProperty } from '@nestjs/swagger';

/** 회원용 게시판 목록 항목 (4.5) — 관리 필드(managerId, createdAt) 제외 */
export class BoardListItemResponseDto {
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
}

export class BoardListResponseDto {
  @ApiProperty({
    description: '게시판 목록',
    type: [BoardListItemResponseDto],
  })
  items: BoardListItemResponseDto[];

  @ApiProperty({ description: '전체 게시판 수', example: 42 })
  totalCount: number;

  @ApiProperty({ description: '전체 페이지 수', example: 3 })
  totalPages: number;

  @ApiProperty({ description: '현재 페이지 번호', example: 1 })
  currentPage: number;
}
