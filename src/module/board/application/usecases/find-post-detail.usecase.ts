import { Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '@shared/exception';
import { AuthorizationException } from '@shared/exception';
import { PostQueryService } from '../../domain/services/post-query.service';
import { BoardRepository } from '../../domain/repositories/board.repository';
import { UserLevelLookupService } from '../../domain/services/user-level-lookup.service';
import { PostDetailReadModel } from '../../domain/models/post/post-detail.read-model';

export interface FindPostDetailDto {
  postId: string;
  userId: string;
}

@Injectable()
export class FindPostDetailUseCase {
  constructor(
    private readonly postQueryService: PostQueryService,
    private readonly boardRepository: BoardRepository,
    private readonly userLevelLookupService: UserLevelLookupService,
  ) {}

  async execute(dto: FindPostDetailDto): Promise<PostDetailReadModel> {
    // 1. 글 존재 확인
    const post = await this.postQueryService.findDetailById(dto.postId);
    if (!post) {
      throw new EntityNotFoundException({
        entityName: 'Post',
        errorCode: 'POST_NOT_FOUND',
        id: dto.postId,
      });
    }

    // 2. 글이 속한 게시판 조회 (readLevel 게이트 판정용)
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

    // 4. 읽기 레벨 게이트: 회원 레벨 >= 게시판 readLevel
    if (userLevel === undefined || userLevel < board.readLevel.value) {
      throw new AuthorizationException({
        message: '게시판 읽기 권한이 없습니다',
        errorCode: 'INSUFFICIENT_LEVEL',
      });
    }

    return post;
  }
}
