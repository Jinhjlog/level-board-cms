import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserAuth, CurrentUser } from '../../../user/presentation/decorators';
import { DeleteCommentUseCase } from '../../application/usecases';

/**
 * 댓글 삭제 — SPEC 4.12.
 */
@ApiTags('댓글')
@UserAuth()
@Controller({ path: 'comments', version: '1' })
export class CommentController {
  constructor(private readonly deleteCommentUseCase: DeleteCommentUseCase) {}

  @ApiOperation({
    summary: '댓글 삭제',
    description:
      '작성자 본인 또는 글이 속한 게시판의 관리자(managerId)가 댓글을 삭제합니다.',
  })
  @ApiParam({
    name: 'commentId',
    description: '댓글 ID (ULID)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  @ApiNoContentResponse({ description: '댓글 삭제 성공' })
  @ApiForbiddenResponse({
    description: '삭제 권한 없음: _**FORBIDDEN_MODERATION**_',
  })
  @ApiNotFoundResponse({
    description: '댓글을 찾을 수 없음: _**COMMENT_NOT_FOUND**_',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':commentId')
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser('userId') userId: string,
  ): Promise<void> {
    await this.deleteCommentUseCase.execute({ commentId, userId });
  }
}
