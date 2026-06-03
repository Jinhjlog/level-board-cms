import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import {
  PostQueryService,
  FindPostListParams,
  CountPostListParams,
} from '../../domain/services/post-query.service';
import { PostListItemReadModel } from '../../domain/models/post/post-list-item.read-model';
import { PostDetailReadModel } from '../../domain/models/post/post-detail.read-model';

@Injectable()
export class PostQueryServiceImpl implements PostQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async findListByBoard(
    params: FindPostListParams,
  ): Promise<PostListItemReadModel[]> {
    const { boardId, skip, limit, keyword } = params;

    const records = await this.prisma.post.findMany({
      where: {
        boardId,
        ...(keyword && { title: { contains: keyword } }),
      },
      select: { id: true, title: true, authorId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return records.map((record) => ({
      id: record.id,
      title: record.title,
      authorId: record.authorId,
      createdAt: record.createdAt,
    }));
  }

  async countByBoard(params: CountPostListParams): Promise<number> {
    const { boardId, keyword } = params;

    return this.prisma.post.count({
      where: {
        boardId,
        ...(keyword && { title: { contains: keyword } }),
      },
    });
  }

  async findDetailById(id: string): Promise<PostDetailReadModel | undefined> {
    const record = await this.prisma.post.findUnique({
      where: { id },
      include: { attachments: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!record) {
      return undefined;
    }

    return {
      id: record.id,
      boardId: record.boardId,
      title: record.title,
      content: record.content,
      authorId: record.authorId,
      createdAt: record.createdAt,
      attachments: record.attachments.map((a) => ({
        id: a.id,
        url: a.url,
        originalName: a.originalName,
        mimeType: a.mimeType,
        fileSize: a.fileSize !== null ? a.fileSize : undefined,
        sortOrder: a.sortOrder,
      })),
    };
  }
}
