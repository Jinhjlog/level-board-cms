import { Injectable } from '@nestjs/common';
import { BoundedString } from '@lib/domain';
import { BoardRepository, PostRepository } from '../../domain/repositories';
import {
  PostQueryService,
  UserLevelLookupService,
} from '../../domain/services';
import { Post, PostAttachment, PostDetailReadModel } from '../../domain/models';
import { UploadedFileAttachmentService } from '../../../file-upload/application/ohs/uploaded-file-attachment.service';
import { CreatePostDto } from '../dtos/create-post.dto';
import {
  AuthorizationException,
  EntityNotFoundException,
} from '@shared/exception';

/**
 * 글 작성 UseCase (SPEC 4.8).
 * 1. 게시판 존재 확인 — 없으면 404 BOARD_NOT_FOUND
 * 2. 쓰기 레벨 게이트 — 회원 레벨 < board.writeLevel이면 403 INSUFFICIENT_LEVEL
 * 3. title/content VO 생성 (BoundedString 검증)
 * 4. attachmentIds 있으면 file-upload OHS로 메타 취득 + markLinked
 * 5. Post.create → PostRepository.save
 * 6. PostQueryService.findDetailById로 상세 재조회 반환
 */
@Injectable()
export class CreatePostUseCase {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly userLevelLookupService: UserLevelLookupService,
    private readonly postRepository: PostRepository,
    private readonly postQueryService: PostQueryService,
    private readonly uploadedFileAttachmentService: UploadedFileAttachmentService,
  ) {}

  async execute(dto: CreatePostDto): Promise<PostDetailReadModel> {
    // 1. 게시판 존재 확인
    const board = await this.boardRepository.findById(dto.boardId);

    if (!board) {
      throw new EntityNotFoundException({
        entityName: 'Board',
        errorCode: 'BOARD_NOT_FOUND',
        id: dto.boardId,
      });
    }

    // 2. 쓰기 레벨 게이트 판정
    const userLevel = await this.userLevelLookupService.getLevel(dto.authorId);

    if (userLevel === undefined || userLevel < board.writeLevel.value) {
      throw new AuthorizationException({
        message: '게시판에 글을 작성하기 위한 레벨이 부족합니다',
        errorCode: 'INSUFFICIENT_LEVEL',
      });
    }

    // 3. title / content VO 생성
    const title = BoundedString.create(dto.title, {
      fieldName: 'title',
      maxLength: 255,
    });

    const content = BoundedString.create(dto.content, {
      fieldName: 'content',
    });

    // 4. 첨부 파일 처리 (file-upload OHS)
    const attachments: PostAttachment[] = [];

    if (dto.attachmentIds && dto.attachmentIds.length > 0) {
      for (let i = 0; i < dto.attachmentIds.length; i++) {
        const fileId = dto.attachmentIds[i];

        // CONFIRMED 상태 검증 + 메타 취득 (OHS가 상태/purpose 불일치 시 throw)
        const fileInfo =
          await this.uploadedFileAttachmentService.getConfirmedFileInfo(
            fileId,
            'attachment',
          );

        attachments.push(
          PostAttachment.create({
            storageKey: fileInfo.storageKey,
            url: fileInfo.url,
            originalName: fileInfo.originalName,
            mimeType: fileInfo.mimeType,
            fileSize: fileInfo.fileSize,
            sortOrder: i,
          }),
        );

        // 파일을 이 글에 연결 처리
        await this.uploadedFileAttachmentService.markLinked(fileId);
      }
    }

    // 5. Post 생성 및 저장
    const post = Post.create({
      boardId: dto.boardId,
      authorId: dto.authorId,
      title,
      content,
      attachments,
    });

    await this.postRepository.save(post);

    // 6. 생성된 글 상세 재조회
    const detail = await this.postQueryService.findDetailById(
      post.id.toString(),
    );

    if (!detail) {
      throw new EntityNotFoundException({
        entityName: 'Post',
        errorCode: 'POST_NOT_FOUND',
        id: post.id.toString(),
      });
    }

    return detail;
  }
}
