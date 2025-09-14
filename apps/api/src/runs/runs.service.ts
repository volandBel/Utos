import { BadRequestException, Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, desc } from 'drizzle-orm';
import * as schema from '../db/schema';
import { runs, tests } from '../db/schema';
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

    // найдём test -> projectId (для связки)
    const t = await this.db.select().from(tests).where(eq(tests.id, res.testId)).limit(1);
    if (!t[0]) throw new NotFoundException({ error: 'TEST_NOT_FOUND' });

    // сохраняем
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

    this.logger.log(`stored run ${row.id} job=${row.jobId} test=${row.testId} status=${row.status}`);

    return {
      accepted: true,
      run_id: row.id,
      jobId: row.jobId,
      testId: row.testId,
      status: row.status,
      steps: res.steps.length,
      artifacts: res.artifacts.length,
      started_at: res.startedAt,
      ended_at: res.endedAt,
    };
  }

  // список прогонов по тесту (owner-check с помощью ProjectsService)
  async listByTest(ownerId: string, testId: string) {
    const t = await this.db.select().from(tests).where(eq(tests.id, testId)).limit(1);
    const test = t[0];
    if (!test) throw new NotFoundException({ error: 'TEST_NOT_FOUND' });
    const owned = await this.projects.getOwnedById(test.projectId, ownerId);
    if (!owned) throw new NotFoundException({ error: 'PROJECT_NOT_FOUND' });

    return this.db
      .select()
      .from(runs)
      .where(eq(runs.testId, testId))
      .orderBy(desc(runs.createdAt));
  }
}
