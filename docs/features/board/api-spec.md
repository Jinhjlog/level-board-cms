# 게시판 CMS — API Spec (Board)

> SPEC.md(배경·목표·범위)의 **계약 산출물**. API 1개 = 한 섹션 = G 작업 단위.
> 형식은 **동작/검증/에러 체크리스트**(가벼운 계약). 완전한 Request/Response DTO 스키마는 D단계 Mock·구현에서 확정.
> 경로 prefix `/api/v1`, 관리자 엔드포인트는 `/admin/*`.
> 레벨 게이트 판정에 필요한 **회원 레벨은 `user` BC의 LookupService로 조회**한다.
> **회원 레벨 조정 API**(`PATCH /admin/users/:userId/level`)는 `user` BC 소유 → `docs/features/user/api-spec.md`. 여기선 `board` 소유 엔드포인트(12개)만 다룬다.

## 4.1 게시판 생성 (`POST /api/v1/admin/boards`)

- [ ] SUPER_ADMIN 인증 필요
- [ ] `name`(필수), `readLevel`/`writeLevel`/`commentLevel`(필수, 1~10 정수), `managerId`(선택)를 입력받는다
- [ ] 레벨 3종이 1~10 범위를 벗어나면 400(`INVALID_BOARD_LEVEL`)
- [ ] `managerId`가 주어졌으나 존재하지 않는 회원이면 400(`MANAGER_NOT_FOUND`)
- [ ] 성공 시 201 + 생성된 게시판 상세 반환

## 4.2 게시판 수정 (`PATCH /api/v1/admin/boards/:boardId`)

- [ ] SUPER_ADMIN 인증 필요
- [ ] `name` / 레벨 3종 / `managerId` 중 전달된 필드만 수정한다
- [ ] 레벨 범위 위반 시 400(`INVALID_BOARD_LEVEL`)
- [ ] `managerId` 변경 시 존재하는 회원인지 검증 → 미존재 400(`MANAGER_NOT_FOUND`)
- [ ] `managerId`를 `null`로 보내면 관리자 해제
- [ ] 없는 게시판이면 404(`BOARD_NOT_FOUND`)
- [ ] 성공 시 200 + 수정된 게시판 상세 반환

## 4.3 게시판 삭제 (`DELETE /api/v1/admin/boards/:boardId`)

- [ ] SUPER_ADMIN 인증 필요
- [ ] 없는 게시판이면 404(`BOARD_NOT_FOUND`)
- [ ] 게시판 삭제 시 소속 글·댓글도 함께 삭제(cascade)
- [ ] 성공 시 204

## 4.4 게시판 목록 (관리용) (`GET /api/v1/admin/boards`)

- [ ] SUPER_ADMIN 인증 필요
- [ ] 정렬: 생성일 내림차순
- [ ] 페이지네이션: 오프셋(`page` 기본 1, `limit` 기본 20, 최대 100)
- [ ] 각 항목 필드: `id`, `name`, `readLevel`, `writeLevel`, `commentLevel`, `managerId`, `createdAt`

## 4.5 회원용 게시판 목록 (`GET /api/v1/boards`)

- [ ] 회원 인증 필요(`@UserAuth`)
- [ ] 회원이 게시판을 탐색할 수 있도록 전체 게시판을 반환한다 (접근은 진입 시 레벨 게이트로 별도 판정 — 목록 자체는 레벨로 거르지 않음)
- [ ] 정렬: 생성일 내림차순
- [ ] 페이지네이션: 오프셋(`page` 기본 1, `limit` 기본 20, 최대 100)
- [ ] 각 항목 필드: `id`, `name`, `readLevel`, `writeLevel`, `commentLevel`

## 4.6 글 목록 (`GET /api/v1/boards/:boardId/posts`)

- [ ] 회원 인증 필요(`@UserAuth`)
- [ ] 게시판 없으면 404(`BOARD_NOT_FOUND`)
- [ ] `회원.level ≥ board.readLevel` 아니면 403(`INSUFFICIENT_LEVEL`)
- [ ] 정렬: 작성일 내림차순
- [ ] 페이지네이션: 오프셋(`page` 기본 1, `limit` 기본 20, 최대 100)
- [ ] 필터(선택): `keyword`(제목 부분 일치)
- [ ] 각 항목 필드: `id`, `title`, `authorId`, `createdAt`

## 4.7 글 상세 (`GET /api/v1/posts/:postId`)

- [ ] 회원 인증 필요
- [ ] 글 없으면 404(`POST_NOT_FOUND`)
- [ ] `회원.level ≥ board.readLevel`(글이 속한 게시판 기준) 아니면 403(`INSUFFICIENT_LEVEL`)
- [ ] 포함 필드: `id`, `boardId`, `title`, `content`, `authorId`, `createdAt`, `attachments`(첨부 파일 목록)

## 4.8 글 작성 (`POST /api/v1/boards/:boardId/posts`)

- [ ] 회원 인증 필요
- [ ] 게시판 없으면 404(`BOARD_NOT_FOUND`)
- [ ] `회원.level ≥ board.writeLevel` 아니면 403(`INSUFFICIENT_LEVEL`)
- [ ] `title`(필수), `content`(필수), `attachmentIds`(선택, 배열)를 입력받는다
- [ ] 작성자 = 인증 회원
- [ ] `attachmentIds`가 있으면 **`file-upload` OHS(`UploadedFileAttachmentService`)로 각 파일을 글에 연결(link)**한다 (`CONFIRMED` 아닌 파일이면 400 — file-upload 에러코드 위임)
- [ ] 성공 시 201 + 생성된 글 상세 반환

## 4.9 글 수정 (`PATCH /api/v1/posts/:postId`)

- [ ] 회원 인증 필요
- [ ] 없는 글이면 404(`POST_NOT_FOUND`)
- [ ] **작성자 본인만** 수정 가능, 아니면 403(`NOT_POST_OWNER`)
- [ ] `title` / `content` 중 전달된 필드만 수정 (첨부 변경은 미포함 — SPEC 5장 참조)
- [ ] 성공 시 200 + 수정된 글 상세 반환

## 4.10 글 삭제 (`DELETE /api/v1/posts/:postId`)

- [ ] 회원 인증 필요
- [ ] 없는 글이면 404(`POST_NOT_FOUND`)
- [ ] 삭제 권한: **작성자 본인** 또는 그 글이 속한 게시판의 **관리자(`managerId`)** 또는 **SUPER_ADMIN**
- [ ] 권한 없으면 403(`FORBIDDEN_MODERATION`)
- [ ] 글 삭제 시 소속 댓글도 함께 삭제(cascade)
- [ ] 성공 시 204

## 4.11 댓글 작성 (`POST /api/v1/posts/:postId/comments`)

- [ ] 회원 인증 필요
- [ ] 없는 글이면 404(`POST_NOT_FOUND`)
- [ ] `회원.level ≥ board.commentLevel`(글이 속한 게시판 기준) 아니면 403(`INSUFFICIENT_LEVEL`)
- [ ] `content`(필수)를 입력받는다
- [ ] 작성자 = 인증 회원
- [ ] 성공 시 201 + 생성된 댓글 상세 반환

## 4.12 댓글 삭제 (`DELETE /api/v1/comments/:commentId`)

- [ ] 회원 인증 필요
- [ ] 없는 댓글이면 404(`COMMENT_NOT_FOUND`)
- [ ] 삭제 권한: **작성자 본인** 또는 그 댓글 글이 속한 게시판의 **관리자** 또는 **SUPER_ADMIN**
- [ ] 권한 없으면 403(`FORBIDDEN_MODERATION`)
- [ ] 성공 시 204
