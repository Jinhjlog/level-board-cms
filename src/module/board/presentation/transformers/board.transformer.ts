import { BoardDetailReadModel } from '../../domain/models/board/board-detail.read-model';
import { BoardListResult } from '../../application/dtos/find-board-list.dto';
import {
  BoardListResponseDto,
  BoardListItemResponseDto,
} from '../dtos/response/board-list.response.dto';
import { BoardDetailResponseDto } from '../dtos/response/board-detail.response.dto';

/** 게시판 ReadModel → Response DTO 변환 */
export class BoardTransformer {
  static toDetailResponse(
    detail: BoardDetailReadModel,
  ): BoardDetailResponseDto {
    return {
      id: detail.id,
      name: detail.name,
      readLevel: detail.readLevel,
      writeLevel: detail.writeLevel,
      commentLevel: detail.commentLevel,
      managerId: detail.managerId !== undefined ? detail.managerId : null,
      createdAt: detail.createdAt,
      updatedAt: detail.updatedAt,
    };
  }

  static toListResponse(result: BoardListResult): BoardListResponseDto {
    const items: BoardListItemResponseDto[] = result.items.map((item) => ({
      id: item.id,
      name: item.name,
      readLevel: item.readLevel,
      writeLevel: item.writeLevel,
      commentLevel: item.commentLevel,
    }));

    return {
      items,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }
}
