import { Module } from '@nestjs/common';
import {
  AdminBoardController,
  BoardController,
  PostController,
  CommentController,
} from './presentation/controllers';
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
import { FindPostDetailUseCase } from './application/usecases';

/**
 * 게시판 CMS BC (board).
 * F단계: Domain(애그리거트/VO/Repository·Service 인터페이스) + Infra(구현/Mapper) 바인딩.
 * ⚠️ Application(UseCase) + file-upload OHS 소비는 G단계에서 추가한다.
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
    FindPostDetailUseCase,
  ],
})
export class BoardModule {}
