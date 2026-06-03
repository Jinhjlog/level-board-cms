import { ApiProperty } from '@nestjs/swagger';

/** 글 첨부 파일 (file-upload 메타 스냅샷) */
export class PostAttachmentResponseDto {
  @ApiProperty({
    description: '첨부 ID (ULID)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  id: string;

  @ApiProperty({
    description: '서빙 URL',
    example: 'http://localhost:3000/uploads/2026/01/abc.png',
  })
  url: string;

  @ApiProperty({ description: '원본 파일명', example: 'screenshot.png' })
  originalName: string;

  @ApiProperty({ description: 'MIME 타입', example: 'image/png' })
  mimeType: string;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: '파일 크기 (bytes, 없으면 null)',
    example: 1048576,
  })
  fileSize: number | null;

  @ApiProperty({ description: '정렬 순서', example: 0 })
  sortOrder: number;
}

/** 글 상세 (4.7 조회 / 4.8 생성 / 4.9 수정 응답 공용) */
export class PostDetailResponseDto {
  @ApiProperty({
    description: '글 ID (ULID)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  id: string;

  @ApiProperty({
    description: '소속 게시판 ID (ULID)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  boardId: string;

  @ApiProperty({ description: '제목', example: '첫 번째 글입니다' })
  title: string;

  @ApiProperty({ description: '내용', example: '본문 내용입니다.' })
  content: string;

  @ApiProperty({
    description: '작성자 회원 ID (ULID)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  authorId: string;

  @ApiProperty({ description: '작성일시', example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    description: '첨부 파일 목록',
    type: [PostAttachmentResponseDto],
  })
  attachments: PostAttachmentResponseDto[];
}
