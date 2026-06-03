import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, UserAuth } from '../../../user/presentation/decorators';
import {
  CreatePostRequestDto,
  GetBoardListRequestDto,
  GetPostListRequestDto,
} from '../dtos/request';
import {
  BoardListResponseDto,
  PostDetailResponseDto,
  PostListResponseDto,
} from '../dtos/response';
import { FindBoardListUseCase } from '../../application/usecases/find-board-list.usecase';
import { BoardTransformer } from '../transformers/board.transformer';
import { FindPostListUseCase } from '../../application/usecases';
import { PostTransformer } from '../transformers/post.transformer';

/**
 * 회원용 게시판/글 (게시판 목록·글 목록·글 작성) — SPEC 4.5/4.6/4.8.
 */
@ApiTags('게시판')
@UserAuth()
@Controller({ path: 'boards', version: '1' })
export class BoardController {
  constructor(
    private readonly findBoardListUseCase: FindBoardListUseCase,
    private readonly findPostListUseCase: FindPostListUseCase,
  ) {}

  @ApiOperation({
    summary: '게시판 목록 조회',
    description:
      '회원이 탐색할 수 있도록 전체 게시판을 생성일 내림차순으로 반환합니다. ' +
      '접근 가능 여부는 게시판 진입 시 레벨 게이트로 별도 판정합니다.<br><br>' +
      '**페이지네이션**: page(기본 1), limit(기본 20, 최대 100)<br>',
  })
  @ApiOkResponse({
    description: '게시판 목록 조회 성공',
    type: BoardListResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async getBoardList(
    @Query() dto: GetBoardListRequestDto,
  ): Promise<BoardListResponseDto> {
    const result = await this.findBoardListUseCase.execute({
      page: dto.page ?? 1,
      limit: dto.limit ?? 20,
    });
    return BoardTransformer.toListResponse(result);
  }

  @ApiOperation({
    summary: '글 목록 조회',
    description:
      '게시판의 글을 작성일 내림차순으로 조회합니다.<br><br>' +
      '`회원.level ≥ board.readLevel`을 만족해야 하며, 미달 시 403입니다.<br>' +
      '**필터(선택)**: keyword(제목 부분 일치)<br>' +
      '**페이지네이션**: page(기본 1), limit(기본 20, 최대 100)<br>',
  })
  @ApiParam({
    name: 'boardId',
    description: '게시판 ID (ULID)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  @ApiOkResponse({
    description: '글 목록 조회 성공',
    type: PostListResponseDto,
  })
  @ApiForbiddenResponse({
    description: '읽기 레벨 미달: _**INSUFFICIENT_LEVEL**_',
  })
  @ApiNotFoundResponse({
    description: '게시판을 찾을 수 없음: _**BOARD_NOT_FOUND**_',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':boardId/posts')
  async getPostList(
    @Param('boardId') boardId: string,
    @Query() dto: GetPostListRequestDto,
    @CurrentUser('userId') userId: string,
  ): Promise<PostListResponseDto> {
    const result = await this.findPostListUseCase.execute({
      boardId,
      userId,
      page: dto.page ?? 1,
      limit: dto.limit ?? 20,
      keyword: dto.keyword,
    });

    return PostTransformer.toListResponse(result);
  }

  @ApiOperation({
    summary: '글 작성',
    description:
      '게시판에 글을 작성합니다. `회원.level ≥ board.writeLevel`을 만족해야 합니다.<br><br>' +
      '`attachmentIds`가 있으면 file-upload의 CONFIRMED 파일을 글에 연결합니다.<br>',
  })
  @ApiParam({
    name: 'boardId',
    description: '게시판 ID (ULID)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  @ApiCreatedResponse({
    description: '글 작성 성공',
    type: PostDetailResponseDto,
  })
  @ApiForbiddenResponse({
    description: '글쓰기 레벨 미달: _**INSUFFICIENT_LEVEL**_',
  })
  @ApiNotFoundResponse({
    description: '게시판을 찾을 수 없음: _**BOARD_NOT_FOUND**_',
  })
  @ApiBadRequestResponse({
    description:
      '첨부 파일 오류 (file-upload 위임)<br>' +
      '- 파일을 찾을 수 없음: _**FILE_NOT_FOUND**_<br>' +
      '- CONFIRMED 상태가 아님: _**FILE_NOT_CONFIRMED**_<br>',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post(':boardId/posts')
  createPost(
    @Param('boardId') _boardId: string,
    @Body() _dto: CreatePostRequestDto,
    @CurrentUser('userId') _userId: string,
  ): PostDetailResponseDto {
    return MOCK_POST_DETAIL;
  }
}

const MOCK_POST_DETAIL: PostDetailResponseDto = {
  id: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  boardId: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  title: '첫 번째 글입니다',
  content: '본문 내용입니다.',
  authorId: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  attachments: [],
};
