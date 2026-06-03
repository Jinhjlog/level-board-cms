import { ValueObject } from '@lib/domain';
import { ValueObjectValidationException } from '@shared/exception';

interface LevelProps {
  value: number;
}

/**
 * 회원 레벨 값 객체 (1~10 정수). user BC 소유.
 * 게시판 접근 레벨 게이트(board)에서 LookupService로 읽어 사용한다.
 * 위반 시 errorCode `INVALID_USER_LEVEL` (user api-spec 4.10).
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
   * @throws {ValueObjectValidationException} INVALID_USER_LEVEL
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
        entityName: '회원 레벨',
        reason: `${this.MIN}~${this.MAX} 범위의 정수여야 합니다`,
        errorCode: 'INVALID_USER_LEVEL',
      });
    }

    return new Level({ value });
  }

  /** DB에서 복원합니다 (Mapper 전용, 검증 없음). */
  static unsafeCreate(value: number): Level {
    return new Level({ value });
  }
}
