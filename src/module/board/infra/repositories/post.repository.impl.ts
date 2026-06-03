import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { PostRepository } from '../../domain/repositories/post.repository';
import { Post } from '../../domain/models/post';
import { PostMapper, PostAttachmentMapper } from '../mappers';

@Injectable()
export class PostRepositoryImpl implements PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(post: Post): Promise<void> {
    const data = PostMapper.toPersistence(post);
    const attachments = post.attachments.map((a) =>
      PostAttachmentMapper.toPersistence(a),
    );

    // 신규 작성 시 첨부를 nested create. 수정 시에는 본문만 갱신(첨부 변경 미포함, SPEC 5장).
    await this.prisma.post.upsert({
      where: { id: data.id },
      create: {
        ...data,
        attachments:
          attachments.length > 0 ? { create: attachments } : undefined,
      },
      update: {
        title: data.title,
        content: data.content,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<Post | undefined> {
    const record = await this.prisma.post.findUnique({
      where: { id },
      include: { attachments: { orderBy: { sortOrder: 'asc' } } },
    });
    return record ? PostMapper.toDomain(record) : undefined;
  }

  async delete(post: Post): Promise<void> {
    // 댓글·첨부는 DB CASCADE로 함께 삭제된다.
    await this.prisma.post.delete({ where: { id: post.id.toString() } });
  }
}
