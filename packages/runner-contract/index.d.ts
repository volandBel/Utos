// ===== Generic helper types =====
export type UUID = string;
export type ISODateTime = string;

// ===== Job sent to runner =====
export interface RunnerJob {
  jobId: UUID;
  projectId: UUID;
  testId: UUID;
  createdAt: ISODateTime;
  // DSL уже провалидирован на стороне API. Здесь не дублируем схему, чтобы не плодить копии.
  dsl: unknown;

  meta?: {
    trigger?: 'manual' | 'ci' | 'schedule' | 'api';
    branch?: string;
    commit?: string;
    author?: string;
    ci?: Record<string, string>;
  };

  options?: {
    browser?: 'chromium' | 'firefox' | 'webkit';
    viewport?: { width: number; height: number };
    baseUrl?: string;
    locale?: string;
    visual?: { updateBaseline?: boolean };
    timeouts?: { actionMs?: number; testMs?: number };
  };
}

// ===== Artifacts & steps =====
export type ArtifactType =
  | 'screenshot'
  | 'visualBaseline'
  | 'visualDiff'
  | 'consoleLog'
  | 'trace'
  | 'networkLog'
  | 'ocrText';

export interface ArtifactRef {
  id: string;
  type: ArtifactType;
  name?: string;
  contentType?: string;
  bytes?: number;
  sha256?: string;
  // Ровно одно из:
  path?: string; // локальный путь (агент)
  url?: string;  // загружено и доступно по URL
  meta?: Record<string, unknown>;
}

export type StepStatus = 'passed' | 'failed' | 'skipped' | 'error';

export interface StepResult {
  index: number;              // индекс действия в DSL
  action: string;             // имя действия (например, "open", "click", ...)
  startedAt: ISODateTime;
  endedAt: ISODateTime;
  status: StepStatus;
  error?: { message: string; stack?: string };
  attachments?: ArtifactRef[]; // скриншоты/логи для шага
}

// ===== Result returned by runner =====
export type RunStatus = 'passed' | 'failed' | 'error' | 'aborted';

export interface RunnerEnv {
  os: string;                 // "Windows 11", "Ubuntu 22.04", ...
  osVersion?: string;
  cpu?: string;
  memoryMB?: number;
  node: string;               // версия Node
  runner: string;             // имя раннера, напр. "ui-playwright"
  runnerVersion: string;
  browser?: string;
  browserVersion?: string;
}

export interface RunnerResult {
  jobId: UUID;
  testId: UUID;
  startedAt: ISODateTime;
  endedAt: ISODateTime;
  status: RunStatus;
  steps: StepResult[];
  artifacts: ArtifactRef[];   // общие артефакты прогона (например, trace.zip)
  env: RunnerEnv;
  stats?: {
    stepsPassed: number;
    stepsFailed: number;
    screenshots: number;
    diffs: number;
  };
  error?: { message: string; stack?: string };
}

// ===== Optional side channel =====
export interface Heartbeat {
  jobId: UUID;
  at: ISODateTime;
  progressPct?: number;       // 0..100
  note?: string;
}

// Для простых протоколов обмена (webhook/queue)
export type RunnerMessage =
  | { type: 'result'; payload: RunnerResult }
  | { type: 'heartbeat'; payload: Heartbeat };
