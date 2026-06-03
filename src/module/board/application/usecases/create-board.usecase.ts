import { Injectable } from '@nestjs/common';
import { BoundedString } from '@lib/domain';
import { DomainRuleViolationException } from '@shared/exception';
import { BoardRepository } from '../../domain/repositories/board.repository';
import { BoardQueryService } from '../../domain/services/board-query.service';
import { UserLevelLookupService } from '../../domain/services/user-level-lookup.service';
import { Board } from '../../domain/models/board/board';
import { Level } from '../../domain/models/board/level';
import { BoardDetailReadModel } from '../../domain/models/board/board-detail.read-model';

export interface CreateBoardDto {
  name: string;
  readLevel: number;
  writeLevel: number;
  commentLevel: number;
  managerId?: string;
}

@Injectable()
export class CreateBoardUseCase {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly userLevelLookupService: UserLevelLookupService,
    private readonly boardQueryService: BoardQueryService,
  ) {}

  async execute(dto: CreateBoardDto): Promise<BoardDetailReadModel> {
    // 1. 원시값 → VO 생성 (검증은 VO 책임)
    const name = BoundedString.create(dto.name, {
      fieldName: 'name',
      maxLength: 100,
    });
    const readLevel = Level.create(dto.readLevel);
    const writeLevel = Level.create(dto.writeLevel);
    const commentLevel = Level.create(dto.commentLevel);

    // 2. managerId 존재 확인
    if (dto.managerId !== undefined) {
      const exists = await this.userLevelLookupService.exists(dto.managerId);
      if (!exists) {
        throw new DomainRuleViolationException({
          entityName: '게시판',
          reason: '존재하지 않는 관리자입니다',
          errorCode: 'MANAGER_NOT_FOUND',
        });
      }
    }

    // 3. 도메인 모델 생성
    const board = Board.create({
      name,
      readLevel,
      writeLevel,
      commentLevel,
      managerId: dto.managerId,
    });

    // 4. 저장
    await this.boardRepository.save(board);

    // 5. 저장 후 상세 재조회 (컨벤션: 수정/생성은 디테일 재조회 반환)
    const detail = await this.boardQueryService.findDetailById(
      board.id.toString(),
    );

    // save 직후이므로 undefined일 수 없으나 타입 안전성을 위해 처리
    if (detail === undefined) {
      throw new DomainRuleViolationException({
        entityName: '게시판',
        reason: '생성 후 조회에 실패했습니다',
        errorCode: 'BOARD_CREATE_READ_FAILED',
      });
    }

    return detail;
  }
}
