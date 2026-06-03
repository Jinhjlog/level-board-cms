import { Injectable } from '@nestjs/common';
import { BoardRepository } from '../../domain/repositories';
import {
  PostQueryService,
  UserLevelLookupService,
} from '../../domain/services';
import {
  EntityNotFoundException,
  AuthorizationException,
} from '@shared/exception';
import { FindPostListDto, PostListResult } from '../dtos';

/**
 * 글 목록 조회 UseCase (SPEC 4.6).
 * 1. 게시판 존재 확인 — 없으면 404 BOARD_NOT_FOUND
 * 2. 읽기 레벨 게이트 — userId 레벨 < board.readLevel이면 403 INSUFFICIENT_LEVEL
 * 3. 글 목록 오프셋 페이지네이션 + 제목 keyword 필터
 */
@Injectable()
export class FindPostListUseCase {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly userLevelLookupService: UserLevelLookupService,
    private readonly postQueryService: PostQueryService,
  ) {}

  async execute(dto: FindPostListDto): Promise<PostListResult> {
    // 1. 게시판 존재 확인
    const board = await this.boardRepository.findById(dto.boardId);

    if (!board) {
      throw new EntityNotFoundException({
        entityName: 'Board',
        errorCode: 'BOARD_NOT_FOUND',
        id: dto.boardId,
      });
    }

    // 2. 회원 레벨 조회 및 읽기 레벨 게이트 판정
    const userLevel = await this.userLevelLookupService.getLevel(dto.userId);

    if (userLevel === undefined || userLevel < board.readLevel.value) {
      throw new AuthorizationException({
        message: '게시판을 읽기 위한 레벨이 부족합니다',
        errorCode: 'INSUFFICIENT_LEVEL',
      });
    }

    // 3. 글 목록 + 전체 수 병렬 조회
    const page = dto.page;
    const skip = (page - 1) * dto.limit;

    const [items, totalCount] = await Promise.all([
      this.postQueryService.findListByBoard({
        boardId: dto.boardId,
        skip,
        limit: dto.limit,
        keyword: dto.keyword,
      }),
      this.postQueryService.countByBoard({
        boardId: dto.boardId,
        keyword: dto.keyword,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / dto.limit) || 1;

    return { items, totalCount, totalPages, currentPage: page };
  }
}
