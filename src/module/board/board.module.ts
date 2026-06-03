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
import { CreateBoardUseCase } from './application/usecases/create-board.usecase';
import { FindBoardListUseCase } from './application/usecases/find-board-list.usecase';
import {
  FindPostListUseCase,
  FindPostDetailUseCase,
  CreatePostUseCase,
  UpdateBoardUseCase,
  DeleteBoardUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  DeleteCommentUseCase,
  FindAdminBoardListUseCase,
} from './application/usecases';
import { FileUploadModule } from '../file-upload/file-upload.module';

/**
 * 게시판 CMS BC (board).
 * G단계: FindBoardListUseCase(SPEC 4.5) 추가. DeletePostUseCase(SPEC 4.10) 추가.
 */
@Module({
  imports: [FileUploadModule],
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
    CreateBoardUseCase,
    FindBoardListUseCase,
    FindPostListUseCase,
    FindPostDetailUseCase,
    FindAdminBoardListUseCase,
    DeleteCommentUseCase,
    DeletePostUseCase,
    UpdatePostUseCase,
    DeleteBoardUseCase,
    UpdateBoardUseCase,
    CreatePostUseCase,
  ],
})
export class BoardModule {}
