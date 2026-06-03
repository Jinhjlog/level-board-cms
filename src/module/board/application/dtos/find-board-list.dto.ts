import { BoardListItemReadModel } from '../../domain/models/board/board-list-item.read-model';

/** 게시판 목록 조회 입력 */
export interface FindBoardListDto {
  page: number;
  limit: number;
}

/** 게시판 목록 조회 결과 */
export interface BoardListResult {
  items: BoardListItemReadModel[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
