import { Module, Provider } from '@nestjs/common';
import { GetMyProfileUseCase } from './application/usecases';
import { FindAdminUserListUseCase } from './application/usecases/find-admin-user-list.usecase';
import { FindAdminUserDetailUseCase } from './application/usecases/find-admin-user-detail.usecase';
import { ActivateUserUseCase } from './application/usecases/activate-user.usecase';
import { DeactivateUserUseCase } from './application/usecases/deactivate-user.usecase';
import { ChangeUserLevelUseCase } from './application/usecases/change-user-level.usecase';
import { UserRepository } from './domain/repositories/user.repository';
import { UserRepositoryImpl } from './infra/repositories/user.repository.impl';
import { UserQueryService } from './domain/services';
import { UserQueryServiceImpl } from './infra/services/user-query.service.impl';
import { UserController } from './presentation/controllers/user.controller';
import { AdminUserController } from './presentation/controllers/admin-user.controller';

const useCases: Provider[] = [
  GetMyProfileUseCase,
  FindAdminUserListUseCase,
  FindAdminUserDetailUseCase,
  ActivateUserUseCase,
  DeactivateUserUseCase,
  ChangeUserLevelUseCase,
];

@Module({
  controllers: [AdminUserController, UserController],
  providers: [
    ...useCases,
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
    {
      provide: UserQueryService,
      useClass: UserQueryServiceImpl,
    },
  ],
})
export class UserModule {}
