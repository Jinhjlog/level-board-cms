import { AggregateRoot, BoundedString, UniqueEntityId } from '@lib/domain';
import { PostAttachment } from './post-attachment';

export interface PostProps {
  id?: string;
  boardId: string;
  authorId: string;
  title: BoundedString;
  content: BoundedString;
  attachments: PostAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 글 애그리거트. 첨부(PostAttachment)를 하위 엔티티로 소유.
 * 행위 메서드(수정 등)는 UseCase 시점에 추가(YAGNI).
 */
export class Post extends AggregateRoot<PostProps> {
  private constructor(props: PostProps) {
    super(props, new UniqueEntityId(props.id));
  }

  get boardId(): string {
    return this.props.boardId;
  }

  get authorId(): string {
    return this.props.authorId;
  }

  get title(): BoundedString {
    return this.props.title;
  }

  get content(): BoundedString {
    return this.props.content;
  }

  get attachments(): PostAttachment[] {
    return this.props.attachments;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /** 새로운 글을 생성합니다. */
  static create(props: {
    boardId: string;
    authorId: string;
    title: BoundedString;
    content: BoundedString;
    attachments?: PostAttachment[];
  }): Post {
    const now = new Date();
    return new Post({
      boardId: props.boardId,
      authorId: props.authorId,
      title: props.title,
      content: props.content,
      attachments: props.attachments ?? [],
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * 글 제목/내용을 수정합니다.
   * undefined인 필드는 변경하지 않습니다.
   */
  update(params: { title?: BoundedString; content?: BoundedString }): void {
    if (params.title !== undefined) this.props.title = params.title;
    if (params.content !== undefined) this.props.content = params.content;
    this.props.updatedAt = new Date();
  }

  /** DB에서 복원합니다 (Mapper 전용, 검증 없음). */
  static unsafeCreate(props: PostProps): Post {
    return new Post(props);
  }
}
