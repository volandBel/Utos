import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, desc } from 'drizzle-orm';
import * as schema from '../db/schema';
import { tests } from '../db/schema';
import { formatZodIssues } from '../common/validation';

@Injectable()
export class TestsService {
  constructor(@Inject('DB') private readonly db: NodePgDatabase<typeof schema>) {}

  async create(input: { projectId: string; name: string; dsl: unknown }) {
    const mod: any = await import('@utos/dsl');           // используем единую схему
    const parsed = mod.DslV1.safeParse(input.dsl);

    if (!parsed.success) {
      throw new BadRequestException({
        error: 'DSL_VALIDATION_FAILED',
        issues: formatZodIssues(parsed.error),
      });
    }

    const [row] = await this.db
      .insert(tests)
      .values({ projectId: input.projectId, name: input.name, dslJson: parsed.data })
      .returning();

    return row;
  }

  async listByProject(projectId: string) {
    return this.db
      .select()
      .from(tests)
      .where(eq(tests.projectId, projectId))
      .orderBy(desc(tests.createdAt));
  }
}
