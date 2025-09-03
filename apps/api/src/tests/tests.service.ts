import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, desc } from 'drizzle-orm';
import * as schema from '../db/schema';
import { tests } from '../db/schema';
import { DslV1 } from '../dsl/schema';

@Injectable()
export class TestsService {
  constructor(@Inject('DB') private readonly db: NodePgDatabase<typeof schema>) {}

  async create(input: { projectId: string; name: string; dsl: unknown }) {
    // Zod-валидация DSL
    const parsed = DslV1.safeParse(input.dsl);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'DSL validation failed',
        errors: parsed.error.flatten(),
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
