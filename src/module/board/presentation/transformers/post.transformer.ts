import { PostListResult } from '../../application/dtos';
import { PostDetailReadModel } from '../../domain/models/post/post-detail.read-model';
import { PostListItemResponseDto, PostListResponseDto } from '../dtos';
import {
  PostAttachmentResponseDto,
  PostDetailResponseDto,
} from '../dtos/response/post-detail.response.dto';

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

  static toDetailResponse(
    readModel: PostDetailReadModel,
  ): PostDetailResponseDto {
    const attachments: PostAttachmentResponseDto[] = readModel.attachments.map(
      (a) => ({
        id: a.id,
        url: a.url,
        originalName: a.originalName,
        mimeType: a.mimeType,
        fileSize: a.fileSize !== undefined ? a.fileSize : null,
        sortOrder: a.sortOrder,
      }),
    );

    return {
      id: readModel.id,
      boardId: readModel.boardId,
      title: readModel.title,
      content: readModel.content,
      authorId: readModel.authorId,
      createdAt: readModel.createdAt,
      attachments,
    };
  }
}
