import { Prisma, Comment as CommentPrisma } from '@prisma/generated/client';
import { BoundedString } from '@lib/domain';
import { Comment } from '../../domain/models/comment';

/** Comment 애그리거트 영속성 ↔ 도메인 매핑 */
export class CommentMapper {
  static toDomain(raw: CommentPrisma): Comment {
    return Comment.unsafeCreate({
      id: raw.id,
      postId: raw.postId,
      authorId: raw.authorId,
      content: BoundedString.unsafeCreate(raw.content),
      createdAt: raw.createdAt,
    });
  }

  static toPersistence(comment: Comment): Prisma.CommentUncheckedCreateInput {
    return {
      id: comment.id.toString(),
      postId: comment.postId,
      authorId: comment.authorId,
      content: comment.content.value,
      createdAt: comment.createdAt,
    };
  }
}
