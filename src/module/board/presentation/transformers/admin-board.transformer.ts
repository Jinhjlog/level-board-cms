import { AdminBoardListResult } from '../../application/usecases/find-admin-board-list.usecase';
import {
  AdminBoardListResponseDto,
  AdminBoardListItemResponseDto,
} from '../dtos/response/admin-board-list.response.dto';

export class AdminBoardTransformer {
  static toListResponse(
    result: AdminBoardListResult,
  ): AdminBoardListResponseDto {
    const items: AdminBoardListItemResponseDto[] = result.items.map((item) => ({
      id: item.id,
      name: item.name,
      readLevel: item.readLevel,
      writeLevel: item.writeLevel,
      commentLevel: item.commentLevel,
      managerId: item.managerId !== undefined ? item.managerId : null,
      createdAt: item.createdAt,
    }));

    return {
      items,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }
}
