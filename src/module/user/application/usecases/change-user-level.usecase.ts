import { Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '@shared/exception';
import { UserRepository } from '../../domain/repositories/user.repository';
import { Level } from '../../domain/models/user';

export interface ChangeUserLevelResult {
  id: string;
  level: number;
}

/**
 * 회원 레벨 조정 (user api-spec 4.10).
 * 레벨 범위(1~10) 검증은 Level VO(INVALID_USER_LEVEL) 책임.
 */
@Injectable()
export class ChangeUserLevelUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, level: number): Promise<ChangeUserLevelResult> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new EntityNotFoundException({
        id: userId,
        entityName: 'User',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    user.changeLevel(Level.create(level));
    await this.userRepository.save(user);

    return { id: user.id.toString(), level: user.level };
  }
}
