import { Inject, Injectable } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { asc, eq, and } from 'drizzle-orm';
import * as schema from '../db/schema';
import { projects } from '../db/schema';

@Injectable()
export class ProjectsService {
  constructor(@Inject('DB') private readonly db: NodePgDatabase<typeof schema>) {}

  async create(name: string, ownerId: string) {
    const [row] = await this.db.insert(projects).values({ name, ownerId }).returning();
    return row;
  }

  async list(ownerId: string) {
    return this.db
      .select()
      .from(projects)
      .where(eq(projects.ownerId, ownerId))
      .orderBy(asc(projects.createdAt));
  }
  async getOwnedById(projectId: string, ownerId: string) {
    const rows = await this.db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, ownerId)))
      .limit(1);
    return rows[0] ?? null;
  }
}
