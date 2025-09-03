import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const tests = pgTable('tests', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  dslJson: jsonb('dsl_json').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Типы — удобно потом использовать в контроллерах/сервисах
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Test = typeof tests.$inferSelect;
export type NewTest = typeof tests.$inferInsert;
