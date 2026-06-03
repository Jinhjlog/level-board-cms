# 게시판 CMS(Board) E2E 테스트 시나리오

> 우선순위: P1 | 최종 업데이트: 2026-06-03
> 관련 컨트롤러: `src/module/board/presentation/controllers/{admin-board,board,post,comment}.controller.ts`
> SPEC: `docs/features/board/SPEC.md` · 계약: `docs/features/board/api-spec.md`

## 개요

레벨 기반 접근제어(읽기/쓰기/댓글 문턱 1~10) + 단일 관리자 위임을 갖춘 게시판 CMS의 12개 API를 검증한다. 회원 레벨(`회원.level`)과 게시판 레벨 문턱 비교로 콘텐츠 접근을 제어하고, 작성자/게시판 관리자/SUPER_ADMIN의 운영(삭제) 권한을 확인한다.

> **TDD(RED-first)**: 본 문서의 TC는 D단계 Mock 컨트롤러에 대해 **실패(RED)** 한다. F·G단계 구현으로 GREEN을 견인한다.

## 사전 조건 (Preconditions)

| 항목        | 설명                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------- |
| 인증 토큰   | 관리 API(4.1~4.4)=`SUPER_ADMIN` 관리자 토큰. 콘텐츠 API(4.5~4.12)=회원(`@UserAuth`) 토큰      |
| 선행 데이터 | 관리자/회원 계정, 게시판·글·댓글 seed. 회원은 `level`을 지정해 시드(레벨 게이트 검증용)        |
| 외부 서비스 | 첨부(4.8)는 `file-upload` OHS(`UploadedFileAttachmentService`) — CONFIRMED 파일 seed로 대체   |
| 로그인      | 관리자 `POST /api/v1/admin-auth/login {loginId,password}`, 회원 `POST /api/v1/user-auth/login {email,password}` |

## 제거된 시나리오 및 근거

| 제거 항목                                        | 근거                                             |
| ------------------------------------------------ | ------------------------------------------------ |
| name 빈 값 / 255자 초과, content 빈 값           | 도메인 VO(BoundedString) 유닛 테스트 영역        |
| 레벨 비정수/타입 오류, page/limit 범위           | DTO ValidationPipe 유닛 테스트 영역              |
| 콘텐츠 API 각각의 401 (인증 누락)                | 같은 `@UserAuth()` — 대표 1개(TC-BOARD-012)로 충분 |
| 관리 API 각각의 403 (비 SUPER_ADMIN)             | 같은 `@RequireSuperAdmin()` — 대표 1개(TC-BOARD-004) |

---

## 테스트 시나리오 (BOARD)

### 게시판 관리 — `admin/boards` (SUPER_ADMIN)

#### TC-BOARD-001: 게시판 생성 성공 (4.1)
- **Given** SUPER_ADMIN 토큰
- **When** `POST /v1/admin/boards` Body `{name:"공지", readLevel:1, writeLevel:2, commentLevel:1}`
- **Then** `201` + 본문 `{id, name:"공지", readLevel:1, writeLevel:2, commentLevel:1, managerId:null, createdAt, updatedAt}`

#### TC-BOARD-002: 레벨 범위 위반 400 (4.1)
- **When** `writeLevel: 11`로 생성 요청
- **Then** `400` errorCode `INVALID_BOARD_LEVEL`

#### TC-BOARD-003: managerId 미존재 회원 400 (4.1)
- **When** 존재하지 않는 `managerId`로 생성 요청
- **Then** `400` errorCode `MANAGER_NOT_FOUND`

#### TC-BOARD-004: 비 SUPER_ADMIN 접근 403 (대표 권한 검증)
- **Given** `ADMIN` 역할 토큰
- **When** `POST /v1/admin/boards`
- **Then** `403` errorCode `FORBIDDEN_ADMIN_ROLE`

#### TC-BOARD-005: 게시판 수정 성공 (4.2)
- **Given** 게시판 seed
- **When** `PATCH /v1/admin/boards/:boardId` Body `{name:"자유", readLevel:3}`
- **Then** `200` + 변경된 `name:"자유", readLevel:3` (나머지 필드 유지)

#### TC-BOARD-006: managerId null 전송 시 관리자 해제 (4.2)
- **Given** managerId가 설정된 게시판 seed
- **When** `PATCH` Body `{managerId: null}`
- **Then** `200` + `managerId: null`

#### TC-BOARD-007: 없는 게시판 수정 404 (4.2)
- **When** 존재하지 않는 boardId로 `PATCH`
- **Then** `404` errorCode `BOARD_NOT_FOUND`

#### TC-BOARD-008: 게시판 삭제 성공 + cascade (4.3)
- **Given** 글·댓글이 있는 게시판 seed
- **When** `DELETE /v1/admin/boards/:boardId`
- **Then** `204` + DB에서 해당 boards/posts/comments 행 삭제 확인

#### TC-BOARD-009: 없는 게시판 삭제 404 (4.3)
- **When** 존재하지 않는 boardId로 `DELETE`
- **Then** `404` errorCode `BOARD_NOT_FOUND`

#### TC-BOARD-010: 게시판 목록(관리) 성공 (4.4)
- **Given** 게시판 3개 seed
- **When** `GET /v1/admin/boards?page=1&limit=20`
- **Then** `200` + `{items[3], totalCount:3, totalPages:1, currentPage:1}`, 각 항목에 `managerId`/`createdAt` 포함, 생성일 내림차순

### 회원용 게시판/글 — `boards` (회원)

#### TC-BOARD-011: 회원용 게시판 목록 성공 (4.5)
- **Given** 회원 토큰, 게시판 2개 seed
- **When** `GET /v1/boards`
- **Then** `200` + `{items[2], totalCount:2, ...}`, 각 항목 `{id,name,readLevel,writeLevel,commentLevel}` (managerId 미포함)

#### TC-BOARD-012: 인증 없이 접근 401 (대표 인증 검증)
- **When** 토큰 없이 `GET /v1/boards`
- **Then** `401` errorCode `ACCESS_TOKEN_MISSING`

#### TC-BOARD-013: 글 목록 성공 — readLevel 통과 (4.6)
- **Given** `readLevel:2` 게시판, 글 2개 seed, 회원 `level:3`
- **When** `GET /v1/boards/:boardId/posts`
- **Then** `200` + `{items[2], totalCount:2, ...}`, 각 항목 `{id,title,authorId,createdAt}`, 작성일 내림차순

#### TC-BOARD-014: 글 목록 readLevel 미달 403 (4.6)
- **Given** `readLevel:5` 게시판, 회원 `level:2`
- **When** `GET /v1/boards/:boardId/posts`
- **Then** `403` errorCode `INSUFFICIENT_LEVEL`

#### TC-BOARD-015: 글 목록 없는 게시판 404 (4.6)
- **When** 존재하지 않는 boardId로 글 목록 조회
- **Then** `404` errorCode `BOARD_NOT_FOUND`

#### TC-BOARD-016: 글 목록 keyword 필터 (4.6)
- **Given** 제목 "공지A","잡담B" 글 seed, 회원 레벨 충족
- **When** `GET /v1/boards/:boardId/posts?keyword=공지`
- **Then** `200` + "공지A"만 포함

#### TC-BOARD-017: 글 작성 성공 — writeLevel 통과 (4.8)
- **Given** `writeLevel:2` 게시판, 회원 `level:3`
- **When** `POST /v1/boards/:boardId/posts` Body `{title:"새 글", content:"본문"}`
- **Then** `201` + `{id, boardId, title:"새 글", content:"본문", authorId:회원ID, createdAt, attachments:[]}`

#### TC-BOARD-018: 글 작성 writeLevel 미달 403 (4.8)
- **Given** `writeLevel:5` 게시판, 회원 `level:2`
- **When** 글 작성 요청
- **Then** `403` errorCode `INSUFFICIENT_LEVEL`

#### TC-BOARD-019: 글 작성 + 첨부 연결 (4.8)
- **Given** 회원 레벨 충족, CONFIRMED 업로드 파일 seed(`uploadedBy`=회원, purpose `attachment`)
- **When** 글 작성 Body `{title,content,attachmentIds:[fileId]}`
- **Then** `201` + `attachments` 길이 1, `{url, originalName, mimeType}` 포함

#### TC-BOARD-020: 글 작성 없는 게시판 404 (4.8)
- **When** 존재하지 않는 boardId로 글 작성
- **Then** `404` errorCode `BOARD_NOT_FOUND`

### 글 상세/수정/삭제 + 댓글 — `posts` (회원)

#### TC-BOARD-021: 글 상세 성공 (4.7)
- **Given** 글 seed, 회원 readLevel 충족
- **When** `GET /v1/posts/:postId`
- **Then** `200` + `{id, boardId, title, content, authorId, createdAt, attachments}`

#### TC-BOARD-022: 글 상세 readLevel 미달 403 (4.7)
- **Given** `readLevel:5` 게시판의 글, 회원 `level:2`
- **When** `GET /v1/posts/:postId`
- **Then** `403` errorCode `INSUFFICIENT_LEVEL`

#### TC-BOARD-023: 글 상세 없는 글 404 (4.7)
- **When** 존재하지 않는 postId
- **Then** `404` errorCode `POST_NOT_FOUND`

#### TC-BOARD-024: 글 수정 성공 — 작성자 본인 (4.9)
- **Given** 회원이 작성한 글 seed
- **When** `PATCH /v1/posts/:postId` Body `{title:"수정됨"}`
- **Then** `200` + `title:"수정됨"` (content 유지)

#### TC-BOARD-025: 글 수정 작성자 아님 403 (4.9)
- **Given** 다른 회원이 작성한 글
- **When** 본인이 아닌 회원 토큰으로 `PATCH`
- **Then** `403` errorCode `NOT_POST_OWNER`

#### TC-BOARD-026: 글 수정 없는 글 404 (4.9)
- **When** 존재하지 않는 postId로 `PATCH`
- **Then** `404` errorCode `POST_NOT_FOUND`

#### TC-BOARD-027: 글 삭제 성공 — 작성자 본인 + cascade (4.10)
- **Given** 회원이 작성한 글 + 댓글 seed
- **When** `DELETE /v1/posts/:postId`
- **Then** `204` + DB에서 post/comments 삭제 확인

#### TC-BOARD-028: 글 삭제 — 게시판 관리자 권한 (4.10)
- **Given** 회원A 작성 글, 게시판 managerId=회원B
- **When** 회원B 토큰으로 `DELETE`
- **Then** `204`

#### TC-BOARD-029: 글 삭제 권한 없음 403 (4.10)
- **Given** 회원A 작성 글, 무관한 회원C
- **When** 회원C 토큰으로 `DELETE`
- **Then** `403` errorCode `FORBIDDEN_MODERATION`

#### TC-BOARD-030: 글 삭제 없는 글 404 (4.10)
- **When** 존재하지 않는 postId로 `DELETE`
- **Then** `404` errorCode `POST_NOT_FOUND`

#### TC-BOARD-031: 댓글 작성 성공 — commentLevel 통과 (4.11)
- **Given** `commentLevel:2` 게시판의 글, 회원 `level:3`
- **When** `POST /v1/posts/:postId/comments` Body `{content:"댓글"}`
- **Then** `201` + `{id, postId, authorId:회원ID, content:"댓글", createdAt}`

#### TC-BOARD-032: 댓글 작성 commentLevel 미달 403 (4.11)
- **Given** `commentLevel:5` 게시판의 글, 회원 `level:2`
- **When** 댓글 작성 요청
- **Then** `403` errorCode `INSUFFICIENT_LEVEL`

#### TC-BOARD-033: 댓글 작성 없는 글 404 (4.11)
- **When** 존재하지 않는 postId로 댓글 작성
- **Then** `404` errorCode `POST_NOT_FOUND`

### 댓글 삭제 — `comments` (회원)

#### TC-BOARD-034: 댓글 삭제 성공 — 작성자 본인 (4.12)
- **Given** 회원이 작성한 댓글 seed
- **When** `DELETE /v1/comments/:commentId`
- **Then** `204` + DB에서 comment 삭제 확인

#### TC-BOARD-035: 댓글 삭제 권한 없음 403 (4.12)
- **Given** 회원A 작성 댓글, 무관한 회원C
- **When** 회원C 토큰으로 `DELETE`
- **Then** `403` errorCode `FORBIDDEN_MODERATION`

#### TC-BOARD-036: 댓글 삭제 없는 댓글 404 (4.12)
- **When** 존재하지 않는 commentId로 `DELETE`
- **Then** `404` errorCode `COMMENT_NOT_FOUND`

---

## 모듈 코드

`TC-BOARD-NNN` — 게시판 CMS. (기존: AAUTH/UAUTH/FUPL)
