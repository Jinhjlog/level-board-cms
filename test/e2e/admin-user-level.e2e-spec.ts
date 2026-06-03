import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../../src/module/core/database/prisma.service';
import { createTestApp } from '../helpers/test-app.helper';
import { cleanDatabase } from '../helpers/db-cleanup.helper';
import { expectError, expectSuccess } from '../helpers/assertion.helper';
import { seedUser, seedSuperAdmin, seedAdmin } from '../helpers/seed';

interface UserLevelBody {
  id: string;
  level: number;
}

const ADMIN_LOGIN_URL = '/api/v1/admin-auth/login';
const levelUrl = (userId: string) => `/api/v1/admin/users/${userId}/level`;
const ADMIN_PW = 'P@ssw0rd!';

describe('회원 레벨 조정 E2E', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  async function loginAdmin(loginId: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post(ADMIN_LOGIN_URL)
      .send({ loginId, password: ADMIN_PW });
    return (res.body as { accessToken: string }).accessToken;
  }

  async function superAdminToken(): Promise<string> {
    const admin = await seedSuperAdmin(prisma, {
      loginId: 'super',
      password: ADMIN_PW,
    });
    return loginAdmin(admin.loginId);
  }

  const bearer = (t: string) => ({ Authorization: `Bearer ${t}` });

  describe('PATCH /api/v1/admin/users/:userId/level', () => {
    it('TC-ULVL-001: SUPER_ADMIN이 회원 레벨 조정 성공', async () => {
      const token = await superAdminToken();
      const user = await seedUser(prisma, { level: 1 });

      const res = await request(app.getHttpServer())
        .patch(levelUrl(user.id))
        .set(bearer(token))
        .send({ level: 5 });

      const body = expectSuccess<UserLevelBody>(res, 200);
      expect(body.id).toBe(user.id);
      expect(body.level).toBe(5);

      const updated = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updated!.level).toBe(5);
    });

    it('TC-ULVL-002: 레벨이 1~10 범위를 벗어나면 400', async () => {
      const token = await superAdminToken();
      const user = await seedUser(prisma, { level: 1 });

      const res = await request(app.getHttpServer())
        .patch(levelUrl(user.id))
        .set(bearer(token))
        .send({ level: 11 });

      expectError(res, { statusCode: 400, errorCode: 'INVALID_USER_LEVEL' });
    });

    it('TC-ULVL-003: 존재하지 않는 회원이면 404', async () => {
      const token = await superAdminToken();

      const res = await request(app.getHttpServer())
        .patch(levelUrl('01HXK3G5N7MZQR8BVWEY6JKFP4'))
        .set(bearer(token))
        .send({ level: 3 });

      expectError(res, { statusCode: 404, errorCode: 'USER_NOT_FOUND' });
    });

    it('TC-ULVL-004: 비 SUPER_ADMIN(ADMIN) 접근 시 403', async () => {
      const admin = await seedAdmin(prisma, {
        loginId: 'normal-admin',
        password: ADMIN_PW,
        role: 'ADMIN',
      });
      const token = await loginAdmin(admin.loginId);
      const user = await seedUser(prisma, { level: 1 });

      const res = await request(app.getHttpServer())
        .patch(levelUrl(user.id))
        .set(bearer(token))
        .send({ level: 5 });

      expectError(res, { statusCode: 403, errorCode: 'FORBIDDEN_ADMIN_ROLE' });
    });
  });
});
