import { EntityClass, UniqueEntityId } from '@lib/domain';

export interface PostAttachmentProps {
  storageKey: string;
  url: string;
  originalName: string;
  mimeType: string;
  fileSize?: number;
  sortOrder: number;
}

/**
 * 글 첨부 (Post 애그리거트의 하위 엔티티).
 * file-upload OHS에서 받은 메타의 스냅샷. 독립 저장/조회하지 않고 Post를 통해 접근.
 */
export class PostAttachment extends EntityClass<PostAttachmentProps> {
  private constructor(props: PostAttachmentProps, id?: UniqueEntityId) {
    super(props, id);
  }

  get storageKey(): string {
    return this.props.storageKey;
  }

  get url(): string {
    return this.props.url;
  }

  get originalName(): string {
    return this.props.originalName;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get fileSize(): number | undefined {
    return this.props.fileSize;
  }

  get sortOrder(): number {
    return this.props.sortOrder;
  }

  /** 새로운 첨부를 생성합니다. */
  static create(props: {
    storageKey: string;
    url: string;
    originalName: string;
    mimeType: string;
    fileSize?: number;
    sortOrder?: number;
  }): PostAttachment {
    return new PostAttachment({
      storageKey: props.storageKey,
      url: props.url,
      originalName: props.originalName,
      mimeType: props.mimeType,
      fileSize: props.fileSize,
      sortOrder: props.sortOrder ?? 0,
    });
  }

  /** DB에서 복원합니다 (Mapper 전용, 검증 없음). */
  static unsafeCreate(props: PostAttachmentProps, id: string): PostAttachment {
    return new PostAttachment(props, new UniqueEntityId(id));
  }
}
