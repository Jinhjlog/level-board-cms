import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { BoardRepository } from '../../domain/repositories/board.repository';
import { Board } from '../../domain/models/board';
import { BoardMapper } from '../mappers';

@Injectable()
export class BoardRepositoryImpl implements BoardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(board: Board): Promise<void> {
    const data = BoardMapper.toPersistence(board);

    await this.prisma.board.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
  }

  async findById(id: string): Promise<Board | undefined> {
    const record = await this.prisma.board.findUnique({ where: { id } });
    return record ? BoardMapper.toDomain(record) : undefined;
  }

  async delete(board: Board): Promise<void> {
    // 글·댓글은 DB CASCADE로 함께 삭제된다.
    await this.prisma.board.delete({ where: { id: board.id.toString() } });
  }
}
