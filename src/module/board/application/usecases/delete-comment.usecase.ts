import { Injectable } from '@nestjs/common';
import {
  EntityNotFoundException,
  AuthorizationException,
} from '@shared/exception';
import {
  CommentRepository,
  PostRepository,
  BoardRepository,
} from '../../domain/repositories';

/**
 * 댓글 삭제 UseCase (SPEC 4.12).
 * 1. 댓글 존재 확인 — 없으면 404 COMMENT_NOT_FOUND
 * 2. 권한 판정:
 *    (a) 댓글 작성자 본인(authorId === userId)
 *    (b) 댓글이 달린 글이 속한 게시판의 관리자(board.managerId === userId)
 *    둘 다 아니면 403 FORBIDDEN_MODERATION
 * 3. 댓글 삭제
 */
@Injectable()
export class DeleteCommentUseCase {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postRepository: PostRepository,
    private readonly boardRepository: BoardRepository,
  ) {}

  async execute(dto: { commentId: string; userId: string }): Promise<void> {
    // 1. 댓글 존재 확인
    const comment = await this.commentRepository.findById(dto.commentId);

    if (!comment) {
      throw new EntityNotFoundException({
        entityName: 'Comment',
        errorCode: 'COMMENT_NOT_FOUND',
        id: dto.commentId,
      });
    }

    // 2. 권한 판정
    const isAuthor = comment.authorId === dto.userId;

    if (!isAuthor) {
      // 게시글 조회 → 게시판 조회 → 관리자 여부 확인
      const post = await this.postRepository.findById(comment.postId);
      const board = post
        ? await this.boardRepository.findById(post.boardId)
        : undefined;
      const isBoardManager =
        board !== undefined && board.managerId === dto.userId;

      if (!isBoardManager) {
        throw new AuthorizationException({
          message: '댓글을 삭제할 권한이 없습니다',
          errorCode: 'FORBIDDEN_MODERATION',
        });
      }
    }

    // 3. 댓글 삭제
    await this.commentRepository.delete(comment);
  }
}
