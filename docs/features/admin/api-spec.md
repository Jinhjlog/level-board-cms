# 관리자 인증 — API Spec (Admin Auth)

> SPEC.md(배경·목표·범위)의 계약 산출물. API 1개 = 한 섹션. (구현 완료 모듈 — 실제 컨트롤러 라우트 기준.)
> 경로 prefix `/api/v1`. 인증 데코레이터는 401/403을 Swagger에 자동 부착(컨트롤러 중복 X).

## 4.1 로그인 (`POST /api/v1/admin-auth/login`)

- [x] 인증 불필요
- [x] `loginId`, `password`를 입력받아 bcrypt 비교
- [x] 아이디 미존재 / 비밀번호 불일치 시 동일 오류 → `INVALID_CREDENTIALS` (계정 존재 노출 방지)
- [x] 비활성 계정(`isActive=false`) → 403(`ADMIN_ACCOUNT_INACTIVE`)
- [x] 성공 시 200 + 액세스/리프레시 토큰 발급, `lastLoginAt` 갱신

## 4.2 토큰 갱신 (`POST /api/v1/admin-auth/refresh`)

- [x] 인증 불필요(리프레시 토큰 본문 전달)
- [x] 토큰 형식 `{tokenId}:{rawToken}` 파싱 → DB 조회 → 만료/해시(bcrypt) 검증
- [x] 검증 성공 시 기존 토큰 삭제(일회용 Rotation) + 새 토큰 쌍 발급
- [x] 검증 실패 시 단계별 401

## 4.3 로그아웃 (`POST /api/v1/admin-auth/logout`)

- [x] `tokenId` 파싱 → 해당 리프레시 토큰 DB 삭제
- [x] 성공 시 204

## 4.4 관리자 등록 (`POST /api/v1/admin/admins`)

- [x] SUPER_ADMIN 인증 필요(`@RequireSuperAdmin`)
- [x] `loginId`, `password`, `name` 필수, `role`은 항상 `ADMIN`으로 생성
- [x] `loginId` 중복 → 409
- [x] 성공 시 201

## 4.5 관리자 목록 (`GET /api/v1/admin/admins`)

- [x] SUPER_ADMIN 인증 필요
- [x] 전체 관리자 목록(소프트 딜리트 제외) 반환
- [x] 성공 시 200

## 4.6 관리자 상세 (`GET /api/v1/admin/admins/:adminId`)

- [x] SUPER_ADMIN 인증 필요
- [x] 없는 관리자 → 404(`ADMIN_NOT_FOUND`)
- [x] 성공 시 200 + 상세

## 4.7 관리자 수정 (`PATCH /api/v1/admin/admins/:adminId`)

- [x] SUPER_ADMIN 인증 필요
- [x] `name` / `email` / `role` / `password` / `isActive` 중 전달된 필드 수정
- [x] 검증 에러: `NAME_REQUIRED` / `NAME_TOO_LONG`(최대 50) / `INVALID_EMAIL_FORMAT` / `ADMIN_ROLE_INVALID`(SUPER_ADMIN·ADMIN만) / `PASSWORD_TOO_SHORT` / `PASSWORD_TOO_LONG` / `PASSWORD_MISSING_SPECIAL_CHARACTER`
- [x] 본인 계정 비활성화 시도 → 400(`CANNOT_DEACTIVATE_SELF`)
- [x] 없는 관리자 → 404(`ADMIN_NOT_FOUND`)
- [x] 성공 시 200 + 상세

---

## 공통 정책 (비엔드포인트)

**접근 제어**

- [x] `AdminJwtGuard`: Bearer JWT 검증 + DB 관리자 활성 상태 확인
- [x] `AdminRoleGuard`: 메타데이터 기반 역할 검증
- [x] `@AdminAuth()` / `@RequireSuperAdmin()` / `@CurrentAdmin()` 데코레이터

**토큰 관리**

- [x] 리프레시 토큰 bcrypt 해시 DB 저장, 형식 `{tokenId}:{rawToken}`, 유효기간 7일
- [x] 만료된 리프레시 토큰 자동 삭제 스케줄러

**비밀번호 정책**

- [x] 최소 8자, 최대 25자, 특수문자 1개 이상
