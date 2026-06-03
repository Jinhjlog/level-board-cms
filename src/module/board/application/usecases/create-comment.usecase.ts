import { Injectable } from '@nestjs/common';
import { BoundedString } from '@lib/domain';
import {
  AuthorizationException,
  EntityNotFoundException,
} from '@shared/exception';
import { Comment } from '../../domain/models/comment';
import { PostRepository } from '../../domain/repositories/post.repository';
import { BoardRepository } from '../../domain/repositories/board.repository';
import { CommentRepository } from '../../domain/repositories/comment.repository';
import { UserLevelLookupService } from '../../domain/services/user-level-lookup.service';
import { CreateCommentDto } from '../dtos';

@Injectable()
export class CreateCommentUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly boardRepository: BoardRepository,
    private readonly userLevelLookupService: UserLevelLookupService,
    private readonly commentRepository: CommentRepository,
  ) {}

  async execute(dto: CreateCommentDto): Promise<Comment> {
    // 1. 글 존재 확인
    const post = await this.postRepository.findById(dto.postId);
    if (!post) {
      throw new EntityNotFoundException({
        entityName: 'Post',
        errorCode: 'POST_NOT_FOUND',
        id: dto.postId,
      });
    }

    // 2. 게시판 조회 (commentLevel 게이트 판정용)
    const board = await this.boardRepository.findById(post.boardId);
    if (!board) {
      throw new EntityNotFoundException({
        entityName: 'Board',
        errorCode: 'BOARD_NOT_FOUND',
        id: post.boardId,
      });
    }

    // 3. 회원 레벨 조회
    const userLevel = await this.userLevelLookupService.getLevel(dto.userId);

    // 4. 댓글 레벨 게이트: 회원 레벨 >= 게시판 commentLevel
    if (userLevel === undefined || userLevel < board.commentLevel.value) {
      throw new AuthorizationException({
        message: '게시판 댓글 권한이 없습니다',
        errorCode: 'INSUFFICIENT_LEVEL',
      });
    }

    // 5. content VO 생성 (빈 값 불허)
    const content = BoundedString.create(dto.content, {
      fieldName: 'content',
      maxLength: 2000,
    });

    // 6. 댓글 생성 및 저장
    const comment = Comment.create({
      postId: dto.postId,
      authorId: dto.userId,
      content,
    });
    await this.commentRepository.save(comment);

    return comment;
  }
}
