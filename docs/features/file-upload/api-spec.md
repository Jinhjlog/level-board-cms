# 파일 업로드 — API Spec (File Upload)

> SPEC.md(배경·목표·범위)의 계약 산출물. API 1개 = 한 섹션. (실제 컨트롤러 라우트 기준 — 구현 완료.)
> 발급/확인 동작은 관리자(`/admin/files`)·회원(`/files`) 동일, 인증·경로만 다름.

## 4.1 업로드 URL 발급 — 관리자 (`POST /api/v1/admin/files/upload-url`)

- [x] 관리자 인증 필요(`@AdminAuth`)
- [x] `파일명`, `MIME 타입`, `파일 크기`, `용도`를 입력받아 Presigned URL 발급
- [x] 용도별 허용 MIME 위반 → 400(`MIME_TYPE_NOT_ALLOWED`)
- [x] 용도별 최대 크기 초과 → 400(`FILE_SIZE_EXCEEDED`)
- [x] 지원하지 않는 용도 → 400(`UNSUPPORTED_PURPOSE`)
- [x] `PENDING` 상태로 DB 저장, 15분 만료
- [x] 성공 시 201 + Presigned URL + 파일 ID

## 4.2 업로드 확인 — 관리자 (`POST /api/v1/admin/files/:fileId/confirm`)

- [x] 관리자 인증 필요(`@AdminAuth`)
- [x] 스토리지 파일 존재 검증 → 400(`FILE_NOT_UPLOADED`)
- [x] 없는 파일 ID → 404(`FILE_NOT_FOUND`)
- [x] 이미 확인 → 400(`FILE_ALREADY_CONFIRMED`)
- [x] 만료 → 400(`FILE_UPLOAD_EXPIRED`)
- [x] 성공 시 `CONFIRMED` + `confirmed_at` 기록, 200
- [x] `editor-content` 용도는 confirm 시 자동 link

## 4.3 업로드 URL 발급 — 회원 (`POST /api/v1/files/upload-url`)

- [x] 회원 인증 필요(`@UserAuth`)
- [x] 동작·검증은 4.1과 동일

## 4.4 업로드 확인 — 회원 (`POST /api/v1/files/:fileId/confirm`)

- [x] 회원 인증 필요(`@UserAuth`)
- [x] 동작·검증은 4.2와 동일

---

## 비엔드포인트 (스케줄러 · 아키텍처 · 개발용)

**고아 파일 정리 (크론)**

- [x] 만료된 `PENDING` 파일 삭제 (DB + 스토리지)
- [x] 미연결 `CONFIRMED` 파일 삭제 (24시간 경과, DB + 스토리지)
- [x] 매일 오전 2시 크론잡 실행

**아키텍처**

- [x] `FileStoragePort` 추상화 (Port/Adapter 패턴)
- [x] `MockFileStorageAdapter` 개발 환경용 어댑터 (로컬 파일시스템)
- [x] `UploadedFileAttachmentService` OHS (다른 BC에서 파일 첨부 시 사용 — 현재 `board` BC가 글 첨부에 소비)

**개발용 (dev only)**

- [x] `PUT /api/v1/dev/upload/*` — Mock 스토리지 업로드 수신(개발 환경 전용, 프로덕션 비노출)
