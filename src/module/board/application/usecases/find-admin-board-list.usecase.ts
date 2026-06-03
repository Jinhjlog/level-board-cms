import { Injectable } from '@nestjs/common';
import { BoardQueryService } from '../../domain/services/board-query.service';
import { BoardAdminListItemReadModel } from '../../domain/models/board/board-admin-list-item.read-model';
import { FindAdminBoardListDto } from '../dtos/find-admin-board-list.dto';

export interface AdminBoardListResult {
  items: BoardAdminListItemReadModel[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

@Injectable()
export class FindAdminBoardListUseCase {
  constructor(private readonly boardQueryService: BoardQueryService) {}

  async execute(dto: FindAdminBoardListDto): Promise<AdminBoardListResult> {
    const page = dto.page ?? 1;
    const skip = (page - 1) * dto.limit;

    const [items, totalCount] = await Promise.all([
      this.boardQueryService.findAdminList({ skip, limit: dto.limit }),
      this.boardQueryService.countAll(),
    ]);

    const totalPages = Math.ceil(totalCount / dto.limit) || 1;

    return { items, totalCount, totalPages, currentPage: page };
  }
}
