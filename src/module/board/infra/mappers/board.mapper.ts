import { Prisma, Board as BoardPrisma } from '@prisma/generated/client';
import { BoundedString } from '@lib/domain';
import { Board, Level } from '../../domain/models/board';

/** Board 애그리거트 영속성 ↔ 도메인 매핑 */
export class BoardMapper {
  static toDomain(raw: BoardPrisma): Board {
    return Board.unsafeCreate({
      id: raw.id,
      name: BoundedString.unsafeCreate(raw.name),
      readLevel: Level.unsafeCreate(raw.readLevel),
      writeLevel: Level.unsafeCreate(raw.writeLevel),
      commentLevel: Level.unsafeCreate(raw.commentLevel),
      managerId: raw.managerId !== null ? raw.managerId : undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(board: Board): Prisma.BoardUncheckedCreateInput {
    return {
      id: board.id.toString(),
      name: board.name.value,
      readLevel: board.readLevel.value,
      writeLevel: board.writeLevel.value,
      commentLevel: board.commentLevel.value,
      managerId: board.managerId !== undefined ? board.managerId : null,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    };
  }
}
