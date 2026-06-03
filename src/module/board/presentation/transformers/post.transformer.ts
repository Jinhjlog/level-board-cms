import { PostListResult } from '../../application/dtos';
import {
  PostListItemResponseDto,
  PostListResponseDto,
} from '../dtos/response/post-list.response.dto';

export class PostTransformer {
  static toListResponse(result: PostListResult): PostListResponseDto {
    const items: PostListItemResponseDto[] = result.items.map((item) => ({
      id: item.id,
      title: item.title,
      authorId: item.authorId,
      createdAt: item.createdAt,
    }));

    return {
      items,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }
}
