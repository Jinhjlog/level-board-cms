import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../../src/module/core/database/prisma.service';
import { createTestApp } from '../helpers/test-app.helper';
import { cleanDatabase } from '../helpers/db-cleanup.helper';
import { expectError, expectSuccess } from '../helpers/assertion.helper';
import {
  seedSuperAdmin,
  seedAdmin,
  seedUser,
  seedBoard,
  seedPost,
  seedComment,
  seedUploadedFile,
} from '../helpers/seed';

// ─── 응답 타입 ────────────────────────────────────────────────────────────────

interface BoardDetailBody {
  id: string;
  name: string;
  readLevel: number;
  writeLevel: number;
  commentLevel: number;
  managerId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminBoardListItemBody {
  id: string;
  name: string;
  readLevel: number;
  writeLevel: number;
  commentLevel: number;
  managerId: string | null;
  createdAt: string;
}

interface AdminBoardListBody {
  items: AdminBoardListItemBody[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

interface BoardListItemBody {
  id: string;
  name: string;
  readLevel: number;
  writeLevel: number;
  commentLevel: number;
}

interface BoardListBody {
  items: BoardListItemBody[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

interface PostListItemBody {
  id: string;
  title: string;
  authorId: string;
  createdAt: string;
}

interface PostListBody {
  items: PostListItemBody[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

interface PostAttachmentBody {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  fileSize: number | null;
  sortOrder: number;
}

interface PostDetailBody {
  id: string;
  boardId: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  attachments: PostAttachmentBody[];
}

interface CommentDetailBody {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

// ─── 상수 ─────────────────────────────────────────────────────────────────────

const ADMIN_LOGIN_URL = '/api/v1/admin-auth/login';
const USER_LOGIN_URL = '/api/v1/user-auth/login';
const ADMIN_BOARDS_URL = '/api/v1/admin/boards';
const BOARDS_URL = '/api/v1/boards';
const POSTS_URL = '/api/v1/posts';
const COMMENTS_URL = '/api/v1/comments';

const ADMIN_PW = 'P@ssw0rd!';
const USER_PW = 'Test1234!';

describe('게시판 CMS E2E', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  // ── 로그인 헬퍼 ──

  async function loginAdmin(loginId: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post(ADMIN_LOGIN_URL)
      .send({ loginId, password: ADMIN_PW });
    return (res.body as { accessToken: string }).accessToken;
  }

  async function loginUser(email: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post(USER_LOGIN_URL)
      .send({ email, password: USER_PW });
    return (res.body as { accessToken: string }).accessToken;
  }

  /** SUPER_ADMIN 시드 후 토큰 반환 */
  async function superAdminToken(): Promise<string> {
    const admin = await seedSuperAdmin(prisma, {
      loginId: 'super',
      password: ADMIN_PW,
    });
    return loginAdmin(admin.loginId);
  }

  /** 회원 시드 후 {userId, token} 반환 */
  async function member(
    level = 1,
    email?: string,
  ): Promise<{ userId: string; token: string }> {
    const user = await seedUser(prisma, {
      email: email ?? `m-${Math.floor(level)}-${Date.now() % 100000}@test.com`,
      password: USER_PW,
      level,
    });
    const token = await loginUser(user.email);
    return { userId: user.id, token };
  }

  const bearer = (t: string) => ({ Authorization: `Bearer ${t}` });

  // ════════════════════════════════════════════════════════════════════════
  // 게시판 관리 — admin/boards (SUPER_ADMIN)
  // ════════════════════════════════════════════════════════════════════════

  describe('POST /api/v1/admin/boards', () => {
    it('TC-BOARD-001: 게시판 생성 성공', async () => {
      const token = await superAdminToken();

      const res = await request(app.getHttpServer())
        .post(ADMIN_BOARDS_URL)
        .set(bearer(token))
        .send({ name: '공지', readLevel: 1, writeLevel: 2, commentLevel: 1 });

      const body = expectSuccess<BoardDetailBody>(res, 201);
      expect(body.id).toBeDefined();
      expect(body.name).toBe('공지');
      expect(body.readLevel).toBe(1);
      expect(body.writeLevel).toBe(2);
      expect(body.commentLevel).toBe(1);
      expect(body.managerId).toBeNull();
    });

    it('TC-BOARD-002: 레벨 범위 위반 시 400', async () => {
      const token = await superAdminToken();

      const res = await request(app.getHttpServer())
        .post(ADMIN_BOARDS_URL)
        .set(bearer(token))
        .send({ name: '공지', readLevel: 1, writeLevel: 11, commentLevel: 1 });

      expectError(res, { statusCode: 400, errorCode: 'INVALID_BOARD_LEVEL' });
    });

    it('TC-BOARD-003: managerId가 존재하지 않는 회원이면 400', async () => {
      const token = await superAdminToken();

      const res = await request(app.getHttpServer())
        .post(ADMIN_BOARDS_URL)
        .set(bearer(token))
        .send({
          name: '공지',
          readLevel: 1,
          writeLevel: 1,
          commentLevel: 1,
          managerId: '01HXK3G5N7MZQR8BVWEY6JKFP4',
        });

      expectError(res, { statusCode: 400, errorCode: 'MANAGER_NOT_FOUND' });
    });

    it('TC-BOARD-004: 비 SUPER_ADMIN 접근 시 403 (대표 권한 검증)', async () => {
      const admin = await seedAdmin(prisma, {
        loginId: 'normal-admin',
        password: ADMIN_PW,
        role: 'ADMIN',
      });
      const token = await loginAdmin(admin.loginId);

      const res = await request(app.getHttpServer())
        .post(ADMIN_BOARDS_URL)
        .set(bearer(token))
        .send({ name: '공지', readLevel: 1, writeLevel: 1, commentLevel: 1 });

      expectError(res, { statusCode: 403, errorCode: 'FORBIDDEN_ADMIN_ROLE' });
    });
  });

  describe('PATCH /api/v1/admin/boards/:boardId', () => {
    it('TC-BOARD-005: 게시판 수정 성공 (전달 필드만)', async () => {
      const token = await superAdminToken();
      const board = await seedBoard(prisma, {
        name: '원래',
        readLevel: 1,
        writeLevel: 1,
        commentLevel: 1,
      });

      const res = await request(app.getHttpServer())
        .patch(`${ADMIN_BOARDS_URL}/${board.id}`)
        .set(bearer(token))
        .send({ name: '자유', readLevel: 3 });

      const body = expectSuccess<BoardDetailBody>(res, 200);
      expect(body.name).toBe('자유');
      expect(body.readLevel).toBe(3);
      expect(body.writeLevel).toBe(1);
      expect(body.commentLevel).toBe(1);
    });

    it('TC-BOARD-006: managerId에 null 전송 시 관리자 해제', async () => {
      const token = await superAdminToken();
      const manager = await seedUser(prisma, { level: 1 });
      const board = await seedBoard(prisma, { managerId: manager.id });

      const res = await request(app.getHttpServer())
        .patch(`${ADMIN_BOARDS_URL}/${board.id}`)
        .set(bearer(token))
        .send({ managerId: null });

      const body = expectSuccess<BoardDetailBody>(res, 200);
      expect(body.managerId).toBeNull();
    });

    it('TC-BOARD-007: 없는 게시판 수정 시 404', async () => {
      const token = await superAdminToken();

      const res = await request(app.getHttpServer())
        .patch(`${ADMIN_BOARDS_URL}/01HXK3G5N7MZQR8BVWEY6JKFP4`)
        .set(bearer(token))
        .send({ name: '자유' });

      expectError(res, { statusCode: 404, errorCode: 'BOARD_NOT_FOUND' });
    });
  });

  describe('DELETE /api/v1/admin/boards/:boardId', () => {
    it('TC-BOARD-008: 게시판 삭제 성공 + 글·댓글 cascade', async () => {
      const token = await superAdminToken();
      const author = await seedUser(prisma, { level: 1 });
      const board = await seedBoard(prisma);
      const post = await seedPost(prisma, {
        boardId: board.id,
        authorId: author.id,
      });
      await seedComment(prisma, { postId: post.id, authorId: author.id });

      const res = await request(app.getHttpServer())
        .delete(`${ADMIN_BOARDS_URL}/${board.id}`)
        .set(bearer(token));

      expect(res.status).toBe(204);
      expect(
        await prisma.board.findUnique({ where: { id: board.id } }),
      ).toBeNull();
      expect(await prisma.post.count({ where: { boardId: board.id } })).toBe(0);
      expect(await prisma.comment.count({ where: { postId: post.id } })).toBe(
        0,
      );
    });

    it('TC-BOARD-009: 없는 게시판 삭제 시 404', async () => {
      const token = await superAdminToken();

      const res = await request(app.getHttpServer())
        .delete(`${ADMIN_BOARDS_URL}/01HXK3G5N7MZQR8BVWEY6JKFP4`)
        .set(bearer(token));

      expectError(res, { statusCode: 404, errorCode: 'BOARD_NOT_FOUND' });
    });
  });

  describe('GET /api/v1/admin/boards', () => {
    it('TC-BOARD-010: 게시판 목록(관리) 성공 + 페이지네이션', async () => {
      const token = await superAdminToken();
      await seedBoard(prisma, { name: 'A' });
      await seedBoard(prisma, { name: 'B' });
      await seedBoard(prisma, { name: 'C' });

      const res = await request(app.getHttpServer())
        .get(`${ADMIN_BOARDS_URL}?page=1&limit=20`)
        .set(bearer(token));

      const body = expectSuccess<AdminBoardListBody>(res, 200);
      expect(body.items).toHaveLength(3);
      expect(body.totalCount).toBe(3);
      expect(body.currentPage).toBe(1);
      expect(body.items[0]).toHaveProperty('managerId');
      expect(body.items[0]).toHaveProperty('createdAt');
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // 회원용 게시판/글 — boards (회원)
  // ════════════════════════════════════════════════════════════════════════

  describe('GET /api/v1/boards', () => {
    it('TC-BOARD-011: 회원용 게시판 목록 성공', async () => {
      const { token } = await member(1);
      await seedBoard(prisma, { name: 'A' });
      await seedBoard(prisma, { name: 'B' });

      const res = await request(app.getHttpServer())
        .get(BOARDS_URL)
        .set(bearer(token));

      const body = expectSuccess<BoardListBody>(res, 200);
      expect(body.items).toHaveLength(2);
      expect(body.totalCount).toBe(2);
      expect(body.items[0]).not.toHaveProperty('managerId');
    });

    it('TC-BOARD-012: 인증 없이 접근 시 401 (대표 인증 검증)', async () => {
      const res = await request(app.getHttpServer()).get(BOARDS_URL);

      expectError(res, { statusCode: 401, errorCode: 'ACCESS_TOKEN_MISSING' });
    });
  });

  describe('GET /api/v1/boards/:boardId/posts', () => {
    it('TC-BOARD-013: 글 목록 성공 (readLevel 통과)', async () => {
      const { userId, token } = await member(3);
      const board = await seedBoard(prisma, { readLevel: 2 });
      await seedPost(prisma, {
        boardId: board.id,
        authorId: userId,
        title: '첫글',
      });
      await seedPost(prisma, {
        boardId: board.id,
        authorId: userId,
        title: '둘째글',
      });

      const res = await request(app.getHttpServer())
        .get(`${BOARDS_URL}/${board.id}/posts`)
        .set(bearer(token));

      const body = expectSuccess<PostListBody>(res, 200);
      expect(body.items).toHaveLength(2);
      expect(body.totalCount).toBe(2);
      expect(body.items[0]).toHaveProperty('authorId');
    });

    it('TC-BOARD-014: readLevel 미달 시 403', async () => {
      const { token } = await member(2);
      const board = await seedBoard(prisma, { readLevel: 5 });

      const res = await request(app.getHttpServer())
        .get(`${BOARDS_URL}/${board.id}/posts`)
        .set(bearer(token));

      expectError(res, { statusCode: 403, errorCode: 'INSUFFICIENT_LEVEL' });
    });

    it('TC-BOARD-015: 없는 게시판 글 목록 404', async () => {
      const { token } = await member(5);

      const res = await request(app.getHttpServer())
        .get(`${BOARDS_URL}/01HXK3G5N7MZQR8BVWEY6JKFP4/posts`)
        .set(bearer(token));

      expectError(res, { statusCode: 404, errorCode: 'BOARD_NOT_FOUND' });
    });

    it('TC-BOARD-016: 글 목록 keyword 필터', async () => {
      const { userId, token } = await member(3);
      const board = await seedBoard(prisma, { readLevel: 1 });
      await seedPost(prisma, {
        boardId: board.id,
        authorId: userId,
        title: '공지A',
      });
      await seedPost(prisma, {
        boardId: board.id,
        authorId: userId,
        title: '잡담B',
      });

      const res = await request(app.getHttpServer())
        .get(`${BOARDS_URL}/${board.id}/posts?keyword=공지`)
        .set(bearer(token));

      const body = expectSuccess<PostListBody>(res, 200);
      expect(body.items).toHaveLength(1);
      expect(body.items[0].title).toBe('공지A');
    });
  });

  describe('POST /api/v1/boards/:boardId/posts', () => {
    it('TC-BOARD-017: 글 작성 성공 (writeLevel 통과)', async () => {
      const { userId, token } = await member(3);
      const board = await seedBoard(prisma, { writeLevel: 2 });

      const res = await request(app.getHttpServer())
        .post(`${BOARDS_URL}/${board.id}/posts`)
        .set(bearer(token))
        .send({ title: '새 글', content: '본문' });

      const body = expectSuccess<PostDetailBody>(res, 201);
      expect(body.title).toBe('새 글');
      expect(body.content).toBe('본문');
      expect(body.boardId).toBe(board.id);
      expect(body.authorId).toBe(userId);
      expect(body.attachments).toEqual([]);
    });

    it('TC-BOARD-018: writeLevel 미달 시 403', async () => {
      const { token } = await member(2);
      const board = await seedBoard(prisma, { writeLevel: 5 });

      const res = await request(app.getHttpServer())
        .post(`${BOARDS_URL}/${board.id}/posts`)
        .set(bearer(token))
        .send({ title: '새 글', content: '본문' });

      expectError(res, { statusCode: 403, errorCode: 'INSUFFICIENT_LEVEL' });
    });

    it('TC-BOARD-019: 글 작성 + 첨부 연결', async () => {
      const { userId, token } = await member(3);
      const board = await seedBoard(prisma, { writeLevel: 1 });
      const file = await seedUploadedFile(prisma, {
        uploadedBy: userId,
        status: 'CONFIRMED',
        purpose: 'attachment',
        originalName: 'doc.png',
        mimeType: 'image/png',
        confirmedAt: new Date(),
      });

      const res = await request(app.getHttpServer())
        .post(`${BOARDS_URL}/${board.id}/posts`)
        .set(bearer(token))
        .send({ title: '첨부글', content: '본문', attachmentIds: [file.id] });

      const body = expectSuccess<PostDetailBody>(res, 201);
      expect(body.attachments).toHaveLength(1);
      expect(body.attachments[0].originalName).toBe('doc.png');
      expect(body.attachments[0].url).toBeDefined();
    });

    it('TC-BOARD-020: 없는 게시판에 글 작성 404', async () => {
      const { token } = await member(5);

      const res = await request(app.getHttpServer())
        .post(`${BOARDS_URL}/01HXK3G5N7MZQR8BVWEY6JKFP4/posts`)
        .set(bearer(token))
        .send({ title: '새 글', content: '본문' });

      expectError(res, { statusCode: 404, errorCode: 'BOARD_NOT_FOUND' });
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // 글 상세/수정/삭제 + 댓글 — posts (회원)
  // ════════════════════════════════════════════════════════════════════════

  describe('GET /api/v1/posts/:postId', () => {
    it('TC-BOARD-021: 글 상세 성공', async () => {
      const { userId, token } = await member(3);
      const board = await seedBoard(prisma, { readLevel: 1 });
      const post = await seedPost(prisma, {
        boardId: board.id,
        authorId: userId,
        title: '제목',
        content: '내용',
      });

      const res = await request(app.getHttpServer())
        .get(`${POSTS_URL}/${post.id}`)
        .set(bearer(token));

      const body = expectSuccess<PostDetailBody>(res, 200);
      expect(body.id).toBe(post.id);
      expect(body.boardId).toBe(board.id);
      expect(body.title).toBe('제목');
      expect(body.content).toBe('내용');
      expect(body).toHaveProperty('attachments');
    });

    it('TC-BOARD-022: readLevel 미달 시 403', async () => {
      const author = await seedUser(prisma, { level: 5 });
      const { token } = await member(2);
      const board = await seedBoard(prisma, { readLevel: 5 });
      const post = await seedPost(prisma, {
        boardId: board.id,
        authorId: author.id,
      });

      const res = await request(app.getHttpServer())
        .get(`${POSTS_URL}/${post.id}`)
        .set(bearer(token));

      expectError(res, { statusCode: 403, errorCode: 'INSUFFICIENT_LEVEL' });
    });

    it('TC-BOARD-023: 없는 글 상세 404', async () => {
      const { token } = await member(5);

      const res = await request(app.getHttpServer())
        .get(`${POSTS_URL}/01HXK3G5N7MZQR8BVWEY6JKFP4`)
        .set(bearer(token));

      expectError(res, { statusCode: 404, errorCode: 'POST_NOT_FOUND' });
    });
  });

  describe('PATCH /api/v1/posts/:postId', () => {
    it('TC-BOARD-024: 글 수정 성공 (작성자 본인)', async () => {
      const { userId, token } = await member(3);
      const board = await seedBoard(prisma, { readLevel: 1, writeLevel: 1 });
      const post = await seedPost(prisma, {
        boardId: board.id,
        authorId: userId,
        title: '원래',
        content: '내용',
      });

      const res = await request(app.getHttpServer())
        .patch(`${POSTS_URL}/${post.id}`)
        .set(bearer(token))
        .send({ title: '수정됨' });

      const body = expectSuccess<PostDetailBody>(res, 200);
      expect(body.title).toBe('수정됨');
      expect(body.content).toBe('내용');
    });

    it('TC-BOARD-025: 작성자가 아니면 403', async () => {
      const author = await seedUser(prisma, { level: 3 });
      const { token } = await member(3);
      const board = await seedBoard(prisma);
      const post = await seedPost(prisma, {
        boardId: board.id,
        authorId: author.id,
      });

      const res = await request(app.getHttpServer())
        .patch(`${POSTS_URL}/${post.id}`)
        .set(bearer(token))
        .send({ title: '수정 시도' });

      expectError(res, { statusCode: 403, errorCode: 'NOT_POST_OWNER' });
    });

    it('TC-BOARD-026: 없는 글 수정 404', async () => {
      const { token } = await member(3);

      const res = await request(app.getHttpServer())
        .patch(`${POSTS_URL}/01HXK3G5N7MZQR8BVWEY6JKFP4`)
        .set(bearer(token))
        .send({ title: '수정' });

      expectError(res, { statusCode: 404, errorCode: 'POST_NOT_FOUND' });
    });
  });

  describe('DELETE /api/v1/posts/:postId', () => {
    it('TC-BOARD-027: 글 삭제 성공 (작성자 본인) + 댓글 cascade', async () => {
      const { userId, token } = await member(3);
      const board = await seedBoard(prisma);
      const post = await seedPost(prisma, {
        boardId: board.id,
        authorId: userId,
      });
      await seedComment(prisma, { postId: post.id, authorId: userId });

      const res = await request(app.getHttpServer())
        .delete(`${POSTS_URL}/${post.id}`)
        .set(bearer(token));

      expect(res.status).toBe(204);
      expect(
        await prisma.post.findUnique({ where: { id: post.id } }),
      ).toBeNull();
      expect(await prisma.comment.count({ where: { postId: post.id } })).toBe(
        0,
      );
    });

    it('TC-BOARD-028: 게시판 관리자가 타인 글 삭제 성공', async () => {
      const authorA = await seedUser(prisma, { level: 3 });
      const managerB = await member(3);
      const board = await seedBoard(prisma, { managerId: managerB.userId });
      const post = await seedPost(prisma, {
        boardId: board.id,
        authorId: authorA.id,
      });

      const res = await request(app.getHttpServer())
        .delete(`${POSTS_URL}/${post.id}`)
        .set(bearer(managerB.token));

      expect(res.status).toBe(204);
    });

    it('TC-BOARD-029: 권한 없는 회원의 글 삭제 403', async () => {
      const authorA = await seedUser(prisma, { level: 3 });
      const userC = await member(3);
      const board = await seedBoard(prisma);
      const post = await seedPost(prisma, {
        boardId: board.id,
        authorId: authorA.id,
      });

      const res = await request(app.getHttpServer())
        .delete(`${POSTS_URL}/${post.id}`)
        .set(bearer(userC.token));

      expectError(res, { statusCode: 403, errorCode: 'FORBIDDEN_MODERATION' });
    });

    it('TC-BOARD-030: 없는 글 삭제 404', async () => {
      const { token } = await member(3);

      const res = await request(app.getHttpServer())
        .delete(`${POSTS_URL}/01HXK3G5N7MZQR8BVWEY6JKFP4`)
        .set(bearer(token));

      expectError(res, { statusCode: 404, errorCode: 'POST_NOT_FOUND' });
    });
  });

  describe('POST /api/v1/posts/:postId/comments', () => {
    it('TC-BOARD-031: 댓글 작성 성공 (commentLevel 통과)', async () => {
      const { userId, token } = await member(3);
      const board = await seedBoard(prisma, { commentLevel: 2 });
      const post = await seedPost(prisma, {
        boardId: board.id,
        authorId: userId,
      });

      const res = await request(app.getHttpServer())
        .post(`${POSTS_URL}/${post.id}/comments`)
        .set(bearer(token))
        .send({ content: '댓글입니다' });

      const body = expectSuccess<CommentDetailBody>(res, 201);
      expect(body.postId).toBe(post.id);
      expect(body.authorId).toBe(userId);
      expect(body.content).toBe('댓글입니다');
    });

    it('TC-BOARD-032: commentLevel 미달 시 403', async () => {
      const author = await seedUser(prisma, { level: 5 });
      const { token } = await member(2);
      const board = await seedBoard(prisma, { readLevel: 1, commentLevel: 5 });
      const post = await seedPost(prisma, {
        boardId: board.id,
        authorId: author.id,
      });

      const res = await request(app.getHttpServer())
        .post(`${POSTS_URL}/${post.id}/comments`)
        .set(bearer(token))
        .send({ content: '댓글' });

      expectError(res, { statusCode: 403, errorCode: 'INSUFFICIENT_LEVEL' });
    });

    it('TC-BOARD-033: 없는 글에 댓글 작성 404', async () => {
      const { token } = await member(3);

      const res = await request(app.getHttpServer())
        .post(`${POSTS_URL}/01HXK3G5N7MZQR8BVWEY6JKFP4/comments`)
        .set(bearer(token))
        .send({ content: '댓글' });

      expectError(res, { statusCode: 404, errorCode: 'POST_NOT_FOUND' });
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // 댓글 삭제 — comments (회원)
  // ════════════════════════════════════════════════════════════════════════

  describe('DELETE /api/v1/comments/:commentId', () => {
    it('TC-BOARD-034: 댓글 삭제 성공 (작성자 본인)', async () => {
      const { userId, token } = await member(3);
      const board = await seedBoard(prisma);
      const post = await seedPost(prisma, {
        boardId: board.id,
        authorId: userId,
      });
      const comment = await seedComment(prisma, {
        postId: post.id,
        authorId: userId,
      });

      const res = await request(app.getHttpServer())
        .delete(`${COMMENTS_URL}/${comment.id}`)
        .set(bearer(token));

      expect(res.status).toBe(204);
      expect(
        await prisma.comment.findUnique({ where: { id: comment.id } }),
      ).toBeNull();
    });

    it('TC-BOARD-035: 권한 없는 회원의 댓글 삭제 403', async () => {
      const authorA = await seedUser(prisma, { level: 3 });
      const userC = await member(3);
      const board = await seedBoard(prisma);
      const post = await seedPost(prisma, {
        boardId: board.id,
        authorId: authorA.id,
      });
      const comment = await seedComment(prisma, {
        postId: post.id,
        authorId: authorA.id,
      });

      const res = await request(app.getHttpServer())
        .delete(`${COMMENTS_URL}/${comment.id}`)
        .set(bearer(userC.token));

      expectError(res, { statusCode: 403, errorCode: 'FORBIDDEN_MODERATION' });
    });

    it('TC-BOARD-036: 없는 댓글 삭제 404', async () => {
      const { token } = await member(3);

      const res = await request(app.getHttpServer())
        .delete(`${COMMENTS_URL}/01HXK3G5N7MZQR8BVWEY6JKFP4`)
        .set(bearer(token));

      expectError(res, { statusCode: 404, errorCode: 'COMMENT_NOT_FOUND' });
    });
  });
});
