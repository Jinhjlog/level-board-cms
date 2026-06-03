import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, UserAuth } from '../../../user/presentation/decorators';
import { CreateCommentRequestDto, UpdatePostRequestDto } from '../dtos/request';
import {
  CommentDetailResponseDto,
  PostDetailResponseDto,
} from '../dtos/response';
import {
  FindPostDetailUseCase,
  UpdatePostUseCase,
} from '../../application/usecases';
import { PostTransformer } from '../transformers/post.transformer';

/**
 * 글 상세/수정/삭제 + 댓글 작성 — SPEC 4.7/4.9/4.10/4.11.
 * ⚠️ D단계 Mock: 핸들러는 계약 형태의 더미를 반환. 권한·레벨 게이트는 G단계 UseCase에서.
 */
@ApiTags('게시글')
@UserAuth()
@Controller({ path: 'posts', version: '1' })
export class PostController {
  constructor(
    private readonly findPostDetailUseCase: FindPostDetailUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
  ) {}
  @ApiOperation({
    summary: '글 상세 조회',
    description:
      '글 상세를 조회합니다. 글이 속한 게시판의 `readLevel` 게이트를 통과해야 합니다.<br><br>' +
      '**응답**: id, boardId, title, content, authorId, createdAt, attachments<br>',
  })
  @ApiParam({
    name: 'postId',
    description: '글 ID (ULID)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  @ApiOkResponse({
    description: '글 상세 조회 성공',
    type: PostDetailResponseDto,
  })
  @ApiForbiddenResponse({
    description: '읽기 레벨 미달: _**INSUFFICIENT_LEVEL**_',
  })
  @ApiNotFoundResponse({
    description: '글을 찾을 수 없음: _**POST_NOT_FOUND**_',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':postId')
  async getPostDetail(
    @Param('postId') postId: string,
    @CurrentUser('userId') userId: string,
  ): Promise<PostDetailResponseDto> {
    const readModel = await this.findPostDetailUseCase.execute({
      postId,
      userId,
    });
    return PostTransformer.toDetailResponse(readModel);
  }

  @ApiOperation({
    summary: '글 수정',
    description:
      '작성자 본인만 글을 수정할 수 있습니다. 전달된 title/content만 수정합니다(첨부 변경 미포함).',
  })
  @ApiParam({
    name: 'postId',
    description: '글 ID (ULID)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  @ApiOkResponse({
    description: '글 수정 성공',
    type: PostDetailResponseDto,
  })
  @ApiForbiddenResponse({
    description: '작성자 본인이 아님: _**NOT_POST_OWNER**_',
  })
  @ApiNotFoundResponse({
    description: '글을 찾을 수 없음: _**POST_NOT_FOUND**_',
  })
  @HttpCode(HttpStatus.OK)
  @Patch(':postId')
  async updatePost(
    @Param('postId') postId: string,
    @Body() dto: UpdatePostRequestDto,
    @CurrentUser('userId') userId: string,
  ): Promise<PostDetailResponseDto> {
    const readModel = await this.updatePostUseCase.execute({
      postId,
      userId,
      title: dto.title,
      content: dto.content,
    });
    return PostTransformer.toDetailResponse(readModel);
  }

  @ApiOperation({
    summary: '글 삭제',
    description:
      '작성자 본인, 게시판 관리자(managerId), 또는 SUPER_ADMIN이 글을 삭제합니다. ' +
      '소속 댓글도 함께 삭제됩니다(cascade).',
  })
  @ApiParam({
    name: 'postId',
    description: '글 ID (ULID)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  @ApiNoContentResponse({ description: '글 삭제 성공' })
  @ApiForbiddenResponse({
    description: '삭제 권한 없음: _**FORBIDDEN_MODERATION**_',
  })
  @ApiNotFoundResponse({
    description: '글을 찾을 수 없음: _**POST_NOT_FOUND**_',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':postId')
  deletePost(@Param('postId') _postId: string): void {
    return;
  }

  @ApiOperation({
    summary: '댓글 작성',
    description:
      '글에 댓글을 작성합니다. 글이 속한 게시판의 `commentLevel` 게이트를 통과해야 합니다.',
  })
  @ApiParam({
    name: 'postId',
    description: '글 ID (ULID)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  @ApiCreatedResponse({
    description: '댓글 작성 성공',
    type: CommentDetailResponseDto,
  })
  @ApiForbiddenResponse({
    description: '댓글 레벨 미달: _**INSUFFICIENT_LEVEL**_',
  })
  @ApiNotFoundResponse({
    description: '글을 찾을 수 없음: _**POST_NOT_FOUND**_',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post(':postId/comments')
  createComment(
    @Param('postId') _postId: string,
    @Body() _dto: CreateCommentRequestDto,
    @CurrentUser('userId') _userId: string,
  ): CommentDetailResponseDto {
    return MOCK_COMMENT_DETAIL;
  }
}

// --- D단계 Mock 데이터 (createComment는 G단계 미구현으로 유지) ---
const MOCK_COMMENT_DETAIL: CommentDetailResponseDto = {
  id: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  postId: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  authorId: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  content: '좋은 글 감사합니다.',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};
