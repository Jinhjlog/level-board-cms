import { PostListItemReadModel } from '../models/post/post-list-item.read-model';
import { PostDetailReadModel } from '../models/post/post-detail.read-model';

export interface FindPostListParams {
  boardId: string;
  skip: number;
  limit: number;
  keyword?: string;
}

export interface CountPostListParams {
  boardId: string;
  keyword?: string;
}

/**
 * 글 읽기 전용 조회 (CQRS 읽기 측).
 * 게시판별 글 목록(4.6)·상세(4.7, 첨부 포함)를 제공한다.
 */
export abstract class PostQueryService {
  /** 게시판별 글 목록 (작성일 내림차순, 제목 keyword 필터) */
  abstract findListByBoard(
    params: FindPostListParams,
  ): Promise<PostListItemReadModel[]>;

  /** 게시판별 글 수 (페이지네이션용) */
  abstract countByBoard(params: CountPostListParams): Promise<number>;

  /** 글 상세 (첨부 포함) */
  abstract findDetailById(id: string): Promise<PostDetailReadModel | undefined>;
}
