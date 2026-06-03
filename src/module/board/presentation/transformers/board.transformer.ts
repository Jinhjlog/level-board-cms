import { BoardListResult } from '../../application/dtos/find-board-list.dto';
import {
  BoardListResponseDto,
  BoardListItemResponseDto,
} from '../dtos/response/board-list.response.dto';

/** 게시판 ReadModel → Response DTO 변환 */
export class BoardTransformer {
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
