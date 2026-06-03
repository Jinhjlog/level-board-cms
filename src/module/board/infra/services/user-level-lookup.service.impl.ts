import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { UserLevelLookupService } from '../../domain/services/user-level-lookup.service';

/**
 * board → user BC 읽기 전용 ACL 구현.
 * user의 `level`/존재를 prisma로 직접 조회한다(User 도메인 미수정, context-notes §5.2/§5.3).
 * 비활성/삭제 회원은 제외(deletedAt null).
 */
@Injectable()
export class UserLevelLookupServiceImpl implements UserLevelLookupService {
  constructor(private readonly prisma: PrismaService) {}

  async getLevel(userId: string): Promise<number | undefined> {
    const record = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { level: true },
    });

    return record ? record.level : undefined;
  }

  async exists(userId: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { id: userId, deletedAt: null },
    });

    return count > 0;
  }
}
