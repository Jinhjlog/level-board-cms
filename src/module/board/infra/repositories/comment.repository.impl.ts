import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { CommentRepository } from '../../domain/repositories/comment.repository';
import { Comment } from '../../domain/models/comment';
import { CommentMapper } from '../mappers';

@Injectable()
export class CommentRepositoryImpl implements CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(comment: Comment): Promise<void> {
    const data = CommentMapper.toPersistence(comment);

    await this.prisma.comment.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
  }

  async findById(id: string): Promise<Comment | undefined> {
    const record = await this.prisma.comment.findUnique({ where: { id } });
    return record ? CommentMapper.toDomain(record) : undefined;
  }

  async delete(comment: Comment): Promise<void> {
    await this.prisma.comment.delete({ where: { id: comment.id.toString() } });
  }
}
