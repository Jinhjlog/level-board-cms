import { Injectable } from '@nestjs/common';
import { BoardQueryService } from '../../domain/services/board-query.service';
import { FindBoardListDto, BoardListResult } from '../dtos/find-board-list.dto';

/**
 * 회원용 게시판 목록 조회 UseCase (SPEC 4.5).
 * 전체 게시판을 생성일 내림차순으로 반환한다.
 * 접근 가능 여부(레벨 게이트)는 게시판 진입 시 별도 판정 — 목록은 레벨로 거르지 않는다.
 */
@Injectable()
export class FindBoardListUseCase {
  constructor(private readonly boardQueryService: BoardQueryService) {}

  async execute(dto: FindBoardListDto): Promise<BoardListResult> {
    const page = dto.page ?? 1;
    const skip = (page - 1) * dto.limit;

    // 목록과 전체 수를 병렬 조회
    const [items, totalCount] = await Promise.all([
      this.boardQueryService.findList({ skip, limit: dto.limit }),
      this.boardQueryService.countAll(),
    ]);

    const totalPages = Math.ceil(totalCount / dto.limit) || 1;

    return { items, totalCount, totalPages, currentPage: page };
  }
}
