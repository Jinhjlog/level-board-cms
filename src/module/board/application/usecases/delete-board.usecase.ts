import { Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '@shared/exception';
import { BoardRepository } from '../../domain/repositories/board.repository';

@Injectable()
export class DeleteBoardUseCase {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(boardId: string): Promise<void> {
    // 1. 게시판 존재 여부 확인
    const board = await this.boardRepository.findById(boardId);

    if (!board) {
      throw new EntityNotFoundException({
        id: boardId,
        entityName: 'Board',
        errorCode: 'BOARD_NOT_FOUND',
      });
    }

    // 2. 게시판 삭제 (소속 글·댓글은 DB CASCADE로 함께 삭제)
    await this.boardRepository.delete(board);
  }
}
