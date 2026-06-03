import { Module } from '@nestjs/common';
import {
  AdminBoardController,
  BoardController,
  PostController,
  CommentController,
} from './presentation/controllers';
import { FindAdminBoardListUseCase } from './application/usecases/find-admin-board-list.usecase';
import {
  BoardRepository,
  PostRepository,
  CommentRepository,
} from './domain/repositories';
import {
  BoardQueryService,
  PostQueryService,
  UserLevelLookupService,
} from './domain/services';
import {
  BoardRepositoryImpl,
  PostRepositoryImpl,
  CommentRepositoryImpl,
} from './infra/repositories';
import {
  BoardQueryServiceImpl,
  PostQueryServiceImpl,
  UserLevelLookupServiceImpl,
} from './infra/services';
import { FindBoardListUseCase } from './application/usecases/find-board-list.usecase';
import { FindPostListUseCase } from './application/usecases';
import { FindPostDetailUseCase } from './application/usecases';
import { CreateCommentUseCase } from './application/usecases';

/**
 * 게시판 CMS BC (board).
 * G단계: FindBoardListUseCase(SPEC 4.5) 추가.
 */
@Module({
  controllers: [
    AdminBoardController,
    BoardController,
    PostController,
    CommentController,
  ],
  providers: [
    { provide: BoardRepository, useClass: BoardRepositoryImpl },
    { provide: PostRepository, useClass: PostRepositoryImpl },
    { provide: CommentRepository, useClass: CommentRepositoryImpl },
    { provide: BoardQueryService, useClass: BoardQueryServiceImpl },
    { provide: PostQueryService, useClass: PostQueryServiceImpl },
    { provide: UserLevelLookupService, useClass: UserLevelLookupServiceImpl },
    FindBoardListUseCase,
    FindPostListUseCase,
    FindPostDetailUseCase,
    FindAdminBoardListUseCase,
    CreateCommentUseCase,
  ],
})
export class BoardModule {}
