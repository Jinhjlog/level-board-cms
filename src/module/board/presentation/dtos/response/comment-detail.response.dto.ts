import { ApiProperty } from '@nestjs/swagger';

/** 댓글 상세 (4.11 생성 응답) */
export class CommentDetailResponseDto {
  @ApiProperty({
    description: '댓글 ID (ULID)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  id: string;

  @ApiProperty({
    description: '소속 글 ID (ULID)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  postId: string;

  @ApiProperty({
    description: '작성자 회원 ID (ULID)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  authorId: string;

  @ApiProperty({ description: '댓글 내용', example: '좋은 글 감사합니다.' })
  content: string;

  @ApiProperty({ description: '작성일시', example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;
}
