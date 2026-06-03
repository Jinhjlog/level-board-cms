import {
  Prisma,
  Post as PostPrisma,
  PostAttachment as PostAttachmentPrisma,
} from '@prisma/generated/client';
import { BoundedString } from '@lib/domain';
import { Post } from '../../domain/models/post';
import { PostAttachmentMapper } from './post-attachment.mapper';

type PostWithAttachments = PostPrisma & {
  attachments?: PostAttachmentPrisma[];
};

/** Post 애그리거트 영속성 ↔ 도메인 매핑 (본체만; 첨부는 Repository에서 nested 처리) */
export class PostMapper {
  static toDomain(raw: PostWithAttachments): Post {
    return Post.unsafeCreate({
      id: raw.id,
      boardId: raw.boardId,
      authorId: raw.authorId,
      title: BoundedString.unsafeCreate(raw.title),
      content: BoundedString.unsafeCreate(raw.content),
      attachments: (raw.attachments ?? []).map((a) =>
        PostAttachmentMapper.toDomain(a),
      ),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(post: Post): Prisma.PostUncheckedCreateInput {
    return {
      id: post.id.toString(),
      boardId: post.boardId,
      authorId: post.authorId,
      title: post.title.value,
      content: post.content.value,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
}
