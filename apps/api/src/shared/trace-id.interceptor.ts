import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Observable, map } from 'rxjs';

@Injectable()
export class TraceIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req: any = http.getRequest();
    const res: any = http.getResponse();

    const traceId = req?.id ?? req?.headers?.['x-request-id'] ?? randomUUID();

    if (res?.header) res.header('x-trace-id', traceId);

    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          return { trace_id: (data as any).trace_id ?? traceId, ...data };
        }
        return { trace_id: traceId, data };
      }),
    );
  }
}
