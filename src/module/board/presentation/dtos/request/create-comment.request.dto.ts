import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentRequestDto {
  @ApiProperty({
    type: String,
    description: '댓글 내용',
    example: '좋은 글 감사합니다.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
