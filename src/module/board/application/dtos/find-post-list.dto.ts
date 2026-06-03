import { PostListItemReadModel } from '../../domain/models/post/post-list-item.read-model';

/** 글 목록 조회 입력 */
export interface FindPostListDto {
  boardId: string;
  userId: string;
  page: number;
  limit: number;
  keyword?: string;
}

/** 글 목록 조회 결과 */
export interface PostListResult {
  items: PostListItemReadModel[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
