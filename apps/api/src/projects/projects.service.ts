import { Inject, Injectable } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { asc } from 'drizzle-orm';
import * as schema from '../db/schema';
import { projects } from '../db/schema';

@Injectable()
export class ProjectsService {
  constructor(@Inject('DB') private readonly db: NodePgDatabase<typeof schema>) {}

  async create(name: string) {
    const [row] = await this.db.insert(projects).values({ name }).returning();
    return row;
  }

  async list() {
    return this.db.select().from(projects).orderBy(asc(projects.createdAt));
  }
}
