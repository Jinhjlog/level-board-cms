# 사용자 인증 — API Spec (User Auth)

> SPEC.md(배경·목표·범위)의 계약 산출물. API 1개 = 한 섹션. (실제 컨트롤러 라우트 기준.)
> 인증·프로필·관리자 기능은 구현 완료(`[x]`). **회원 레벨 조정**(4.10, `[ ]`)은 board CMS 연동 신규.

## 4.1 회원가입 (`POST /api/v1/user-auth/register`)

- [x] 인증 불필요
- [x] `email`, `password`, `name`(선택), `phone`(선택)을 입력받는다
- [x] 이메일 중복 → 409(`EMAIL_ALREADY_EXISTS`)
- [x] 비밀번호 정책 위반 시 검증 에러(공통 정책 참조)
- [x] 비밀번호 bcrypt 해시 저장, 신규 회원 기본 `level = 1`
- [x] 성공 시 200 + 액세스/리프레시 토큰 발급

## 4.2 로그인 (`POST /api/v1/user-auth/login`)

- [x] 인증 불필요
- [x] `email`, `password`를 bcrypt 비교
- [x] 이메일 미존재 / 비밀번호 불일치 시 동일 오류 → `INVALID_CREDENTIALS`
- [x] 비활성 계정 → 403(`USER_ACCOUNT_INACTIVE`)
- [x] 성공 시 200 + 토큰 쌍 발급

## 4.3 토큰 갱신 (`POST /api/v1/user-auth/refresh`)

- [x] 토큰 형식 `{tokenId}:{rawToken}` 파싱 → 만료/해시 검증 → Rotation(기존 삭제 + 새 쌍 발급)
- [x] 검증 실패 시 401

## 4.4 로그아웃 (`POST /api/v1/user-auth/logout`)

- [x] 리프레시 토큰 DB 삭제
- [x] 성공 시 204

## 4.5 내 프로필 (`GET /api/v1/users/me`)

- [x] 회원 인증 필요(`@UserAuth`)
- [x] 본인 프로필(이메일, 이름, 전화번호 등) 반환

## 4.6 회원 목록 (`GET /api/v1/admin/users`)

- [x] 관리자 인증 필요(`@AdminAuth`)
- [x] 필터(선택): `name`(부분 일치), `isActive`(생략 시 전체)
- [x] 정렬: 가입일 내림차순
- [x] 페이지네이션: 오프셋(`page` 기본 1, `limit` 기본 20, 최대 100), `currentPage`/`totalPages` 포함
- [x] 각 항목 필드: `id`, `name`, `email`, `phone`, `isActive`, `createdAt`

## 4.7 회원 상세 (`GET /api/v1/admin/users/:userId`)

- [x] 관리자 인증 필요(`@AdminAuth`)
- [x] 없는 회원 → 404(`USER_NOT_FOUND`)
- [x] 성공 시 200 + 상세

## 4.8 회원 활성화 (`PATCH /api/v1/admin/users/:userId/activate`)

- [x] 관리자 인증 필요(`@AdminAuth`)
- [x] `isActive`를 true로 설정 → 재로그인 가능
- [x] 없는 회원 → 404(`USER_NOT_FOUND`)
- [x] 이미 활성 → 400(`USER_ALREADY_ACTIVATED`)
- [x] 성공 시 200

## 4.9 회원 비활성화 (`PATCH /api/v1/admin/users/:userId/deactivate`)

- [x] 관리자 인증 필요(`@AdminAuth`)
- [x] `isActive`를 false로 설정 → 로그인 차단
- [x] 없는 회원 → 404(`USER_NOT_FOUND`)
- [x] 성공 시 200

## 4.10 회원 레벨 조정 (`PATCH /api/v1/admin/users/:userId/level`) 🆕

- [ ] SUPER_ADMIN 인증 필요(`@RequireSuperAdmin`)
- [ ] `level`(필수, 1~10 정수)을 입력받아 회원 레벨을 변경한다
- [ ] 범위(1~10) 위반 → 400(`INVALID_USER_LEVEL`)
- [ ] 없는 회원 → 404(`USER_NOT_FOUND`)
- [ ] 성공 시 200 + 변경된 회원 요약(`id`, `level`)
- [ ] `level`은 `user` BC 소유 → `board` BC가 LookupService로 읽어 레벨 게이트에 사용 (board CMS 연동)

---

## 공통 정책 (비엔드포인트)

**접근 제어**

- [x] `UserJwtGuard`: Bearer JWT 검증 + DB 사용자 활성 상태 확인
- [x] `@UserAuth()` / `@CurrentUser()` 데코레이터

**토큰 관리**

- [x] 리프레시 토큰 bcrypt 해시 DB 저장, 형식 `{tokenId}:{rawToken}`, 유효기간 7일
- [x] 만료된 리프레시 토큰 자동 삭제 스케줄러

**비밀번호 정책**

- [x] 최소 8자, 최대 25자, 특수문자 1개 이상
