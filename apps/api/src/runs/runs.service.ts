import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, desc } from 'drizzle-orm';
import * as schema from '../db/schema';
import { artifacts, runs, tests } from '../db/schema';
import { RunnerResultSchema } from './runner-result.schema';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class RunsService {
  private readonly logger = new Logger(RunsService.name);

  constructor(
    @Inject('DB') private readonly db: NodePgDatabase<typeof schema>,
    private readonly projects: ProjectsService,
  ) {}

  async acceptResult(payload: unknown) {
    // 1) валидация
    const parsed = RunnerResultSchema.safeParse(payload);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => ({
        path: i.path.join('.'),
        code: i.code,
        message: i.message,
      }));
      throw new BadRequestException({ error: 'RUNNER_RESULT_INVALID', issues });
    }
    const res = parsed.data;

    // 2) проверим testId -> projectId
    const t = await this.db
      .select()
      .from(tests)
      .where(eq(tests.id, res.testId))
      .limit(1);
    if (!t[0]) throw new NotFoundException({ error: 'TEST_NOT_FOUND' });

    // 3) сохраним run
    const [row] = await this.db
      .insert(runs)
      .values({
        jobId: res.jobId,
        testId: res.testId,
        projectId: t[0].projectId,
        status: res.status,
        startedAt: new Date(res.startedAt),
        endedAt: new Date(res.endedAt),
        resultJson: res,
      })
      .returning();

    this.logger.log(
      `stored run ${row.id} job=${row.jobId} test=${row.testId} status=${row.status}`,
    );

    // 4) сохраним артефакты, если есть
if (Array.isArray(res.artifacts)) {
  for (const a of res.artifacts) {
    if (!a.type || !a.path) {
      this.logger.warn(`artifact пропущен: ${JSON.stringify(a)}`);
      continue;
    }

    await this.db.insert(artifacts).values({
      runId: row.id,
      type: a.type,
      path: a.path,
      bytes: String(a.bytes ?? 0),
    });
  }
}


    // 5) ответ
    return {
      accepted: true,
      run_id: row.id,
      jobId: row.jobId,
      testId: row.testId,
      status: row.status,
      steps: res.steps?.length ?? 0,
      artifacts: res.artifacts?.length ?? 0,
      started_at: res.startedAt,
      ended_at: res.endedAt,
    };
  }

  async getRaw(ownerId: string, runId: string) {
    // 1) найти run
    const r = await this.db
      .select()
      .from(runs)
      .where(eq(runs.id, runId))
      .limit(1);
    const row = r[0];
    if (!row) throw new NotFoundException({ error: 'RUN_NOT_FOUND' });

    // 2) найти тест
    const t = await this.db
      .select()
      .from(tests)
      .where(eq(tests.id, row.testId))
      .limit(1);
    const test = t[0];
    if (!test) throw new NotFoundException({ error: 'TEST_NOT_FOUND' });

    // 3) проверить проект
    const owned = await this.projects.getOwnedById(test.projectId, ownerId);
    if (!owned) throw new NotFoundException({ error: 'PROJECT_NOT_FOUND' });

    // 4) вернуть весь resultJson
    return row.resultJson;
  }

  async listByTest(ownerId: string, testId: string) {
    // 1) проверить тест
    const t = await this.db
      .select()
      .from(tests)
      .where(eq(tests.id, testId))
      .limit(1);
    const test = t[0];
    if (!test) throw new NotFoundException({ error: 'TEST_NOT_FOUND' });

    // 2) проверить проект
    const owned = await this.projects.getOwnedById(test.projectId, ownerId);
    if (!owned) throw new NotFoundException({ error: 'PROJECT_NOT_FOUND' });

    // 3) вернуть список прогонов
    return this.db
      .select()
      .from(runs)
      .where(eq(runs.testId, testId))
      .orderBy(desc(runs.createdAt));
  }

  async listArtifacts(ownerId: string, runId: string) {
    // 1) найти run
    const r = await this.db.select().from(runs).where(eq(runs.id, runId)).limit(1);
    const row = r[0];
    if (!row) throw new NotFoundException({ error: 'RUN_NOT_FOUND' });

    // 2) найти тест
    const t = await this.db.select().from(tests).where(eq(tests.id, row.testId)).limit(1);
    const test = t[0];
    if (!test) throw new NotFoundException({ error: 'TEST_NOT_FOUND' });

    // 3) проверить проект
    const owned = await this.projects.getOwnedById(test.projectId, ownerId);
    if (!owned) throw new NotFoundException({ error: 'PROJECT_NOT_FOUND' });

    // 4) вернуть артефакты
    return this.db.select().from(artifacts).where(eq(artifacts.runId, runId));
  }
}
