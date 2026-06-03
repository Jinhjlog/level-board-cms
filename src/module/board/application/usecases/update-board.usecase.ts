import { Injectable } from '@nestjs/common';
import { BoundedString } from '@lib/domain';
import {
  DomainRuleViolationException,
  EntityNotFoundException,
} from '@shared/exception';
import { BoardRepository } from '../../domain/repositories/board.repository';
import { BoardQueryService } from '../../domain/services/board-query.service';
import { UserLevelLookupService } from '../../domain/services/user-level-lookup.service';
import { Level } from '../../domain/models/board/level';
import { BoardDetailReadModel } from '../../domain/models/board/board-detail.read-model';

export interface UpdateBoardDto {
  boardId: string;
  name?: string;
  readLevel?: number;
  writeLevel?: number;
  commentLevel?: number;
  /** null 전달 시 관리자 해제 */
  managerId?: string | null;
}

@Injectable()
export class UpdateBoardUseCase {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly boardQueryService: BoardQueryService,
    private readonly userLevelLookupService: UserLevelLookupService,
  ) {}

  async execute(dto: UpdateBoardDto): Promise<BoardDetailReadModel> {
    // 1. VO 생성 (검증은 VO 책임 — 빠른 실패)
    const name =
      dto.name !== undefined
        ? BoundedString.create(dto.name, { fieldName: 'name', maxLength: 100 })
        : undefined;

    const readLevel =
      dto.readLevel !== undefined ? Level.create(dto.readLevel) : undefined;

    const writeLevel =
      dto.writeLevel !== undefined ? Level.create(dto.writeLevel) : undefined;

    const commentLevel =
      dto.commentLevel !== undefined
        ? Level.create(dto.commentLevel)
        : undefined;

    // 2. 게시판 존재 확인
    const board = await this.boardRepository.findById(dto.boardId);
    if (!board) {
      throw new EntityNotFoundException({
        id: dto.boardId,
        entityName: 'Board',
        errorCode: 'BOARD_NOT_FOUND',
      });
    }

    // 3. managerId 검증 (null이 아닌 값이 전달된 경우만 존재 확인)
    if (dto.managerId !== undefined && dto.managerId !== null) {
      const exists = await this.userLevelLookupService.exists(dto.managerId);
      if (!exists) {
        throw new DomainRuleViolationException({
          entityName: 'Board',
          reason: '존재하지 않는 관리자 회원입니다.',
          errorCode: 'MANAGER_NOT_FOUND',
        });
      }
    }

    // 4. 도메인 행위 메서드로 수정
    board.update({
      name,
      readLevel,
      writeLevel,
      commentLevel,
      managerId: dto.managerId,
    });

    // 5. 저장
    await this.boardRepository.save(board);

    // 6. 수정된 상세 재조회하여 반환 (컨벤션: 수정 후 상세 반환)
    const detail = await this.boardQueryService.findDetailById(dto.boardId);
    if (!detail) {
      throw new EntityNotFoundException({
        id: dto.boardId,
        entityName: 'Board',
        errorCode: 'BOARD_NOT_FOUND',
      });
    }

    return detail;
  }
}
