import { AggregateRoot, BoundedString, UniqueEntityId } from '@lib/domain';
import { Level } from './level';

export interface BoardProps {
  id?: string;
  name: BoundedString;
  readLevel: Level;
  writeLevel: Level;
  commentLevel: Level;
  managerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 게시판 애그리거트.
 * 레벨 문턱 3종 + 단일 관리자(managerId). 행위 메서드는 UseCase 시점에 추가(YAGNI).
 */
export class Board extends AggregateRoot<BoardProps> {
  private constructor(props: BoardProps) {
    super(props, new UniqueEntityId(props.id));
  }

  get name(): BoundedString {
    return this.props.name;
  }

  get readLevel(): Level {
    return this.props.readLevel;
  }

  get writeLevel(): Level {
    return this.props.writeLevel;
  }

  get commentLevel(): Level {
    return this.props.commentLevel;
  }

  get managerId(): string | undefined {
    return this.props.managerId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /** 새로운 게시판을 생성합니다. */
  static create(props: {
    name: BoundedString;
    readLevel: Level;
    writeLevel: Level;
    commentLevel: Level;
    managerId?: string;
  }): Board {
    const now = new Date();
    return new Board({
      name: props.name,
      readLevel: props.readLevel,
      writeLevel: props.writeLevel,
      commentLevel: props.commentLevel,
      managerId: props.managerId,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** DB에서 복원합니다 (Mapper 전용, 검증 없음). */
  static unsafeCreate(props: BoardProps): Board {
    return new Board(props);
  }
}
