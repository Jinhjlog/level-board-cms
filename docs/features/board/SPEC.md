# 게시판 CMS (Board)

## 1. 배경 및 문제 정의

그누보드 계열 게시판처럼, 최고관리자가 게시판을 만들고 각 게시판의 **접근 레벨**(읽기/쓰기/댓글)을 정하면, 회원은 자신의 **레벨**에 따라 글을 읽거나 쓰거나 댓글을 단다. 또한 일부 게시판은 특정 회원에게 **운영(관리)을 위임**하여, 그 회원이 자기 게시판의 글·댓글을 정리할 수 있어야 한다.

현재 템플릿에는 인증(`admin`/`user`)과 파일 업로드(`file-upload`)만 있고, 콘텐츠(게시판/글/댓글) 도메인이 없다. 이 기능은 **레벨 기반 접근제어 + 단일 관리자 위임**을 갖춘 게시판 BC(`board`)를 추가한다.

## 2. 목표

- 최고관리자가 게시판을 생성/수정/삭제하고, 게시판별 읽기·쓰기·댓글 **레벨 문턱**을 설정한다.
- 회원 레벨(1~10) vs 게시판 레벨 문턱 비교로 **콘텐츠 접근을 제어**한다.
- 게시판마다 **단일 관리자**(`managerId`)를 지정해 글·댓글 운영(삭제)을 위임한다.
- 회원은 권한 범위 안에서 글을 작성/수정/삭제하고 댓글을 작성/삭제한다.
- 회원 레벨은 `user` BC가 보유하고, `board` BC는 **LookupService로 읽기만** 한다.

## 3. 사용자 시나리오

### 시나리오 1. 게시판 생성 (최고관리자)

1. SUPER_ADMIN이 게시판 이름과 읽기/쓰기/댓글 레벨, (선택) 관리자 회원 ID를 입력한다.
2. 서버는 레벨 3종이 1~10 범위인지, 관리자 ID가 존재하는 회원인지 검증한다.
3. 검증 통과 시 게시판을 생성한다.

### 시나리오 2. 글 작성 (회원, 레벨 게이트)

1. 인증된 회원이 특정 게시판에 글(제목, 내용)을 작성 요청한다.
2. 서버는 `회원.level ≥ 게시판.writeLevel`을 검증한다.
3. 문턱 미달이면 403(`INSUFFICIENT_LEVEL`)을 반환한다.
4. 통과 시 글을 생성한다(작성자 = 요청 회원).

### 시나리오 3. 글 읽기 / 목록 (회원, 레벨 게이트)

1. 인증된 회원이 게시판 글 목록 또는 상세를 조회한다.
2. 서버는 `회원.level ≥ 게시판.readLevel`을 검증한다. 미달 시 403(`INSUFFICIENT_LEVEL`).
3. 목록은 최신순 + 페이지네이션, (선택) 제목 키워드 필터를 적용한다.

### 시나리오 4. 댓글 작성 (회원, 레벨 게이트)

1. 인증된 회원이 특정 글에 댓글을 작성 요청한다.
2. 서버는 그 글이 속한 게시판의 `commentLevel`과 `회원.level`을 비교한다. 미달 시 403(`INSUFFICIENT_LEVEL`).
3. 통과 시 댓글을 생성한다.

### 시나리오 5. 운영(삭제) — 작성자 본인 또는 게시판 관리자

1. 회원이 자기 글/댓글을 삭제한다.
2. 또는 그 게시판의 관리자(`managerId`)나 SUPER_ADMIN이 남의 글/댓글을 삭제한다.
3. 그 외에는 403(`FORBIDDEN_MODERATION`).

### 시나리오 6. 회원 레벨 조정 (최고관리자)

1. SUPER_ADMIN이 특정 회원의 레벨을 1~10 범위로 변경한다.
2. 범위를 벗어나면 400(`INVALID_USER_LEVEL`).

---

## 4. API 개요 (계약 인덱스)

> 엔드포인트별 상세 계약(동작/검증/에러 체크리스트)은 **[`api-spec.md`](./api-spec.md)** 에 있다. API 1개 = G 작업 단위.
> `board` 소유 **12개**. 회원 레벨 조정 API(`PATCH /admin/users/:userId/level`)는 `user` BC 소유(`docs/features/user/`).

| #    | 동작               | 엔드포인트                                  | 권한                |
| ---- | ------------------ | ------------------------------------------- | ------------------- |
| 4.1  | 게시판 생성        | `POST /api/v1/admin/boards`                 | SUPER_ADMIN         |
| 4.2  | 게시판 수정        | `PATCH /api/v1/admin/boards/:boardId`       | SUPER_ADMIN         |
| 4.3  | 게시판 삭제        | `DELETE /api/v1/admin/boards/:boardId`      | SUPER_ADMIN         |
| 4.4  | 게시판 목록(관리)  | `GET /api/v1/admin/boards`                  | SUPER_ADMIN         |
| 4.5  | 회원용 게시판 목록 | `GET /api/v1/boards`                        | 회원                |
| 4.6  | 글 목록            | `GET /api/v1/boards/:boardId/posts`         | 회원(readLevel)     |
| 4.7  | 글 상세            | `GET /api/v1/boards/:boardId/posts/:postId` | 회원(readLevel)     |
| 4.8  | 글 작성            | `POST /api/v1/boards/:boardId/posts`        | 회원(writeLevel)    |
| 4.9  | 글 수정            | `PATCH /api/v1/posts/:postId`               | 작성자              |
| 4.10 | 글 삭제            | `DELETE /api/v1/posts/:postId`              | 작성자/관리자/SUPER |
| 4.11 | 댓글 작성          | `POST /api/v1/posts/:postId/comments`       | 회원(commentLevel)  |
| 4.12 | 댓글 삭제          | `DELETE /api/v1/comments/:commentId`        | 작성자/관리자/SUPER |

---

## 5. 범위

### 포함

- `board` BC: Board / Post / Comment 애그리거트
- 레벨 기반 접근제어(읽기/쓰기/댓글 게이트)
- 단일 관리자 위임(`Board.managerId`) + 운영(삭제) 권한
- 게시판 CRUD(최고관리자) · 회원용 게시판 목록 · 글 CRUD(회원) · 댓글 작성/삭제(회원)
- `user` BC 확장: `Member.level`(1~10) — 레벨 조정 API는 **`user` BC 소유**(user SPEC), board는 LookupService로 읽기만
- `board → user` LookupService(회원 레벨/존재 조회)
- **글 첨부 이미지**: 글 작성 시 `file-upload` OHS(`UploadedFileAttachmentService`)로 파일 연결(link)

### 미포함

- **복수 관리자**(N:M) / 권한 세분화 grant 테이블 → Ep2
- 게시글 임시저장(draft)·공개/비공개 상태머신
- 글/댓글 **수정 이력**, 대댓글(nested comment), 좋아요/조회수
- 비회원(guest) 읽기 — 모든 콘텐츠 엔드포인트는 회원 인증 필요
- **첨부 변경/삭제**(글 수정 시 첨부 교체) — 첨부는 **작성 시 연결만**, 수정은 `title`/`content`만

---

## 6. 전제 조건 및 제약사항

- **레벨 모델**: 회원 레벨·게시판 레벨 문턱은 **정수 1~10**. 도메인 VO(`Level`, Integer 범위)로 검증.
- **회원 레벨 소유권**: `Member.level`은 `user` BC 소유. 신규 회원 기본 레벨 = **1**. `board`는 레벨을 **읽기만**(LookupService), 변경은 `user` 측 API(user SPEC).
- **단일 관리자**: 게시판당 관리자 1명(`managerId`, nullable). 관리자는 **자기 게시판의 글·댓글 삭제만** 가능(게시판 설정 변경은 SUPER_ADMIN 전용).
- **레벨 게이트 판정 위치**: `회원.level ≥ board.*Level` 판정은 **단일 애그리거트 불변식이 아님**(Board·Member 동시 참조) → **application 레이어 + LookupService** 책임. 도메인 VO는 레벨 값 검증만.
- **삭제 cascade**: 게시판 삭제 → 글·댓글 삭제 / 글 삭제 → 댓글 삭제.
- **첨부 연결**: 글 작성 시 `attachmentIds`(이미 업로드·`CONFIRMED`된 파일)를 `file-upload` OHS로 link만 한다. board는 파일 저장/검증을 모름(OHS에 위임). 첨부 메타 조회도 OHS 경유.
- **ID·페이지네이션·에러형태**: 기존 코드 컨벤션 조사 후 일치(ULID, 오프셋 page/limit, 글로벌 예외 필터).
- **검증 책임**: 길이/형식/레벨 범위는 **도메인 VO**. Request DTO는 타입 가드만(`rules/validation.md`).

---

## 7. 수락 기준

- [ ] SUPER_ADMIN이 게시판을 생성/수정/삭제하고 레벨·관리자를 설정할 수 있다
- [ ] 레벨 1~10 범위 위반이 400으로 거부된다(게시판 레벨·회원 레벨 모두)
- [ ] `회원.level < board.readLevel`이면 목록/상세가 403으로 차단된다
- [ ] `회원.level < board.writeLevel`이면 글 작성이 403으로 차단된다
- [ ] `회원.level < board.commentLevel`이면 댓글 작성이 403으로 차단된다
- [ ] 글/댓글은 작성자 본인 또는 게시판 관리자/SUPER_ADMIN만 삭제할 수 있고, 그 외엔 403
- [ ] 글 수정은 작성자 본인만 가능하다(403 `NOT_POST_OWNER`)
- [ ] 존재하지 않는 게시판/글/댓글/회원은 각 404 에러코드로 응답한다
- [ ] 게시판 삭제 시 글·댓글이, 글 삭제 시 댓글이 함께 삭제된다

---

## 8. 미결 사항

| 항목                                | 상태 | 비고                                             |
| ----------------------------------- | ---- | ------------------------------------------------ |
| 첨부 이미지 연동(`file-upload` OHS) | 확정 | **포함** — 4.8 글 작성 시 `attachmentIds`로 link |
| 회원용 게시판 목록 API              | 확정 | **포함** — 4.5 `GET /api/v1/boards`              |

(미결 없음 — 전부 확정)
