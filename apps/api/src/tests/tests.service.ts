import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, desc } from 'drizzle-orm';
import * as schema from '../db/schema';
import { tests } from '../db/schema';
import { formatZodIssues } from '../common/validation';
import { ProjectsService } from '../projects/projects.service';  // ← добавили

@Injectable()
export class TestsService {
  constructor(
    @Inject('DB') private readonly db: NodePgDatabase<typeof schema>,
    private readonly projects: ProjectsService, // ← добавили
  ) {}

  async create(ownerId: string, input: { projectId: string; name: string; dsl: unknown }) {
    // 1) Проверяем владение проектом
    const owned = await this.projects.getOwnedById(input.projectId, ownerId);
    if (!owned) throw new NotFoundException({ error: 'PROJECT_NOT_FOUND' });

    // 2) Валидируем DSL (единая схема из @utos/dsl)
    const mod: any = await import('@utos/dsl');
    const parsed = mod.DslV1.safeParse(input.dsl);
    if (!parsed.success) {
      throw new BadRequestException({ error: 'DSL_VALIDATION_FAILED', issues: formatZodIssues(parsed.error) });
    }

    // 3) Сохраняем тест
    const [row] = await this.db
      .insert(tests)
      .values({ projectId: input.projectId, name: input.name, dslJson: parsed.data })
      .returning();

    return row;
  }

  async listByProject(ownerId: string, projectId: string) {
    // Проверяем владение
    const owned = await this.projects.getOwnedById(projectId, ownerId);
    if (!owned) throw new NotFoundException({ error: 'PROJECT_NOT_FOUND' });

    // Выдаём тесты по проекту
    return this.db.select().from(tests).where(eq(tests.projectId, projectId)).orderBy(desc(tests.createdAt));
  }
}
