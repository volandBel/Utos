import { z } from 'zod';

const uuid = z.string().uuid();
const iso = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), { message: 'Invalid ISO date-time' });

const ArtifactRefSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum([
      'screenshot',
      'visualBaseline',
      'visualDiff',
      'consoleLog',
      'trace',
      'networkLog',
      'ocrText',
    ]),
    name: z.string().optional(),
    contentType: z.string().optional(),
    bytes: z.number().int().nonnegative().optional(),
    sha256: z.string().optional(),
    path: z.string().optional(),
    url: z.string().url().optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((o) => !(o.path && o.url), { message: 'Provide either path or url (not both)' });

const StepResultSchema = z.object({
  index: z.number().int().nonnegative(),
  action: z.string().min(1),
  startedAt: iso,
  endedAt: iso,
  status: z.enum(['passed', 'failed', 'skipped', 'error']),
  error: z.object({ message: z.string(), stack: z.string().optional() }).optional(),
  attachments: z.array(ArtifactRefSchema).optional(),
});

export const RunnerEnvSchema = z.object({
  os: z.string(),
  osVersion: z.string().optional(),
  cpu: z.string().optional(),
  memoryMB: z.number().int().positive().optional(),
  node: z.string(),
  runner: z.string(),
  runnerVersion: z.string(),
  browser: z.string().optional(),
  browserVersion: z.string().optional(),
});

export const RunnerResultSchema = z.object({
  jobId: uuid,
  testId: uuid,
  startedAt: iso,
  endedAt: iso,
  status: z.enum(['passed', 'failed', 'error', 'aborted']),
  steps: z.array(StepResultSchema),
  artifacts: z.array(ArtifactRefSchema),
  env: RunnerEnvSchema,
  stats: z
    .object({
      stepsPassed: z.number().int().nonnegative(),
      stepsFailed: z.number().int().nonnegative(),
      screenshots: z.number().int().nonnegative(),
      diffs: z.number().int().nonnegative(),
    })
    .optional(),
  error: z.object({ message: z.string(), stack: z.string().optional() }).optional(),
});

export type RunnerResultInput = z.infer<typeof RunnerResultSchema>;
