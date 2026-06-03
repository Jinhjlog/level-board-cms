import { Injectable } from '@nestjs/common';
import {
  EntityNotFoundException,
  AuthorizationException,
} from '@shared/exception';
import { PostRepository } from '../../domain/repositories/post.repository';
import { BoardRepository } from '../../domain/repositories/board.repository';
import { UploadedFileAttachmentService } from '../../../file-upload/application/ohs/uploaded-file-attachment.service';

export interface DeletePostDto {
  postId: string;
  userId: string;
}

/**
 * 글 삭제 UseCase (SPEC 4.10).
 * 1. 글 존재 확인 — 없으면 404 POST_NOT_FOUND
 * 2. 권한 판정 — 작성자 본인 또는 게시판 관리자(managerId)만 허용, 둘 다 아니면 403 FORBIDDEN_MODERATION
 * 3. 첨부 물리삭제 — 각 attachment.storageKey 로 스토리지 파일 삭제
 * 4. 글 삭제 — DB CASCADE로 댓글·첨부행도 함께 삭제
 */
@Injectable()
export class DeletePostUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly boardRepository: BoardRepository,
    private readonly uploadedFileAttachmentService: UploadedFileAttachmentService,
  ) {}

  async execute(dto: DeletePostDto): Promise<void> {
    // 1. 글 존재 확인 (첨부 포함 로드)
    const post = await this.postRepository.findById(dto.postId);

    if (!post) {
      throw new EntityNotFoundException({
        entityName: 'Post',
        errorCode: 'POST_NOT_FOUND',
        id: dto.postId,
      });
    }

    // 2. 권한 판정: 작성자 본인이면 바로 허용
    const isAuthor = post.authorId === dto.userId;

    if (!isAuthor) {
      // 게시판 관리자 여부 확인
      const board = await this.boardRepository.findById(post.boardId);

      const isBoardManager =
        board !== undefined && board.managerId === dto.userId;

      if (!isBoardManager) {
        throw new AuthorizationException({
          message: '글을 삭제할 권한이 없습니다',
          errorCode: 'FORBIDDEN_MODERATION',
        });
      }
    }

    // 3. 첨부 물리삭제 (스토리지에서 파일 제거)
    await Promise.all(
      post.attachments.map((attachment) =>
        this.uploadedFileAttachmentService.deleteStorageFile(
          attachment.storageKey,
        ),
      ),
    );

    // 4. 글 삭제 (댓글·첨부행은 DB CASCADE)
    await this.postRepository.delete(post);
  }
}
