import { Comment } from '../../domain/models/comment';
import { CommentDetailResponseDto } from '../dtos/response/comment-detail.response.dto';

export class CommentTransformer {
  static toDetailResponse(comment: Comment): CommentDetailResponseDto {
    return {
      id: comment.id.toString(),
      postId: comment.postId,
      authorId: comment.authorId,
      content: comment.content.value,
      createdAt: comment.createdAt,
    };
  }
}
