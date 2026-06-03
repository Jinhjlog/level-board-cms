import { Injectable } from '@nestjs/common';
import { BoundedString } from '@lib/domain';
import {
  EntityNotFoundException,
  AuthorizationException,
} from '@shared/exception';
import { PostRepository } from '../../domain/repositories/post.repository';
import { PostQueryService } from '../../domain/services/post-query.service';
import { PostDetailReadModel } from '../../domain/models/post/post-detail.read-model';

export interface UpdatePostDto {
  postId: string;
  userId: string;
  title?: string;
  content?: string;
}

@Injectable()
export class UpdatePostUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly postQueryService: PostQueryService,
  ) {}

  async execute(dto: UpdatePostDto): Promise<PostDetailReadModel> {
    // 1. VO 생성 (원시값 → VO 변환, 빠른 실패)
    const titleVO =
      dto.title !== undefined
        ? BoundedString.create(dto.title, {
            fieldName: 'title',
            maxLength: 255,
          })
        : undefined;

    const contentVO =
      dto.content !== undefined
        ? BoundedString.create(dto.content, { fieldName: 'content' })
        : undefined;

    // 2. 글 존재 확인
    const post = await this.postRepository.findById(dto.postId);
    if (!post) {
      throw new EntityNotFoundException({
        entityName: 'Post',
        errorCode: 'POST_NOT_FOUND',
        id: dto.postId,
      });
    }

    // 3. 작성자 검증
    if (post.authorId !== dto.userId) {
      throw new AuthorizationException({
        message: '글 수정 권한이 없습니다',
        errorCode: 'NOT_POST_OWNER',
      });
    }

    // 4. 도메인 행위 메서드로 수정
    post.update({ title: titleVO, content: contentVO });

    // 5. 저장
    await this.postRepository.save(post);

    // 6. 수정된 글 상세 재조회 후 반환
    const updated = await this.postQueryService.findDetailById(dto.postId);
    if (!updated) {
      throw new EntityNotFoundException({
        entityName: 'Post',
        errorCode: 'POST_NOT_FOUND',
        id: dto.postId,
      });
    }

    return updated;
  }
}
