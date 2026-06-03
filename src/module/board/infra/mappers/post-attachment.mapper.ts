import {
  Prisma,
  PostAttachment as PostAttachmentPrisma,
} from '@prisma/generated/client';
import { PostAttachment } from '../../domain/models/post';

/** PostAttachment(하위 엔티티) 영속성 ↔ 도메인 매핑 */
export class PostAttachmentMapper {
  static toDomain(raw: PostAttachmentPrisma): PostAttachment {
    return PostAttachment.unsafeCreate(
      {
        storageKey: raw.storageKey,
        url: raw.url,
        originalName: raw.originalName,
        mimeType: raw.mimeType,
        fileSize: raw.fileSize !== null ? raw.fileSize : undefined,
        sortOrder: raw.sortOrder,
      },
      raw.id,
    );
  }

  /** Post upsert의 nested create에 사용 */
  static toPersistence(
    attachment: PostAttachment,
  ): Prisma.PostAttachmentCreateWithoutPostInput {
    return {
      id: attachment.id.toString(),
      storageKey: attachment.storageKey,
      url: attachment.url,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      fileSize: attachment.fileSize !== undefined ? attachment.fileSize : null,
      sortOrder: attachment.sortOrder,
    };
  }
}
