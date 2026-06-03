import { ValueObject } from '@lib/domain';
import { ValueObjectValidationException } from '@shared/exception';

interface LevelProps {
  value: number;
}

/**
 * 레벨 값 객체 (1~10 정수).
 * 게시판 읽기/쓰기/댓글 문턱과 회원 레벨에 사용하는 도메인 규칙.
 * 위반 시 errorCode `INVALID_BOARD_LEVEL` (SPEC 4.1/4.2).
 */
export class Level extends ValueObject<LevelProps> {
  private static readonly MIN = 1;
  private static readonly MAX = 10;

  private constructor(props: LevelProps) {
    super(props);
  }

  get value(): number {
    return this.props.value;
  }

  /**
   * 레벨을 생성합니다 (1~10 정수 검증).
   * @throws {ValueObjectValidationException} INVALID_BOARD_LEVEL
   */
  static create(value: number): Level {
    if (
      value === null ||
      value === undefined ||
      typeof value !== 'number' ||
      !Number.isInteger(value) ||
      value < this.MIN ||
      value > this.MAX
    ) {
      throw new ValueObjectValidationException({
        entityName: '레벨',
        reason: `${this.MIN}~${this.MAX} 범위의 정수여야 합니다`,
        errorCode: 'INVALID_BOARD_LEVEL',
      });
    }

    return new Level({ value });
  }

  /** DB에서 복원합니다 (Mapper 전용, 검증 없음). */
  static unsafeCreate(value: number): Level {
    return new Level({ value });
  }
}
