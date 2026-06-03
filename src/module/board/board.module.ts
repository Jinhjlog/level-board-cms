import { Module } from '@nestjs/common';
import {
  AdminBoardController,
  BoardController,
  CommentController,
  PostController,
} from './presentation/controllers';

/**
 * 게시판 CMS BC (board).
 * ⚠️ D단계: presentation Mock 스캐폴딩만 등록. domain/infra/application(UseCase)·
 * file-upload OHS·user LookupService 연동은 F·G단계에서 추가한다(context-notes 참조).
 */
@Module({
  controllers: [
    AdminBoardController,
    BoardController,
    PostController,
    CommentController,
  ],
})
export class BoardModule {}
