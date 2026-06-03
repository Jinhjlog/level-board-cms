import { ulid } from 'ulid';
import { PrismaService } from '../../../src/module/core/database/prisma.service';

// ─── Board ──────────────────────────────────────────────────────────────────

interface SeedBoardOptions {
  id?: string;
  name?: string;
  readLevel?: number;
  writeLevel?: number;
  commentLevel?: number;
  managerId?: string | null;
}

interface SeededBoard {
  id: string;
  name: string;
  readLevel: number;
  writeLevel: number;
  commentLevel: number;
  managerId: string | null;
}

/** 테스트용 게시판을 DB에 생성합니다. */
export async function seedBoard(
  prisma: PrismaService,
  overrides: SeedBoardOptions = {},
): Promise<SeededBoard> {
  const id = overrides.id ?? ulid();
  const board = await prisma.board.create({
    data: {
      id,
      name: overrides.name ?? `게시판-${id.slice(-6)}`,
      readLevel: overrides.readLevel ?? 1,
      writeLevel: overrides.writeLevel ?? 1,
      commentLevel: overrides.commentLevel ?? 1,
      managerId: overrides.managerId ?? null,
    },
  });

  return {
    id: board.id,
    name: board.name,
    readLevel: board.readLevel,
    writeLevel: board.writeLevel,
    commentLevel: board.commentLevel,
    managerId: board.managerId,
  };
}

// ─── Post ───────────────────────────────────────────────────────────────────

interface SeedPostOptions {
  id?: string;
  boardId: string;
  authorId: string;
  title?: string;
  content?: string;
}

interface SeededPost {
  id: string;
  boardId: string;
  authorId: string;
  title: string;
  content: string;
}

/** 테스트용 글을 DB에 생성합니다. */
export async function seedPost(
  prisma: PrismaService,
  overrides: SeedPostOptions,
): Promise<SeededPost> {
  const id = overrides.id ?? ulid();
  const post = await prisma.post.create({
    data: {
      id,
      boardId: overrides.boardId,
      authorId: overrides.authorId,
      title: overrides.title ?? `글-${id.slice(-6)}`,
      content: overrides.content ?? '본문 내용입니다.',
    },
  });

  return {
    id: post.id,
    boardId: post.boardId,
    authorId: post.authorId,
    title: post.title,
    content: post.content,
  };
}

// ─── Comment ────────────────────────────────────────────────────────────────

interface SeedCommentOptions {
  id?: string;
  postId: string;
  authorId: string;
  content?: string;
}

interface SeededComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
}

/** 테스트용 댓글을 DB에 생성합니다. */
export async function seedComment(
  prisma: PrismaService,
  overrides: SeedCommentOptions,
): Promise<SeededComment> {
  const id = overrides.id ?? ulid();
  const comment = await prisma.comment.create({
    data: {
      id,
      postId: overrides.postId,
      authorId: overrides.authorId,
      content: overrides.content ?? '댓글 내용입니다.',
    },
  });

  return {
    id: comment.id,
    postId: comment.postId,
    authorId: comment.authorId,
    content: comment.content,
  };
}

// ─── PostAttachment ───────────────────────────────────────────────────────────

interface SeedPostAttachmentOptions {
  id?: string;
  postId: string;
  storageKey?: string;
  url?: string;
  originalName?: string;
  mimeType?: string;
  fileSize?: number | null;
  sortOrder?: number;
}

interface SeededPostAttachment {
  id: string;
  postId: string;
  url: string;
  originalName: string;
  mimeType: string;
}

/** 테스트용 글 첨부(스냅샷)를 DB에 생성합니다. */
export async function seedPostAttachment(
  prisma: PrismaService,
  overrides: SeedPostAttachmentOptions,
): Promise<SeededPostAttachment> {
  const id = overrides.id ?? ulid();
  const attachment = await prisma.postAttachment.create({
    data: {
      id,
      postId: overrides.postId,
      storageKey: overrides.storageKey ?? `2026/01/${id}.png`,
      url: overrides.url ?? `http://localhost:3000/uploads/2026/01/${id}.png`,
      originalName: overrides.originalName ?? 'screenshot.png',
      mimeType: overrides.mimeType ?? 'image/png',
      fileSize: overrides.fileSize ?? 1048576,
      sortOrder: overrides.sortOrder ?? 0,
    },
  });

  return {
    id: attachment.id,
    postId: attachment.postId,
    url: attachment.url,
    originalName: attachment.originalName,
    mimeType: attachment.mimeType,
  };
}
