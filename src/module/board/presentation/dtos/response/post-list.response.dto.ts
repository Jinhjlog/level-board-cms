import { ApiProperty } from '@nestjs/swagger';

/** 글 목록 항목 (4.6) */
export class PostListItemResponseDto {
  @ApiProperty({
    description: '글 ID (ULID)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  id: string;

  @ApiProperty({ description: '제목', example: '첫 번째 글입니다' })
  title: string;

  @ApiProperty({
    description: '작성자 회원 ID (ULID)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  authorId: string;

  @ApiProperty({ description: '작성일시', example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;
}

export class PostListResponseDto {
  @ApiProperty({
    description: '글 목록',
    type: [PostListItemResponseDto],
  })
  items: PostListItemResponseDto[];

  @ApiProperty({ description: '전체 글 수', example: 128 })
  totalCount: number;

  @ApiProperty({ description: '전체 페이지 수', example: 7 })
  totalPages: number;

  @ApiProperty({ description: '현재 페이지 번호', example: 1 })
  currentPage: number;
}
