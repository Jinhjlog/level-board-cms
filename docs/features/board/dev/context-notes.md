# Board — C단계 컨텍스트 노트 (D-0 컨벤션 조사 + 결정/불일치)

> 작성: 2026-06-03 · 단계: 묶음1(C·D·E) 진입 · 부모 브랜치 `feature/board` → 작업 `feat/board-contract`
> 근거는 모두 **이 코드베이스의 실제 사례(파일:라인)**. 추론이 아닌 조사 결과.

---

## 1. D-0 컨벤션 조사 결과 (그대로 따른다)

| # | 항목 | 이 프로젝트의 규칙 | 근거 |
| - | ---- | ------------------ | ---- |
| 1 | **응답 래퍼** | **없음.** 컨트롤러가 Response DTO를 직접 반환. 글로벌 인터셉터 미사용 | `admin.controller.ts:92`, `user.controller.ts:43` |
| 2 | **페이지네이션** | 오프셋 `page`/`limit`. 공용 DTO: `AdminPaginationRequestDto`(max **100**), `PublicPaginationRequestDto`(max **50**). UseCase에서 `skip=(page-1)*limit`, 응답에 `items`+`totalCount`+`totalPages`+`currentPage` | `src/shared/dtos/*`, `find-admin-user-list.usecase.ts:17-36`, `admin-user-list.response.dto.ts:36-51` |
| 3 | **ID 타입** | **ULID**. `@Param('id')`에 **파이프 없음**(string 그대로). `@ApiParam`에 `(ULID)` 표기 | `unique-entity-id.ts:6`, `admin.controller.ts:139-157` |
| 4 | **인증/인가** | 관리자: `@RequireSuperAdmin()` / `@AdminAuth()`. 회원: `@UserAuth()`. ID 추출: `@CurrentAdmin('adminId')` / `@CurrentUser('userId')`. **회원 JWT엔 role 없음**(`createAccessToken({ userId })`) → 회원은 인증 여부만 | `admin-auth.decorator.ts`, `user-auth.decorator.ts`, `current-user.decorator.ts:38`, `user-auth.service.ts:84` |
| 5 | **enum/status** | board는 status enum 없음(YAGNI). 관리자 역할은 `SUPER_ADMIN`/`ADMIN` 문자열 | `admin-role.ts` |
| 6 | **@ApiProperty** | 선택=`required:false`, nullable=`nullable:true`, 제약은 `description`에 `(최대 N자)` 텍스트 + `minimum`/`maximum`/`maxLength`, enum=`enum:[...]` | `admin-detail.response.dto.ts:4-40`, `admin-pagination.request.dto.ts:6-13` |
| 7 | **에러 응답 / errorCode** | 글로벌 `AllExceptionsFilter`(`src/shared/exception/exception.filter.ts:27`). 바디: `{statusCode,errorCode,message,timestamp,path,method,requestId}`. errorCode = **UPPER_SNAKE_CASE** | `exception.filter.ts`, `domain.exception.ts` |
| 8 | **파일 구조** | `presentation/{controllers,dtos/{request,response},transformers,decorators,guards}`. `decorators`/`guards`는 `index.ts` 배럴 O, `dtos`는 배럴 없이 직접 import | `src/module/admin/presentation/*` |
| 9 | **@ApiTags** | 한국어. 관리자=`'관리자 - X'`, 회원=`'사용자'` 계열 | `admin.controller.ts:34`, `user.controller.ts:13` |
| 10 | **요청 메타(IP 등)** | board 범위에 IP 불필요 (해당 없음) | — |
| + | **검증 책임** | **VO 책임.** Request DTO는 `@IsString()`/`@IsOptional()`/`@IsNotEmpty()` 타입가드만. 길이/범위/형식은 VO `create()`에서 throw | `register-admin.request.dto.ts:4-41` (rules/validation.md) |
| + | **Swagger 인증응답** | `@AdminAuth()`/`@RequireSuperAdmin()`/`@UserAuth()`가 **401/403을 자동 부착** → 컨트롤러에서 중복 작성 금지 | `admin-auth.decorator.ts:31-72` |
| + | **Transformer** | static 클래스(`XxxTransformer.toDetailResponse/toListResponse`), ReadModel→Response. null 변환은 `x !== undefined ? x : null` | `admin.transformer.ts:9-39` |

## 2. 도메인/인프라 패턴 (F단계용)

- **Foundation**: `AggregateRoot<Props>`(`aggregate-root.ts`), `ValueObject<Props>`(`value-object.ts`), ID는 `UniqueEntityId`가 ULID 자동생성.
- **Aggregate**: `create()`는 **VO 객체를 받아** 내부 조립(원시값 아님), `unsafeCreate()`는 Mapper 복원용(검증 없음), getter only. 행위 메서드는 YAGNI(UseCase 생길 때). 근거 `user.ts:69-83`, `admin.ts:109-134`, `uploaded-file.ts:147-200`.
- **내장 VO**: `BoundedString`(길이), `Integer`(정수+min/max), `PositiveNumber`, `Email`, `Phone` 등 (`src/lib/domain/value-objects/`). 모두 `create(검증)`/`unsafeCreate`.
- **Repository**: `domain/repositories`에 abstract class, `save`/`findById`/필요한 `findByX`만. 반환은 `T | undefined`. 모듈에서 `{provide: XxxRepository, useClass: XxxRepositoryImpl}` 바인딩.
- **Mapper**: `toDomain`=VO `unsafeCreate`, DB `null`→도메인 `undefined`는 **삼항(`x !== null ? ... : undefined`), `??` 금지**. `toPersistence`=VO `.value`, `undefined`→`null`, FK 직접 설정. 근거 `uploaded-file.mapper.ts`, `user.mapper.ts:12`.
- **QueryService**: `domain/services` abstract + `infra/services` 구현. ReadModel(primitive only) 반환. 필터는 `...(name && { name: { contains: name } })`. 근거 `user-query.service.impl.ts:43-67`.
- **예외**: `EntityNotFoundException`(`*_NOT_FOUND`), `DomainRuleViolationException`(규칙위반), `ValueObjectValidationException`(VO 검증), `AuthorizationException`(403). `src/shared/exception/`.
- **Prisma**: `PrismaService`(`core/database`), cascade는 schema `onDelete: Cascade`로 DB 보장(이미 적용됨). 트랜잭션 필요 시 `PrismaUnitOfWork`.

## 3. 통합 패턴

- **file-upload OHS** (`application/ohs/uploaded-file-attachment.service.ts`, 이미 export됨):
  - `getConfirmedFileInfo(fileId, expectedPurpose): Promise<ConfirmedFileInfo{url,storageKey,originalName,mimeType,fileSize?}>` — CONFIRMED+purpose 검증, throw `FILE_NOT_FOUND`/`FILE_NOT_CONFIRMED`/`FILE_PURPOSE_MISMATCH`
  - `markLinked(fileId)` — 멱등, 고아정리 보호
  - `deleteStorageFile(storageKey)` — 멱등, 글 삭제 시 물리 파일 정리
  - board는 `FileUploadModule` import 후 `UploadedFileAttachmentService` 주입해 소비. PostAttachment는 메타 **스냅샷 복사**(uploaded_files FK 없음).
- **Port/Adapter**: `FileStoragePort`↔`MockFileStorageAdapter` 실증. board는 신규 Port 불필요.

## 4. E2E 패턴

- 부팅 `createTestApp()`(`test/helpers/test-app.helper.ts`) — `/api` prefix + URI v1 + ValidationPipe(whitelist/forbidNonWhitelisted/transform).
- `beforeEach`마다 `cleanDatabase(prisma)`(`db-cleanup.helper.ts`) — FK off → deleteMany → FK on.
- 인증: e2e는 **실제 로그인 API 호출**로 토큰 발급(`login()` 헬퍼 패턴). `auth.helper.ts`의 직접서명은 특수경우만.
- Seed: `seed/{admin,user,file-upload}.seed.ts` + `seed/index.ts` 배럴.
- 단언: `expectSuccess<T>(res, code)`, `expectError(res, {statusCode, errorCode})` (`assertion.helper.ts`).
- 문서: `docs/e2e/p?-*.md`. P0=auth, P1=file-upload → **board = P1**(주요 기능). TC 코드 = `TC-BOARD-NNN`.
- 실행 `npm run test:e2e` (testRegex `.e2e-spec.ts$`).

---

## 5. ⚠️ 결정사항 / SPEC 불일치 (게이트3 사람 검토 대상)

> **SSOT = SPEC.** 아래는 기존 코드와 SPEC이 어긋나거나 신규 설계가 필요한 지점. 합리적 기본값으로 진행하고 여기에 기록.

### 5.1 회원용 목록 페이지네이션 max값 — **불일치**
- **SPEC**(`api-spec.md` 4.5/4.6/4.7): 회원용/글 목록도 `limit` **최대 100**.
- **기존 코드**: `PublicPaginationRequestDto` = max **50**.
- **결정**: SPEC 우선 → `PublicPaginationRequestDto`(max50) **재사용 불가**. board는 **전용 페이지네이션 Request DTO**(max 100)를 둔다. 관리용(4.4)도 동일 max 100이라 board 공용 1개로 통일 가능. (기존 Public DTO를 50→100으로 바꾸면 타 모듈 파급 → 격리 원칙상 건드리지 않음.)

### 5.2 `user.level` — 도메인 미반영 (prisma만 존재)
- 현재 `prisma User.level @default(1)`은 있으나 **User 애그리거트/Mapper/seedUser엔 level 없음**.
- board는 레벨을 **읽기만** 함 → board의 LookupService 구현이 **`prisma.user.findUnique({select:{level}})`로 직접 조회**(User 도메인 수정 불필요, BC 침범 최소화 — BOARD_TABLES.md "검증은 application LookupService 책임"과 일치).
- 단 **E2E에서 특정 레벨 회원 시드**가 필요 → `seedUser`에 `level` override 추가(또는 board seed에서 직접 user 생성). E단계 처리.
- ※ 회원 레벨 조정 API(`PATCH /admin/users/:id/level`)와 기본레벨=1은 **user BC 소유**(이번 board 범위 밖).

### 5.3 LookupService 배치 — **신규**(기존 코드에 LookupService 사례 없음)
- **결정**: 소비측(board)의 ACL로 둔다. `board/domain/services/<이름>.service.ts`(abstract) + `board/infra/services/<이름>.service.impl.ts`(PrismaService 직접). 반환 `number | undefined`(레벨) 또는 존재확인.
- 근거: `domain.md` 통합패턴 표(LookupService = 타 BC 읽기 ACL, 인터페이스 domain/services·구현 infra/services). file-upload OHS와 달리 user는 OHS를 제공하지 않으므로 board ACL이 적절.

### 5.4 Level VO — **신규**
- **결정**: board 도메인에 전용 `Level` VO(1~10) 신설. `Integer`(min/max) 패턴 참고하되 명시성 위해 전용 VO. 위반 errorCode = `INVALID_BOARD_LEVEL`(SPEC 4.1/4.2)에 맞춰 throw. 회원 레벨 검증 errorCode `INVALID_USER_LEVEL`은 user BC 소유.
- ※ SPEC errorCode는 `INVALID_BOARD_LEVEL`(필드별 X, 레벨 3종 공통). VO 기본 errorCode 대신 명시 지정.

### 5.5 레벨 게이트 판정 위치
- `회원.level ≥ board.*Level`은 **단일 애그리거트 불변식이 아님**(Board+Member 동시참조) → **application 레이어(UseCase) + LookupService** 책임. 미달 시 403 `INSUFFICIENT_LEVEL`. 도메인 VO는 값 검증만. (SPEC 6장 명시)

### 5.6 file-upload purpose 정책 — **확인 필요**(F/G 시점)
- `getConfirmedFileInfo(fileId, expectedPurpose)`의 purpose는 `getUploadPolicy(purpose)` 정책 키. board 글 첨부용 purpose 값(예: `board-post`)이 file-upload 정책에 **등록돼 있어야** link 가능. 글 작성 구현(G 4.8) 전 file-upload 정책 추가 여부 확인.

---

## 6. errorCode 인벤토리 (SPEC 기준, UPPER_SNAKE_CASE)

| 코드 | 상태 | 위치 |
| ---- | ---- | ---- |
| `INVALID_BOARD_LEVEL` | 400 | Level VO / 게시판 생성·수정 |
| `MANAGER_NOT_FOUND` | 400 | managerId 회원 미존재 |
| `BOARD_NOT_FOUND` | 404 | 게시판 조회 |
| `POST_NOT_FOUND` | 404 | 글 조회 |
| `COMMENT_NOT_FOUND` | 404 | 댓글 조회 |
| `INSUFFICIENT_LEVEL` | 403 | 읽기/쓰기/댓글 레벨 게이트 |
| `NOT_POST_OWNER` | 403 | 글 수정(작성자 아님) |
| `FORBIDDEN_MODERATION` | 403 | 글/댓글 삭제 권한 없음 |
| `FILE_NOT_FOUND`/`FILE_NOT_CONFIRMED`/`FILE_PURPOSE_MISMATCH` | 400/404 | file-upload OHS 위임(4.8 첨부) |
