import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostRequestDto {
  @ApiProperty({
    type: String,
    description: '글 제목 (최대 255자)',
    example: '첫 번째 글입니다',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    type: String,
    description: '글 내용',
    example: '본문 내용입니다.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    type: [String],
    required: false,
    description:
      '첨부 파일 ID 목록 (이미 업로드·CONFIRMED된 file-upload 파일의 ULID)',
    example: ['01HXK3G5N7MZQR8BVWEY6JKFP4'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachmentIds?: string[];
}
