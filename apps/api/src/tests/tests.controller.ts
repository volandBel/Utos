import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';

@Controller('api/v1/tests')
export class TestsController {
  constructor(private readonly service: TestsService) {}

  @Post()
  async create(@Body() dto: CreateTestDto) {
    const t = await this.service.create({ projectId: dto.projectId, name: dto.name, dsl: dto.dsl });
    return { id: t.id, project_id: t.projectId, name: t.name, created_at: t.createdAt };
  }

  @Get()
  async list(@Query('projectId') projectId: string) {
    const rows = await this.service.listByProject(projectId);
    return rows.map((t) => ({
      id: t.id,
      project_id: t.projectId,
      name: t.name,
      created_at: t.createdAt,
    }));
  }
}
