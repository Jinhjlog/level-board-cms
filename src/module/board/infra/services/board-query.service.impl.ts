import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import {
  BoardQueryService,
  FindBoardListParams,
} from '../../domain/services/board-query.service';
import { BoardDetailReadModel } from '../../domain/models/board/board-detail.read-model';
import { BoardAdminListItemReadModel } from '../../domain/models/board/board-admin-list-item.read-model';
import { BoardListItemReadModel } from '../../domain/models/board/board-list-item.read-model';

@Injectable()
export class BoardQueryServiceImpl implements BoardQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAdminList(
    params: FindBoardListParams,
  ): Promise<BoardAdminListItemReadModel[]> {
    const records = await this.prisma.board.findMany({
      orderBy: { createdAt: 'desc' },
      skip: params.skip,
      take: params.limit,
    });

    return records.map((record) => ({
      id: record.id,
      name: record.name,
      readLevel: record.readLevel,
      writeLevel: record.writeLevel,
      commentLevel: record.commentLevel,
      managerId: record.managerId !== null ? record.managerId : undefined,
      createdAt: record.createdAt,
    }));
  }

  async findList(
    params: FindBoardListParams,
  ): Promise<BoardListItemReadModel[]> {
    const records = await this.prisma.board.findMany({
      select: {
        id: true,
        name: true,
        readLevel: true,
        writeLevel: true,
        commentLevel: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: params.skip,
      take: params.limit,
    });

    return records.map((record) => ({
      id: record.id,
      name: record.name,
      readLevel: record.readLevel,
      writeLevel: record.writeLevel,
      commentLevel: record.commentLevel,
    }));
  }

  async countAll(): Promise<number> {
    return this.prisma.board.count();
  }

  async findDetailById(id: string): Promise<BoardDetailReadModel | undefined> {
    const record = await this.prisma.board.findUnique({ where: { id } });

    if (!record) {
      return undefined;
    }

    return {
      id: record.id,
      name: record.name,
      readLevel: record.readLevel,
      writeLevel: record.writeLevel,
      commentLevel: record.commentLevel,
      managerId: record.managerId !== null ? record.managerId : undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
