import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { ListTestsQueryDto } from './dto/list-tests.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/tests')
export class TestsController {
  constructor(private readonly service: TestsService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateTestDto) {
    const ownerId: string = req.user.sub;
    const t = await this.service.create(ownerId, { projectId: dto.projectId, name: dto.name, dsl: dto.dsl });
    return { id: t.id, project_id: t.projectId, name: t.name, created_at: t.createdAt };
  }

  @Get()
  async list(@Req() req: any, @Query() q: ListTestsQueryDto) {
    const ownerId: string = req.user.sub;
    const rows = await this.service.listByProject(ownerId, q.projectId);
    return rows.map((t) => ({ id: t.id, project_id: t.projectId, name: t.name, created_at: t.createdAt }));
  }
}
