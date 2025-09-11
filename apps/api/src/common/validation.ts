import type { ZodError, ZodIssue } from 'zod';

function pathToString(path: (string | number)[]) {
  return path
    .map((p) => (typeof p === 'number' ? `[${p}]` : (path.indexOf(p) === 0 ? p : `.${p}`)))
    .join('');
}

export function formatZodIssues(err: ZodError) {
  return err.issues.map((i: ZodIssue) => ({
    path: pathToString(i.path as any),
    code: i.code,
    message: i.message,
  }));
}
