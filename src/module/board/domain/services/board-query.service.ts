import { BoardDetailReadModel } from '../models/board/board-detail.read-model';
import { BoardAdminListItemReadModel } from '../models/board/board-admin-list-item.read-model';
import { BoardListItemReadModel } from '../models/board/board-list-item.read-model';

export interface FindBoardListParams {
  skip: number;
  limit: number;
}

/**
 * 게시판 읽기 전용 조회 (CQRS 읽기 측, ReadModel 반환).
 * 관리용 목록(4.4)·회원용 목록(4.5)·상세(4.1/4.2 응답)를 제공한다.
 */
export abstract class BoardQueryService {
  /** 관리용 목록 (생성일 내림차순, managerId/createdAt 포함) */
  abstract findAdminList(
    params: FindBoardListParams,
  ): Promise<BoardAdminListItemReadModel[]>;

  /** 회원용 목록 (생성일 내림차순, 관리 필드 제외) */
  abstract findList(
    params: FindBoardListParams,
  ): Promise<BoardListItemReadModel[]>;

  /** 전체 게시판 수 (목록 페이지네이션용) */
  abstract countAll(): Promise<number>;

  /** 상세 조회 */
  abstract findDetailById(
    id: string,
  ): Promise<BoardDetailReadModel | undefined>;
}
