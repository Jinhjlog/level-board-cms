/**
 * 회원 레벨 조회 (board → user BC 읽기 전용 ACL).
 * `Member.level`은 user BC 소유 → board는 읽기만 한다(LookupService, context-notes §5.3).
 * - 레벨 게이트 판정(읽기/쓰기/댓글)에 `getLevel` 사용
 * - 게시판 관리자(managerId) 존재 검증에 `exists` 사용
 */
export abstract class UserLevelLookupService {
  /** 회원 레벨 조회. 회원이 없으면 undefined */
  abstract getLevel(userId: string): Promise<number | undefined>;

  /** 회원 존재 여부 */
  abstract exists(userId: string): Promise<boolean>;
}
