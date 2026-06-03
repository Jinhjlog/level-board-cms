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
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RequireSuperAdmin } from '../../../admin/presentation/decorators';
import {
  CreateBoardRequestDto,
  GetBoardListRequestDto,
  UpdateBoardRequestDto,
} from '../dtos/request';
import {
  AdminBoardListResponseDto,
  BoardDetailResponseDto,
} from '../dtos/response';
import { FindAdminBoardListUseCase } from '../../application/usecases/find-admin-board-list.usecase';
import { AdminBoardTransformer } from '../transformers/admin-board.transformer';

/**
 * 게시판 관리 (최고관리자 전용) — SPEC 4.1~4.4.
 */
@ApiTags('관리자 - 게시판 관리')
@RequireSuperAdmin()
@Controller({ path: 'admin/boards', version: '1' })
export class AdminBoardController {
  constructor(
    private readonly findAdminBoardListUseCase: FindAdminBoardListUseCase,
  ) {}
  @ApiOperation({
    summary: '게시판 생성 [최고관리자]',
    description:
      '게시판을 생성하고 읽기/쓰기/댓글 레벨 문턱과 관리자를 설정합니다.<br><br>' +
      '**입력**<br>' +
      '- name(필수), readLevel/writeLevel/commentLevel(필수, 1~10), managerId(선택, ULID)<br>',
  })
  @ApiCreatedResponse({
    description: '게시판 생성 성공',
    type: BoardDetailResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청<br>' +
      '- 레벨이 1~10 범위를 벗어남: _**INVALID_BOARD_LEVEL**_<br>' +
      '- managerId가 존재하지 않는 회원: _**MANAGER_NOT_FOUND**_<br>',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  createBoard(@Body() _dto: CreateBoardRequestDto): BoardDetailResponseDto {
    return MOCK_BOARD_DETAIL;
  }

  @ApiOperation({
    summary: '게시판 수정 [최고관리자]',
    description:
      '전달된 필드만 수정합니다. managerId에 null을 보내면 관리자를 해제합니다.',
  })
  @ApiParam({
    name: 'boardId',
    description: '게시판 ID (ULID)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  @ApiOkResponse({
    description: '게시판 수정 성공',
    type: BoardDetailResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청<br>' +
      '- 레벨이 1~10 범위를 벗어남: _**INVALID_BOARD_LEVEL**_<br>' +
      '- managerId가 존재하지 않는 회원: _**MANAGER_NOT_FOUND**_<br>',
  })
  @ApiNotFoundResponse({
    description: '게시판을 찾을 수 없음: _**BOARD_NOT_FOUND**_',
  })
  @HttpCode(HttpStatus.OK)
  @Patch(':boardId')
  updateBoard(
    @Param('boardId') _boardId: string,
    @Body() _dto: UpdateBoardRequestDto,
  ): BoardDetailResponseDto {
    return MOCK_BOARD_DETAIL;
  }

  @ApiOperation({
    summary: '게시판 삭제 [최고관리자]',
    description:
      '게시판을 삭제합니다. 소속 글·댓글도 함께 삭제됩니다(cascade).',
  })
  @ApiParam({
    name: 'boardId',
    description: '게시판 ID (ULID)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  @ApiNoContentResponse({ description: '게시판 삭제 성공' })
  @ApiNotFoundResponse({
    description: '게시판을 찾을 수 없음: _**BOARD_NOT_FOUND**_',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':boardId')
  deleteBoard(@Param('boardId') _boardId: string): void {
    return;
  }

  @ApiOperation({
    summary: '게시판 목록 조회 [최고관리자]',
    description:
      '전체 게시판을 생성일 내림차순으로 조회합니다.<br><br>' +
      '**페이지네이션**: page(기본 1), limit(기본 20, 최대 100)<br>',
  })
  @ApiOkResponse({
    description: '게시판 목록 조회 성공',
    type: AdminBoardListResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async getBoardList(
    @Query() dto: GetBoardListRequestDto,
  ): Promise<AdminBoardListResponseDto> {
    const result = await this.findAdminBoardListUseCase.execute({
      page: dto.page ?? 1,
      limit: dto.limit ?? 20,
    });

    return AdminBoardTransformer.toListResponse(result);
  }
}

// --- D단계 Mock 데이터 (G단계에서 제거) ---
const MOCK_BOARD_DETAIL: BoardDetailResponseDto = {
  id: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  name: '공지사항',
  readLevel: 1,
  writeLevel: 1,
  commentLevel: 1,
  managerId: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};
