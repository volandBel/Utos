import { pgTable, uuid, text, timestamp, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';

// --- users ---
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    usersEmailUnique: uniqueIndex('users_email_unique').on(t.email),
  })
);

// --- projects --- (owner_id -> users.id)
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  ownerId: uuid('owner_id').references(() => users.id), // nullable: чтобы не ломать старые строки
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- tests --- (project_id -> projects.id)
export const tests = pgTable('tests', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  name: text('name').notNull(),
  dslJson: jsonb('dsl_json').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- runs --- (test_id -> tests.id, project_id -> projects.id)
export const runs = pgTable('runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id').notNull(),
  testId: uuid('test_id').notNull().references(() => tests.id),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  status: text('status').$type<'passed' | 'failed' | 'error' | 'aborted'>().notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }).notNull(),
  resultJson: jsonb('result_json').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
// --- artifacts ---
export const artifacts = pgTable('artifacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  runId: uuid('run_id')
    .notNull()
    .references(() => runs.id), // связь с run
  type: text('type').notNull(), // screenshot, trace, video
  path: text('path').notNull(), // относительный путь или URL
  bytes: text('bytes').notNull(), // размер файла (в будущем bigint, пока text)
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Типы (удобно для сервисов)
export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Test = typeof tests.$inferSelect;
export type Run = typeof runs.$inferSelect;
export type Artifact = typeof artifacts.$inferSelect;
