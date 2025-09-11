import { Inject, Injectable, ConflictException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import { users } from '../db/schema';

@Injectable()
export class UsersService {
  constructor(@Inject('DB') private readonly db: NodePgDatabase<typeof schema>) {}

  async findByEmail(email: string) {
    const rows = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return rows[0] ?? null;
  }

  async create(email: string, passwordHash: string) {
    try {
      const [row] = await this.db.insert(users).values({ email, passwordHash }).returning();
      return row;
    } catch (e: any) {
      if (e?.code === '23505') {
        throw new ConflictException({ error: 'EMAIL_IN_USE' });
      }
      throw e;
    }
  }
}
