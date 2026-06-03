import { AggregateRoot, BoundedString, UniqueEntityId } from '@lib/domain';

export interface CommentProps {
  id?: string;
  postId: string;
  authorId: string;
  content: BoundedString;
  createdAt: Date;
}

/**
 * 댓글 애그리거트. 행위 메서드는 UseCase 시점에 추가(YAGNI).
 */
export class Comment extends AggregateRoot<CommentProps> {
  private constructor(props: CommentProps) {
    super(props, new UniqueEntityId(props.id));
  }

  get postId(): string {
    return this.props.postId;
  }

  get authorId(): string {
    return this.props.authorId;
  }

  get content(): BoundedString {
    return this.props.content;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  /** 새로운 댓글을 생성합니다. */
  static create(props: {
    postId: string;
    authorId: string;
    content: BoundedString;
  }): Comment {
    return new Comment({
      postId: props.postId,
      authorId: props.authorId,
      content: props.content,
      createdAt: new Date(),
    });
  }

  /** DB에서 복원합니다 (Mapper 전용, 검증 없음). */
  static unsafeCreate(props: CommentProps): Comment {
    return new Comment(props);
  }
}
