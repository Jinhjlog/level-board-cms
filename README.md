# level-board-cms

그누보드 계열 **레벨 기반 접근제어 게시판 CMS** 백엔드. NestJS + DDD(Domain-Driven Design) + Clean Architecture.
회원 레벨(1~10) 게이트 + 게시판별 단일 관리자 위임으로 게시판/글/댓글을 운영합니다.

> 이 프로젝트는 **AI 에이전트 기반 DDD 개발 프로세스**(Claude Code 스킬·룰·서브에이전트)로 구축하며,
> 그 개발 속도·비용을 측정합니다 → **[MEASUREMENT.md](MEASUREMENT.md)**.

---

## 핵심 기능 (게시판 CMS)

- **레벨 게이트** — 게시판마다 읽기/쓰기/댓글 최소 레벨을 두고, `회원 레벨 ≥ 게시판 레벨`로 접근 제어
- **단일 관리자 위임** — 게시판당 관리자 1명(`managerId`)이 자기 게시판의 글·댓글 운영(삭제)
- **글/댓글 + 첨부** — 회원이 글·댓글 작성, 이미지 첨부(`file-upload` OHS 연동)
- 계약: **[docs/features/board/](docs/features/board/)** (`SPEC.md` + `api-spec.md`)

---

## 빠른 시작

```bash
git clone <이 레포 URL> level-board-cms
cd level-board-cms
npm install

# DB 시작 + 마이그레이션 + 시드
npm run docker:up:dev
npm run prisma:migrate:dev
npm run prisma:seed:dev prisma/seed-admins.ts

# 개발 서버
npm run start:dev
```

- API: http://localhost:3000
- Swagger: http://localhost:3000/docs
- 기본 관리자 계정: `admin` / `Test@123`

> 새로 포크해 다른 프로젝트로 쓸 경우 `npm run bootstrap`이 프로젝트명·`.env.development`·git 초기화를 처리합니다. `.env.development`의 DB·JWT 시크릿 값은 직접 채우세요.

---

## 주요 명령어

```bash
# 개발
npm run start:dev              # 개발 서버 (watch mode)
npm run build                  # 빌드

# 코드 품질
npm run lint                   # ESLint
npm run format                 # Prettier

# 테스트
npm test                       # 유닛 테스트
npm run test:e2e               # E2E 테스트 (Testcontainers MariaDB)

# 데이터베이스
npm run prisma:migrate:dev     # 마이그레이션 생성 + 실행
npm run prisma:studio:dev      # Prisma Studio (DB GUI)

# Docker
npm run docker:up:dev          # MariaDB 시작
npm run docker:down:dev        # MariaDB 종료
```

스크립트 상세: [docs/setup-scripts.md](docs/setup-scripts.md)

---

## 기술 스택

| 구분      | 선택                                  |
| --------- | ------------------------------------- |
| Runtime   | Node.js + NestJS 11                   |
| Language  | TypeScript                            |
| Database  | MariaDB + Prisma ORM                  |
| Auth      | JWT (Access + Refresh Token Rotation) |
| API Docs  | Swagger (OpenAPI)                     |
| Testing   | Jest + Testcontainers (E2E)           |
| Container | Docker + Docker Compose               |

---

## 아키텍처

DDD 4계층(domain / application / infra / presentation)을 모듈마다 동일하게 적용하고,
그 위에 통합 패턴(QueryService / LookupService / Port·Adapter / OHS)을 **필요할 때만** 얹습니다.

### 모듈 구성

| 모듈          | 역할                                            |
| ------------- | ----------------------------------------------- |
| `board`       | 게시판/글/댓글 — 레벨 게이트 + 단일 관리자 위임 |
| `user`        | 회원 인증(JWT, Refresh Rotation) + 회원 레벨    |
| `admin`       | 관리자 인증(JWT, RBAC: SUPER_ADMIN/ADMIN)       |
| `file-upload` | Presigned URL → confirm · Port/Adapter + OHS    |
| `health`      | DB/메모리/디스크 헬스체크                       |

- 통합 패턴 실증: `board → user`(LookupService, 회원 레벨 조회) · `board → file-upload`(OHS, 글 첨부) · `file-upload`(Port/Adapter, 스토리지 추상화)

---

## AI 에이전트 기반 개발

이 프로젝트는 Claude Code로 DDD 백엔드를 **일관되게** 개발하기 위한 설정을 포함합니다.
(아래는 사람이 읽는 문서가 아니라 **에이전트(Claude Code)가 읽는** 진입점·규칙입니다.)

- **[CLAUDE.md](CLAUDE.md)** — Claude Code가 자동 로드하는 에이전트 진입점. 아래 rules와 dev-process를 가리킨다.
- **`.claude/rules/`** — 항상 준수하는 범용 규칙 (컨벤션·검증·도메인·git·위임·모델). 고유값은 고정하지 않고 "조사해서 따름".
- **`.claude/skills/`** — 레이어별 구현 패턴 책 (domain / infrastructure / application / presentation-layer, e2e-patterns, swagger-bot, commit-bot).
- **`.claude/agents/`** — 격리 실행 서브에이전트 (`api-implementer`, `convention-reviewer`).
- **[docs/dev-process.md](docs/dev-process.md)** — Contract-First + TDD 개발 절차, 검토 게이트, 병렬 G 자동화.
- **[MEASUREMENT.md](MEASUREMENT.md)** — 이 프로세스로 게시판 CMS를 만드는 **개발 속도·비용 측정** 기록.

핵심 원칙: **판단은 사람, 실행은 에이전트. 컨벤션은 고정하지 말고 조사한다.**

---

## 문서

| 문서                                           | 설명                         |
| ---------------------------------------------- | ---------------------------- |
| [docs/features/board/](docs/features/board/)   | 게시판 CMS SPEC + API 계약   |
| [docs/dev-process.md](docs/dev-process.md)     | AI 에이전트 개발 프로세스    |
| [MEASUREMENT.md](MEASUREMENT.md)               | 개발 속도·비용 측정 기록     |
| [docs/setup-scripts.md](docs/setup-scripts.md) | 부트스트랩·워크트리 스크립트 |
| [docs/databases/](docs/databases/)             | 테이블 명세                  |
| [docs/features/](docs/features/)               | 모듈별 SPEC / api-spec       |
| [docs/e2e/GUIDE.md](docs/e2e/GUIDE.md)         | E2E 테스트 작성 가이드       |
