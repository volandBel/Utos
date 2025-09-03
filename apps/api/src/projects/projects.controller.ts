import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('api/v1/projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Post()
  async create(@Body() dto: CreateProjectDto) {
    const p = await this.service.create(dto.name);
    return { id: p.id, name: p.name, created_at: p.createdAt };
  }

  @Get()
  async list() {
    const rows = await this.service.list();
    return rows.map((p) => ({ id: p.id, name: p.name, created_at: p.createdAt }));
  }
}
