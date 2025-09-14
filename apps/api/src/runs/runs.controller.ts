import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RunsService } from './runs.service';
import { IsUUID } from 'class-validator';

class ListRunsQueryDto {
  @IsUUID()
  testId!: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/runs')
export class RunsController {
  constructor(private readonly runs: RunsService) {}

  @Post('result')
  result(@Body() body: unknown) {
    return this.runs.acceptResult(body);
  }

  @Get()
  async list(@Req() req: any, @Query() q: ListRunsQueryDto) {
    const rows = await this.runs.listByTest(req.user.sub, q.testId);
    return rows.map((r) => ({
      id: r.id,
      job_id: r.jobId,
      test_id: r.testId,
      project_id: r.projectId,
      status: r.status,
      started_at: r.startedAt,
      ended_at: r.endedAt,
      created_at: r.createdAt,
    }));
  }
}
